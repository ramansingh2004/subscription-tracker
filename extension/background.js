// background.js - Service Worker for Chrome Extension

const API_BASE_URL = 'https://subscription-tracker-five-puce.vercel.app'; // Change to your domain
const TRACKING_INTERVAL = 5000; // Send data every 5 seconds
const BATCH_SIZE = 50; // Send up to 50 events per request

let eventQueue = [];
let pageHistory = new Map();
let currentActiveTab = null;
let authToken = null;
let userId = null;
let extensionEnabled = true;

let initPromise = null;
function ensureInitialized() {
  if (!initPromise) {
    initPromise = initializeExtension();
  }
  return initPromise;
}

// ============ INITIALIZATION ============

chrome.runtime.onInstalled.addListener(() => {
  console.log('SubTrack Extension installed');
  ensureInitialized();
  openOnboardingPage();
});

async function initializeExtension() {
  try {
    const stored = await chrome.storage.local.get(['authToken', 'userId', 'enabled']);
    authToken = stored.authToken || null;
    userId = stored.userId || null;
    extensionEnabled = stored.enabled !== false;

    console.log('Extension initialized:', { userId, enabled: extensionEnabled });

    if (authToken && userId) {
      startTracking();
    }
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

// ============ TAB TRACKING ============

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    await ensureInitialized();
    if (!extensionEnabled || !authToken) return;

    if (currentActiveTab) {
      const prevTab = await chrome.tabs.get(currentActiveTab);
      if (prevTab) {
        savePageData(currentActiveTab, prevTab);
      }
    }

    currentActiveTab = activeInfo.tabId;
    const tab = await chrome.tabs.get(activeInfo.tabId);

    if (tab.url) {
      trackPageVisit(tab);
    }
  } catch (error) {
    console.error('Tab activation error:', error);
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  try {
    await ensureInitialized();
    if (!extensionEnabled || !authToken) return;

    if (changeInfo.status === 'complete' && tab.url) {
      trackPageVisit(tab);
    }
  } catch (error) {
    console.error('Tab update error:', error);
  }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  try {
    await ensureInitialized();
    if (currentActiveTab === tabId) {
      currentActiveTab = null;
    }
    pageHistory.delete(String(tabId));
  } catch (error) {
    console.error('Tab removal error:', error);
  }
});

// ============ TRACKING FUNCTIONS ============

function trackPageVisit(tab) {
  if (!tab.url || tab.url.startsWith('chrome://')) return;

  try {
    const domain = new URL(tab.url).hostname;
    const event = {
      type: 'page_visit',
      domain,
      url: tab.url,
      timestamp: Date.now(),
      metadata: {
        title: tab.title,
        favicon: tab.favIconUrl,
      },
    };

    eventQueue.push(event);

    pageHistory.set(String(tab.id), {
      domain,
      url: tab.url,
      title: tab.title || '',
      favicon: tab.favIconUrl,
      startTime: Date.now(),
      adDetected: false,
      paywallDetected: false,
    });

    console.log('Page visit tracked:', domain);
  } catch (error) {
    console.error('Track page visit error:', error);
  }
}

function savePageData(tabId) {
  try {
    const pageData = pageHistory.get(String(tabId));
    if (!pageData) return;

    const timeSpent = Date.now() - pageData.startTime;

    if (timeSpent > 3000) {
      const event = {
        type: 'time_on_page',
        domain: pageData.domain,
        url: pageData.url,
        timestamp: Date.now(),
        metadata: {
          timeSpent,
          title: pageData.title,
        },
      };

      eventQueue.push(event);
      console.log(`Time tracked: ${pageData.domain} - ${timeSpent}ms`);
    }

    pageHistory.delete(String(tabId));
  } catch (error) {
    console.error('Save page data error:', error);
  }
}

