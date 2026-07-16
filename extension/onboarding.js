const APP_BASE_URL = 'https://subscription-tracker-five-puce.vercel.app';
const LOGIN_URL = `${APP_BASE_URL}/api/auth/login`;

document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await checkAuthStatus();
});

async function checkAuthStatus() {
  try {
    const state = await chrome.runtime.sendMessage({ type: 'GET_STATE' });
    if (state?.authenticated) showSuccessView();
  } catch (error) {
    console.error('Auth check failed:', error);
    showError('Unable to connect to the extension service worker. Reload the extension.');
  }
}

function setupEventListeners() {
  document.getElementById('loginButton')?.addEventListener('click', handleLogin);
  document.getElementById('signupButton')?.addEventListener('click', () => {
    chrome.tabs.create({ url: `${APP_BASE_URL}/signup` });
  });
  document.getElementById('goToDashboardButton')?.addEventListener('click', () => {
    chrome.tabs.create({ url: `${APP_BASE_URL}/extension` });
    window.close();
  });

  for (const inputId of ['emailInput', 'passwordInput']) {
    document.getElementById(inputId)?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') handleLogin();
    });
  }
}

async function handleLogin() {
  const email = document.getElementById('emailInput')?.value.trim();
  const password = document.getElementById('passwordInput')?.value;
  const button = document.getElementById('loginButton');

  if (!email || !password) {
    showError('Please enter your email and password.');
    return;
  }

  hideError();
  setButtonLoading(button, true);

  try {
    const response = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const payload = await readJsonResponse(response);
    if (!response.ok) {
      throw new Error(getApiError(payload, 'Login failed. Please check your credentials.'));
    }

    const authData = payload?.data || payload;
    const token = authData?.accessToken;
    const user = authData?.user;
    const userId = user?.id || user?._id;

    if (!token || !userId) {
      throw new Error('The login response did not include an access token and user ID.');
    }

    const result = await chrome.runtime.sendMessage({
      type: 'SET_AUTH',
      token,
      userId,
    });

    if (!result?.success) {
      throw new Error(result?.error || 'The extension could not save your session.');
    }

    showSuccessView();
  } catch (error) {
    console.error('Onboarding login failed:', error);
    showError(error.message || 'Login failed.');
  } finally {
    setButtonLoading(button, false, 'Continue with SubTrack');
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
    const spinner = document.createElement('span');
    spinner.className = 'spinner';
    button.replaceChildren(spinner);
  } else {
    button.textContent = label;
  }
}

function showSuccessView() {
  document.getElementById('loginView')?.classList.add('hidden');
  document.getElementById('successView')?.classList.remove('hidden');
}

function showError(message) {
  const errorElement = document.getElementById('errorMessage');
  if (!errorElement) return;
  errorElement.textContent = message;
  errorElement.classList.remove('hidden');
}

function hideError() {
  document.getElementById('errorMessage')?.classList.add('hidden');
}
