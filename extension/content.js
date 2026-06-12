// content.js - Runs on every page to detect ads, paywalls, subscriptions

(function () {
  'use strict';

  // ============ AD DETECTION ============

  function detectAds() {
    try {
      const adSelectors = [
        '[data-ad-slot]',
        '[data-ad-client]',
        'div.adsbygoogle',
        'iframe[src*="ads"]',
        'div[id*="ad"]',
        'div[id*="advertisement"]',
        'div[class*="ad-"]',
        'div[class*="ad_"]',
        'div[class*="advertisement"]',
        '.advertisement__container',
        '[data-component="Advertisement"]',
      ];

      let adsFound = false;

      for (const selector of adSelectors) {
        if (document.querySelector(selector)) {
          adsFound = true;
          break;
        }
      }

      if (adsFound) {
        chrome.runtime.sendMessage({ type: 'AD_DETECTED' });
      }
    } catch (error) {
      console.log('Ad detection error:', error);
    }
  }

  // ============ PAYWALL DETECTION ============

  function detectPaywall() {
    try {
      const paywallPatterns = [
        /paywall/i,
        /subscribe to read/i,
        /subscription required/i,
        /sign up to continue/i,
        /read full story/i,
        /limited articles/i,
        /membership required/i,
        /unlock unlimited/i,
        /continue reading/i,
        /view the rest/i,
      ];

      if (!document.body) return;
      const bodyText = document.body.innerText.toLowerCase();
      const hasPaywallText = paywallPatterns.some((pattern) =>
        pattern.test(bodyText)
      );

      const paywallSelectors = [
        '[class*="paywall"]',
        '[id*="paywall"]',
        '[class*="subscription-prompt"]',
        '[class*="meter"]',
        '[class*="metering"]',
        'div[data-paywall-id]',
      ];

      const hasPaywallElement = paywallSelectors.some((selector) =>
        document.querySelector(selector)
      );

      if (hasPaywallText || hasPaywallElement) {
        chrome.runtime.sendMessage({ type: 'PAYWALL_DETECTED' });
      }
    } catch (error) {
      console.log('Paywall detection error:', error);
    }
  }

  // ============ SUBSCRIPTION MENTION DETECTION ============

  function detectSubscriptionMentions() {
    try {
      const subscriptionKeywords = [
        'subscription',
        'monthly plan',
        'annual plan',
        'yearly plan',
        'premium membership',
        'pro account',
        'pro plan',
        'pricing',
        'plans',
        'billing',
        'renew',
        'auto-renew',
        'recurring charge',
        'credit card',
        'payment method',
      ];

      if (!document.body) return;
      const bodyText = document.body.innerText.toLowerCase();
      const found = [];

      for (const keyword of subscriptionKeywords) {
        if (bodyText.includes(keyword.toLowerCase())) {
          found.push(keyword);
        }
      }

      if (found.length > 0) {
        chrome.runtime.sendMessage({
          type: 'SUBSCRIPTION_MENTION',
          data: {
            mentions: found,
            context: document.title,
          },
        });
      }
    } catch (error) {
      console.log('Subscription detection error:', error);
    }
  }

  // ============ INITIALIZATION ============

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        detectAds();
        detectPaywall();
        detectSubscriptionMentions();
      }, 1000);
    });
  } else {
    setTimeout(() => {
      detectAds();
      detectPaywall();
      detectSubscriptionMentions();
    }, 500);
  }

  const observer = new MutationObserver(
    debounce(() => {
      detectAds();
      detectPaywall();
      detectSubscriptionMentions();
    }, 2000)
  );

  observer.observe(document.documentElement || document, {
    childList: true,
    subtree: true,
  });

  // ============ HELPERS ============

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }
})();