// ============ MESSAGE HANDLING ============

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  ensureInitialized().then(() => {
    try {
      if (request.type === 'AD_DETECTED') {
        trackAdDetected(sender.tab);
        sendResponse({ success: true });
      } else if (request.type === 'PAYWALL_DETECTED') {
        trackPaywallDetected(sender.tab);
        sendResponse({ success: true });
      } else if (request.type === 'SUBSCRIPTION_MENTION') {
        trackSubscriptionMention(sender.tab, request.data);
        sendResponse({ success: true });
      } else if (request.type === 'SET_AUTH') {
        setAuthentication(request.token, request.userId);
        sendResponse({ success: true });
      } else if (request.type === 'GET_AUTH') {
        sendResponse({ token: authToken, userId });
      } else if (request.type === 'ENABLE_TRACKING') {
        enableTracking();
        sendResponse({ success: true });
      } else if (request.type === 'DISABLE_TRACKING') {
        disableTracking();
        sendResponse({ success: true });
      }
    } catch (error) {
      console.error('Message handling error:', error);
      sendResponse({ error: error.message });
    }
  });
  return true; // Keep the message channel open for the async response
});

function trackAdDetected(tab) {
  if (!tab || !tab.url) return;

  try {
    const domain = new URL(tab.url).hostname;
    const event = {
      type: 'ad_detected',
      domain,
      url: tab.url,
      timestamp: Date.now(),
    };

    eventQueue.push(event);

    const pageData = pageHistory.get(String(tab.id));
    if (pageData) {
      pageData.adDetected = true;
    }

    console.log('Ad detected:', domain);
  } catch (error) {
    console.error('Track ad error:', error);
  }
}

function trackPaywallDetected(tab) {
  if (!tab || !tab.url) return;

  try {
    const domain = new URL(tab.url).hostname;
    const event = {
      type: 'paywall_detected',
      domain,
      url: tab.url,
      timestamp: Date.now(),
    };

    eventQueue.push(event);

    const pageData = pageHistory.get(String(tab.id));
    if (pageData) {
      pageData.paywallDetected = true;
    }

    console.log('Paywall detected:', domain);
  } catch (error) {
    console.error('Track paywall error:', error);
  }
}

function trackSubscriptionMention(tab, data) {
  if (!tab || !tab.url) return;

  try {
    const domain = new URL(tab.url).hostname;
    const event = {
      type: 'subscription_mention',
      domain,
      url: tab.url,
      timestamp: Date.now(),
      metadata: {
        mentions: data?.mentions || [],
        context: data?.context,
      },
    };

    eventQueue.push(event);

    const pageData = pageHistory.get(String(tab.id));
    if (pageData) {
      pageData.subscriptionMentions = data?.mentions || [];
    }

    console.log('Subscription mention:', domain, data?.mentions);
  } catch (error) {
    console.error('Track subscription error:', error);
  }
}

// ============ BATCH SENDING ============

function startTracking() {
  console.log('Tracking started');
  setInterval(sendBatchedEvents, TRACKING_INTERVAL);
}

async function sendBatchedEvents() {
  try {
    if (!authToken || !userId || eventQueue.length === 0) return;

    const eventsToSend = eventQueue.splice(0, BATCH_SIZE);

    const response = await fetch(`${API_BASE_URL}/api/extension/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        userId,
        events: eventsToSend,
        timestamp: Date.now(),
      }),
    });

    if (!response.ok) {
      eventQueue.unshift(...eventsToSend);
      console.error('Batch send failed:', response.status);

      if (response.status === 401) {
        clearAuthentication();
      }
    } else {
      console.log(`Sent ${eventsToSend.length} events`);
    }
  } catch (error) {
    console.error('Batch send error:', error);
  }
}

// ============ AUTHENTICATION ============

function setAuthentication(token, uid) {
  try {
    authToken = token;
    userId = uid;
    extensionEnabled = true;

    chrome.storage.local.set({ authToken, userId, enabled: true });
    startTracking();

    console.log('Authentication set');
  } catch (error) {
    console.error('Auth error:', error);
  }
}

function clearAuthentication() {
  try {
    authToken = null;
    userId = null;
    extensionEnabled = false;

    chrome.storage.local.set({ authToken: null, userId: null, enabled: false });
    eventQueue = [];

    console.log('Authentication cleared');
  } catch (error) {
    console.error('Clear auth error:', error);
  }
}

function enableTracking() {
  extensionEnabled = true;
  chrome.storage.local.set({ enabled: true });
  if (authToken) {
    startTracking();
  }
}

function disableTracking() {
  extensionEnabled = false;
  chrome.storage.local.set({ enabled: false });
}

// ============ HELPERS ============

function openOnboardingPage() {
  try {
    chrome.tabs.create({
      url: chrome.runtime.getURL('onboarding.html'),
    });
  } catch (error) {
    console.error('Onboarding error:', error);
  }
}

ensureInitialized();