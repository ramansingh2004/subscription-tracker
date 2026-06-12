// popup.js - Popup UI logic

let currentUser = null;
let trackingEnabled = true;

// ============ INITIALIZATION ============

document.addEventListener('DOMContentLoaded', async () => {
  await checkAuthStatus();
  setupEventListeners();
  loadStats();
});

async function checkAuthStatus() {
  try {
    const stored = await chrome.storage.local.get(['authToken', 'userId']);

    if (stored.authToken && stored.userId) {
      currentUser = stored.userId;
      showMainView();
      loadStats();
    } else {
      showLoginView();
    }
  } catch (error) {
    console.error('Auth check error:', error);
    showLoginView();
  }
}

// ============ VIEW MANAGEMENT ============

function showLoginView() {
  document.getElementById('loginView').classList.remove('hidden');
  document.getElementById('mainView').classList.add('hidden');
}

function showMainView() {
  document.getElementById('loginView').classList.add('hidden');
  document.getElementById('mainView').classList.remove('hidden');
}

// ============ EVENT LISTENERS ============

function setupEventListeners() {
  // Login
  document.getElementById('loginButton')?.addEventListener('click', handleLogin);
  document.getElementById('emailInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  });
  document.getElementById('passwordInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  });

  // Logout
  document.getElementById('logoutButton')?.addEventListener('click', handleLogout);

  // Tracking toggle
  document.getElementById('trackingToggle')?.addEventListener('click', toggleTracking);
}

// ============ LOGIN/LOGOUT ============

async function handleLogin() {
  try {
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;

    if (!email || !password) {
      showError('Please enter email and password');
      return;
    }

    const loginButton = document.getElementById('loginButton');
    loginButton.disabled = true;
    loginButton.innerHTML = '<span class="spinner"></span>';

    const response = await fetch('https://subscription-tracker-five-puce.vercel.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    const { accessToken, user } = data.data;

    // Send auth to background script
    await chrome.runtime.sendMessage({
      type: 'SET_AUTH',
      token: accessToken,
      userId: user._id,
    });

    currentUser = user._id;
    showMainView();
    loadStats();
  } catch (error) {
    showError(error.message || 'Login failed');
  } finally {
    const loginButton = document.getElementById('loginButton');
    loginButton.disabled = false;
    loginButton.textContent = 'Sign In';
  }
}

async function handleLogout() {
  try {
    if (!confirm('Are you sure you want to logout?')) return;

    await chrome.runtime.sendMessage({ type: 'DISABLE_TRACKING' });

    // Clear local storage
    await chrome.storage.local.clear();

    currentUser = null;
    showLoginView();

    // Clear inputs
    document.getElementById('emailInput').value = '';
    document.getElementById('passwordInput').value = '';
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// ============ TRACKING CONTROL ============

async function toggleTracking() {
  try {
    const toggle = document.getElementById('trackingToggle');
    trackingEnabled = !trackingEnabled;

    if (trackingEnabled) {
      toggle.classList.add('active');
      await chrome.runtime.sendMessage({ type: 'ENABLE_TRACKING' });
      showSuccess('Tracking enabled');
    } else {
      toggle.classList.remove('active');
      await chrome.runtime.sendMessage({ type: 'DISABLE_TRACKING' });
      showSuccess('Tracking disabled');
    }
  } catch (error) {
    console.error('Toggle tracking error:', error);
  }
}

// ============ STATS LOADING ============

async function loadStats() {
  try {
    if (!currentUser) return;

    const stats = await chrome.storage.local.get([
      'todayPagesVisited',
      'todayTimeOnSubs',
      'todayAdsDetected',
      'todayPaywallsFound',
    ]);

    document.getElementById('pagesVisited').textContent =
      stats.todayPagesVisited || 0;
    document.getElementById('timeOnSubs').textContent =
      formatTime(stats.todayTimeOnSubs || 0);
    document.getElementById('adsDetected').textContent = stats.todayAdsDetected || 0;
    document.getElementById('paywallsFound').textContent =
      stats.todayPaywallsFound || 0;
  } catch (error) {
    console.error('Load stats error:', error);
  }
}

// ============ HELPER FUNCTIONS ============

function formatTime(ms) {
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
}

function showError(message) {
  const messageEl = document.getElementById('loginMessage');
  if (messageEl) {
    messageEl.textContent = message;
    messageEl.classList.remove('hidden');
  }
}

function showSuccess(message) {
  // Create temporary success message
  const div = document.createElement('div');
  div.className = 'success';
  div.textContent = message;

  const container = document.querySelector('.container');
  container.insertBefore(div, container.firstChild);

  setTimeout(() => {
    div.remove();
  }, 3000);
}

function openDashboard() {
  chrome.tabs.create({
    url: 'https://subscription-tracker-five-puce.vercel.app/dashboard',
  });
}

// Refresh stats periodically
setInterval(loadStats, 10000);

document
  .getElementById('dashboardButton')
  .addEventListener('click', openDashboard);