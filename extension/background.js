const API_BASE_URL = 'https://subscription-tracker-five-puce.vercel.app';
const TRACK_ENDPOINT = `${API_BASE_URL}/api/extension/track`;
const SEND_ALARM = 'subtrack-send-events';
const SEND_INTERVAL_MINUTES = 1;
const BATCH_SIZE = 50;
const MAX_QUEUE_SIZE = 500;

const AUTH_KEYS = ['authToken', 'userId', 'enabled'];
const STAT_KEYS = [
  'statsDate',
  'todayPagesVisited',
  'todayTimeOnSubs',
  'todayAdsDetected',
  'todayPaywallsFound',
];

let authToken = null;
let userId = null;
let extensionEnabled = true;
let eventQueue = [];
let pageSessions = {};
let currentActiveTabId = null;
let initialized = false;
let sendingBatch = false;
let initPromise = null;

function ensureInitialized() {
  if (!initPromise) {
    initPromise = initializeExtension().catch((error) => {
      initPromise = null;
      throw error;
    });
  }
  return initPromise;
}

async function initializeExtension() {
  const stored = await chrome.storage.local.get([
    ...AUTH_KEYS,
    'eventQueue',
    'pageSessions',
  ]);

  authToken = stored.authToken || null;
  userId = stored.userId || null;
  extensionEnabled = stored.enabled !== false;
  eventQueue = Array.isArray(stored.eventQueue) ? stored.eventQueue : [];
  pageSessions = stored.pageSessions || {};

  await resetDailyStatsIfNeeded();
  await ensureSendAlarm();
  initialized = true;

  if (extensionEnabled && authToken) {
    const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (activeTab?.id && isTrackableUrl(activeTab.url)) {
      currentActiveTabId = activeTab.id;
      if (!pageSessions[String(activeTab.id)]) {
        await trackPageVisit(activeTab);
      }
    }
  }

  console.log('SubTrack initialized', {
    authenticated: Boolean(authToken && userId),
    enabled: extensionEnabled,
    queuedEvents: eventQueue.length,
  });
}

chrome.runtime.onInstalled.addListener(async (details) => {
  try {
    await ensureInitialized();
    if (details.reason === 'install') {
      await chrome.tabs.create({ url: chrome.runtime.getURL('onboarding.html') });
    }
  } catch (error) {
    console.error('Installation initialization failed:', error);
  }
});

