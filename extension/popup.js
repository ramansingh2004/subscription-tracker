// popup.js - Popup UI logic

const APP_BASE_URL = 'https://subscription-tracker-five-puce.vercel.app';
const LOGIN_URL = `${APP_BASE_URL}/api/auth/login`;

let currentUser = null;
let trackingEnabled = false;

document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await checkExtensionState();
  await loadStats();
});

async function checkExtensionState() {
  try {
    const state = await chrome.runtime.sendMessage({ type: 'GET_STATE' });
    if (state?.authenticated) {
      currentUser = state.userId;
      trackingEnabled = state.enabled !== false;
      showMainView();
      updateTrackingToggle();
    } else {
      showLoginView();
    }
  } catch (error) {
    console.error('Extension state check failed:', error);
    showLoginView();
    showError('Unable to connect to the extension service worker. Reload the extension.');
  }
}

function setupEventListeners() {
  document.getElementById('loginButton')?.addEventListener('click', handleLogin);
  document.getElementById('logoutButton')?.addEventListener('click', handleLogout);
  document.getElementById('trackingToggle')?.addEventListener('click', toggleTracking);
  document.getElementById('dashboardButton')?.addEventListener('click', openDashboard);

  for (const inputId of ['emailInput', 'passwordInput']) {
    document.getElementById(inputId)?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') handleLogin();
    });
  }
}

async function handleLogin() {
  const email = document.getElementById('emailInput')?.value.trim();
  const password = document.getElementById('passwordInput')?.value;
  const loginButton = document.getElementById('loginButton');

  if (!email || !password) {
    showError('Please enter your email and password.');
    return;
  }

  hideError();
  setButtonLoading(loginButton, true);

  try {
    const response = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-SubTrack-Client': 'extension',
      },
      body: JSON.stringify({ email, password }),
    });

    const payload = await readJsonResponse(response);
    if (!response.ok) {
      throw new Error(getApiError(payload, 'Login failed. Please check your credentials.'));
    }

    const authData = payload?.data || payload;
    const token = authData?.accessToken;
    const refreshToken = authData?.refreshToken;
    const user = authData?.user;
    const resolvedUserId = user?.id || user?._id;

    if (!token || !refreshToken || !resolvedUserId) {
      throw new Error('The login response did not include a complete extension session.');
    }

    const result = await chrome.runtime.sendMessage({
      type: 'SET_AUTH',
      token,
      refreshToken,
      userId: resolvedUserId,
    });

    if (!result?.success) {
      throw new Error(result?.error || 'The extension could not save your session.');
    }

    currentUser = resolvedUserId;
    trackingEnabled = true;
    showMainView();
    updateTrackingToggle();
    await loadStats();
  } catch (error) {
    console.error('Login error:', error);
    showError(error.message || 'Login failed.');
  } finally {
    setButtonLoading(loginButton, false, 'Sign In');
  }
}

async function handleLogout() {
  if (!confirm('Are you sure you want to log out?')) return;

  try {
    await chrome.runtime.sendMessage({ type: 'LOGOUT' });
  } catch (error) {
    console.error('Logout message failed:', error);
  }

  currentUser = null;
  trackingEnabled = false;
  document.getElementById('emailInput').value = '';
  document.getElementById('passwordInput').value = '';
  showLoginView();
}

async function toggleTracking() {
  const previousValue = trackingEnabled;
  trackingEnabled = !trackingEnabled;
  updateTrackingToggle();

  try {
    const result = await chrome.runtime.sendMessage({
      type: trackingEnabled ? 'ENABLE_TRACKING' : 'DISABLE_TRACKING',
    });

    if (!result?.success) throw new Error(result?.error || 'Unable to update tracking.');
    showSuccess(trackingEnabled ? 'Tracking enabled' : 'Tracking paused');
  } catch (error) {
    trackingEnabled = previousValue;
    updateTrackingToggle();
    showSuccess(error.message || 'Unable to update tracking.', true);
  }
}

async function loadStats() {
  if (!currentUser) return;

  try {
    const stats = await chrome.storage.local.get([
      'todayPagesVisited',
      'todayTimeOnSubs',
      'todayAdsDetected',
      'todayPaywallsFound',
    ]);

    setText('pagesVisited', stats.todayPagesVisited || 0);
    setText('timeOnSubs', formatTime(stats.todayTimeOnSubs || 0));
    setText('adsDetected', stats.todayAdsDetected || 0);
    setText('paywallsFound', stats.todayPaywallsFound || 0);
  } catch (error) {
    console.error('Stats loading failed:', error);
  }
}

function showLoginView() {
  document.getElementById('loginView')?.classList.remove('hidden');
  document.getElementById('mainView')?.classList.add('hidden');
}

function showMainView() {
  document.getElementById('loginView')?.classList.add('hidden');
  document.getElementById('mainView')?.classList.remove('hidden');
}

function updateTrackingToggle() {
  const toggle = document.getElementById('trackingToggle');
  toggle?.classList.toggle('active', trackingEnabled);
  toggle?.setAttribute('aria-pressed', String(trackingEnabled));

  const badge = document.getElementById('statusBadge');
  if (badge) {
    badge.textContent = trackingEnabled ? 'Tracking' : 'Paused';
    badge.classList.toggle('active', trackingEnabled);
    badge.classList.toggle('inactive', !trackingEnabled);
  }
}

async function readJsonResponse(response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`The server returned an invalid response (${response.status}).`);
  }
}

function getApiError(payload, fallback) {
  return payload?.message || payload?.error?.message || payload?.error || fallback;
}

function setButtonLoading(button, loading, label = '') {
  if (!button) return;
  button.disabled = loading;
  if (loading) {
    button.replaceChildren(createSpinner());
  } else {
    button.textContent = label;
  }
}

function createSpinner() {
  const spinner = document.createElement('span');
  spinner.className = 'spinner';
  return spinner;
}

function formatTime(milliseconds) {
  const totalMinutes = Math.floor(milliseconds / 60000);
  const hours = Math.floor(totalMinutes / 60);
  return hours > 0 ? `${hours}h ${totalMinutes % 60}m` : `${totalMinutes}m`;
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = String(value);
}

function showError(message) {
  const messageElement = document.getElementById('loginMessage');
  if (!messageElement) return;
  messageElement.textContent = message;
  messageElement.classList.remove('hidden');
}

function hideError() {
  document.getElementById('loginMessage')?.classList.add('hidden');
}

function showSuccess(message, isError = false) {
  const notice = document.createElement('div');
  notice.className = isError ? 'error' : 'success';
  notice.textContent = message;

  const container = document.querySelector('.container');
  container?.prepend(notice);
  setTimeout(() => notice.remove(), 3000);
}

function openDashboard() {
  chrome.tabs.create({ url: `${APP_BASE_URL}/dashboard` });
}

setInterval(loadStats, 10000);
