(() => {
  'use strict';

  let adReported = false;
  let paywallReported = false;
  let lastSubscriptionSignature = '';

  const AD_SELECTORS = [
    '[data-ad-slot]',
    '[data-ad-client]',
    '.adsbygoogle',
    'iframe[src*="doubleclick.net"]',
    'iframe[src*="googlesyndication.com"]',
    '[id^="google_ads_"]',
    '[class~="advertisement"]',
    '[data-component="Advertisement"]',
  ];

  const PAYWALL_PATTERNS = [
    /subscribe to (?:read|continue)/i,
    /subscription required/i,
    /sign (?:up|in) to continue/i,
    /you(?:'ve| have) reached your (?:article|free) limit/i,
    /membership required/i,
    /unlock unlimited/i,
  ];

  const PAYWALL_SELECTORS = [
    '[class*="paywall"]',
    '[id*="paywall"]',
    '[class*="subscription-prompt"]',
    '[data-paywall-id]',
    '[data-testid*="paywall"]',
  ];

  const SUBSCRIPTION_KEYWORDS = [
    'subscription',
    'monthly plan',
    'annual plan',
    'yearly plan',
    'premium membership',
    'pro account',
    'pro plan',
    'recurring charge',
    'auto-renew',
    'payment method',
  ];

  async function sendMessage(message) {
    try {
      await chrome.runtime.sendMessage(message);
    } catch (error) {
      // This can happen briefly while an unpacked extension is being reloaded.
      if (!String(error?.message || error).includes('Extension context invalidated')) {
        console.debug('SubTrack message skipped:', error);
      }
    }
  }

  function getPageText() {
    if (!document.body) return '';
    // Limit scanning so large/infinite pages do not cause repeated expensive work.
    return (document.body.innerText || '').slice(0, 500000).toLowerCase();
  }

  async function runDetection() {
    if (!document.body) return;

    const pageText = getPageText();

    if (!adReported && AD_SELECTORS.some((selector) => document.querySelector(selector))) {
      adReported = true;
      await sendMessage({ type: 'AD_DETECTED' });
    }

    if (
      !paywallReported &&
      (PAYWALL_PATTERNS.some((pattern) => pattern.test(pageText)) ||
        PAYWALL_SELECTORS.some((selector) => document.querySelector(selector)))
    ) {
      paywallReported = true;
      await sendMessage({ type: 'PAYWALL_DETECTED' });
    }

    const mentions = SUBSCRIPTION_KEYWORDS.filter((keyword) =>
      pageText.includes(keyword)
    );
    const signature = mentions.join('|');

    if (mentions.length > 0 && signature !== lastSubscriptionSignature) {
      lastSubscriptionSignature = signature;
      await sendMessage({
        type: 'SUBSCRIPTION_MENTION',
        data: { mentions, context: document.title },
      });
    }
  }

  const debouncedDetection = debounce(runDetection, 1500);

  runDetection();

  const observer = new MutationObserver(debouncedDetection);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  window.addEventListener('pagehide', () => observer.disconnect(), { once: true });

  function debounce(fn, wait) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), wait);
    };
  }
})();