chrome.runtime.onStartup.addListener(() => {
  ensureInitialized().catch((error) => {
    console.error('Startup initialization failed:', error);
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === SEND_ALARM) {
    ensureInitialized()
      .then(sendBatchedEvents)
      .catch((error) => console.error('Scheduled send failed:', error));
  }
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    await ensureInitialized();
    if (!canTrack()) return;

    if (currentActiveTabId && currentActiveTabId !== tabId) {
      await finishPageSession(currentActiveTabId);
    }

    currentActiveTabId = tabId;
    const tab = await chrome.tabs.get(tabId);
    if (isTrackableUrl(tab.url)) {
      await trackPageVisit(tab);
    }
  } catch (error) {
    console.error('Tab activation error:', error);
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  try {
    await ensureInitialized();
    if (!canTrack() || changeInfo.status !== 'complete' || !tab.active) return;

    await finishPageSession(tabId);
    currentActiveTabId = tabId;

    if (isTrackableUrl(tab.url)) {
      await trackPageVisit(tab);
    }
  } catch (error) {
    console.error('Tab update error:', error);
  }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  try {
    await ensureInitialized();
    await finishPageSession(tabId);
    if (currentActiveTabId === tabId) currentActiveTabId = null;
  } catch (error) {
    console.error('Tab removal error:', error);
  }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  try {
    await ensureInitialized();
    if (!canTrack()) return;

    if (windowId === chrome.windows.WINDOW_ID_NONE) {
      if (currentActiveTabId) await finishPageSession(currentActiveTabId);
      currentActiveTabId = null;
      return;
    }

    const [tab] = await chrome.tabs.query({ active: true, windowId });
    if (!tab?.id) return;

    if (currentActiveTabId && currentActiveTabId !== tab.id) {
      await finishPageSession(currentActiveTabId);
    }

    currentActiveTabId = tab.id;
    if (isTrackableUrl(tab.url) && !pageSessions[String(tab.id)]) {
      await trackPageVisit(tab);
    }
  } catch (error) {
    console.error('Window focus error:', error);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  handleMessage(request, sender)
    .then(sendResponse)
    .catch((error) => {
      console.error('Message handling error:', error);
      sendResponse({ success: false, error: error.message });
    });

  return true;
});

async function handleMessage(request, sender) {
  await ensureInitialized();

  switch (request?.type) {
    case 'AD_DETECTED':
      await trackDetection('ad_detected', sender.tab);
      return { success: true };
    case 'PAYWALL_DETECTED':
      await trackDetection('paywall_detected', sender.tab);
      return { success: true };
    case 'SUBSCRIPTION_MENTION':
      await trackSubscriptionMention(sender.tab, request.data);
      return { success: true };
    case 'SET_AUTH':
      await setAuthentication(request.token, request.userId);
      return { success: true };
    case 'GET_AUTH':
      return { token: authToken, userId };
    case 'GET_STATE':
      return {
        authenticated: Boolean(authToken && userId),
        userId,
        enabled: extensionEnabled,
      };
    case 'ENABLE_TRACKING':
      await enableTracking();
      return { success: true, enabled: true };
    case 'DISABLE_TRACKING':
      await disableTracking();
      return { success: true, enabled: false };
    case 'LOGOUT':
      await clearAuthentication({ clearQueue: true });
      return { success: true };
    case 'SEND_EVENTS_NOW':
      await sendBatchedEvents();
      return { success: true };
    default:
      return { success: false, error: 'Unknown message type' };
  }
}

function canTrack() {
  return initialized && extensionEnabled && Boolean(authToken && userId);
}

function isTrackableUrl(url) {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

async function trackPageVisit(tab) {
  if (!canTrack() || !tab?.id || !isTrackableUrl(tab.url)) return;

  const key = String(tab.id);
  const existing = pageSessions[key];
  if (existing?.url === tab.url) return;
  if (existing) await finishPageSession(tab.id);

  const domain = new URL(tab.url).hostname;
  pageSessions[key] = {
    domain,
    url: tab.url,
    title: tab.title || '',
    startTime: Date.now(),
    adDetected: false,
    paywallDetected: false,
    hasSubscriptionSignal: false,
  };

  await Promise.all([
    enqueueEvent({
      type: 'page_visit',
      domain,
      url: tab.url,
      timestamp: Date.now(),
      metadata: { title: tab.title || '', favicon: tab.favIconUrl || null },
    }),
    incrementDailyStat('todayPagesVisited', 1),
    persistPageSessions(),
  ]);
}

async function finishPageSession(tabId) {
  const key = String(tabId);
  const session = pageSessions[key];
  if (!session) return;

  delete pageSessions[key];
  const timeSpent = Math.max(0, Date.now() - session.startTime);

  const operations = [persistPageSessions()];
  if (timeSpent >= 3000) {
    operations.push(
      enqueueEvent({
        type: 'time_on_page',
        domain: session.domain,
        url: session.url,
        timestamp: Date.now(),
        metadata: { timeSpent, title: session.title },
      })
    );

    if (session.hasSubscriptionSignal) {
      operations.push(incrementDailyStat('todayTimeOnSubs', timeSpent));
    }
  }

  await Promise.all(operations);
}

async function trackDetection(type, tab) {
  if (!canTrack() || !tab?.id || !isTrackableUrl(tab.url)) return;

  const key = String(tab.id);
  const flag = type === 'ad_detected' ? 'adDetected' : 'paywallDetected';
  const session = pageSessions[key];
  if (session?.[flag]) return;

  if (session) {
    session[flag] = true;
    await persistPageSessions();
  }

  const domain = new URL(tab.url).hostname;
  await Promise.all([
    enqueueEvent({ type, domain, url: tab.url, timestamp: Date.now() }),
    incrementDailyStat(
      type === 'ad_detected' ? 'todayAdsDetected' : 'todayPaywallsFound',
      1
    ),
  ]);
}

async function trackSubscriptionMention(tab, data) {
  if (!canTrack() || !tab?.id || !isTrackableUrl(tab.url)) return;

  const mentions = Array.isArray(data?.mentions) ? [...new Set(data.mentions)] : [];
  if (mentions.length === 0) return;

  const session = pageSessions[String(tab.id)];
  const signature = mentions.slice().sort().join('|');
  if (session?.subscriptionSignature === signature) return;

  if (session) {
    session.hasSubscriptionSignal = true;
    session.subscriptionSignature = signature;
    await persistPageSessions();
  }

  await enqueueEvent({
    type: 'subscription_mention',
    domain: new URL(tab.url).hostname,
    url: tab.url,
    timestamp: Date.now(),
    metadata: { mentions, context: data?.context || tab.title || '' },
  });
}

async function enqueueEvent(event) {
  eventQueue.push(event);
  if (eventQueue.length > MAX_QUEUE_SIZE) {
    eventQueue = eventQueue.slice(-MAX_QUEUE_SIZE);
  }
  await chrome.storage.local.set({ eventQueue });
}

async function persistPageSessions() {
  await chrome.storage.local.set({ pageSessions });
}

async function sendBatchedEvents() {
  if (sendingBatch || !canTrack() || eventQueue.length === 0) return;

  sendingBatch = true;
  const eventsToSend = eventQueue.slice(0, BATCH_SIZE);

  try {
    const response = await fetch(TRACK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ userId, events: eventsToSend, timestamp: Date.now() }),
    });

    if (response.ok) {
      eventQueue.splice(0, eventsToSend.length);
      await chrome.storage.local.set({ eventQueue });
      return;
    }

    const responseText = await response.text();
    console.error('Event batch rejected:', response.status, responseText.slice(0, 300));

    if (response.status === 401) {
      await clearAuthentication({ clearQueue: false });
    }
  } catch (error) {
    // The queue is intentionally kept for the next alarm/network recovery.
    console.error('Event batch network error:', error);
  } finally {
    sendingBatch = false;
  }
}

async function setAuthentication(token, uid) {
  if (!token || !uid) throw new Error('Invalid authentication response');

  authToken = token;
  userId = uid;
  extensionEnabled = true;
  await chrome.storage.local.set({ authToken, userId, enabled: true });

  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (tab?.id && isTrackableUrl(tab.url)) {
    currentActiveTabId = tab.id;
    await trackPageVisit(tab);
  }
}

async function clearAuthentication({ clearQueue }) {
  if (currentActiveTabId) await finishPageSession(currentActiveTabId);

  authToken = null;
  userId = null;
  extensionEnabled = false;
  currentActiveTabId = null;
  pageSessions = {};

  const update = {
    authToken: null,
    userId: null,
    enabled: false,
    pageSessions: {},
  };

  if (clearQueue) {
    eventQueue = [];
    update.eventQueue = [];
  }

  await chrome.storage.local.set(update);
}

async function enableTracking() {
  if (!authToken || !userId) throw new Error('Sign in before enabling tracking');
  extensionEnabled = true;
  await chrome.storage.local.set({ enabled: true });

  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (tab?.id && isTrackableUrl(tab.url)) {
    currentActiveTabId = tab.id;
    await trackPageVisit(tab);
  }
}

async function disableTracking() {
  if (currentActiveTabId) await finishPageSession(currentActiveTabId);
  extensionEnabled = false;
  currentActiveTabId = null;
  await chrome.storage.local.set({ enabled: false });
}

async function ensureSendAlarm() {
  const existing = await chrome.alarms.get(SEND_ALARM);
  if (!existing) {
    await chrome.alarms.create(SEND_ALARM, {
      delayInMinutes: SEND_INTERVAL_MINUTES,
      periodInMinutes: SEND_INTERVAL_MINUTES,
    });
  }
}

function getLocalDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function resetDailyStatsIfNeeded() {
  const today = getLocalDateKey();
  const stored = await chrome.storage.local.get(STAT_KEYS);
  if (stored.statsDate === today) return;

  await chrome.storage.local.set({
    statsDate: today,
    todayPagesVisited: 0,
    todayTimeOnSubs: 0,
    todayAdsDetected: 0,
    todayPaywallsFound: 0,
  });
}

async function incrementDailyStat(key, amount) {
  await resetDailyStatsIfNeeded();
  const stored = await chrome.storage.local.get(key);
  await chrome.storage.local.set({ [key]: (Number(stored[key]) || 0) + amount });
}

ensureInitialized().catch((error) => {
  console.error('SubTrack initialization failed:', error);
});
