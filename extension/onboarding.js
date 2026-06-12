// ============ INITIALIZATION ============

    document.addEventListener('DOMContentLoaded', async () => {
      setupEventListeners();
      await checkAuthStatus();
    });

    async function checkAuthStatus() {
      try {
        const stored = await chrome.storage.local.get(['authToken', 'userId']);
        if (stored.authToken && stored.userId) {
          showSuccessView();
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    }

    // ============ EVENT LISTENERS ============

    function setupEventListeners() {
      document.getElementById('loginButton').addEventListener('click', handleLogin);
      document.getElementById('signupButton').addEventListener('click', handleSignup);
      document
        .getElementById('goToDashboardButton')
        .addEventListener('click', goToDashboard);

      document.getElementById('emailInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
      });

      document.getElementById('passwordInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
      });
    }

    // ============ LOGIN ============

    async function handleLogin() {
      try {
        const email = document.getElementById('emailInput').value;
        const password = document.getElementById('passwordInput').value;

        if (!email || !password) {
          showError('Please enter email and password');
          return;
        }

        const button = document.getElementById('loginButton');
        button.disabled = true;
        button.innerHTML = '<span class="spinner"></span>';

        const response = await fetch('https://subscription-tracker-five-puce.vercel.app/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          throw new Error('Login failed. Please check your credentials.');
        }

        const data = await response.json();
        const { accessToken, user } = data.data;

        // Send auth to background script
        await chrome.runtime.sendMessage({
          type: 'SET_AUTH',
          token: accessToken,
          userId: user._id,
        });

        showSuccessView();
      } catch (error) {
        showError(error.message || 'Login failed');
      } finally {
        const button = document.getElementById('loginButton');
        button.disabled = false;
        button.textContent = 'Continue with SubTrack';
      }
    }

    function handleSignup() {
      window.open('https://subscription-tracker-five-puce.vercel.app/signup', '_blank');
    }

    function goToDashboard() {
      window.open('https://subscription-tracker-five-puce.vercel.app/extension', '_blank');
      window.close();
    }

    // ============ VIEW MANAGEMENT ============

    function showSuccessView() {
      document.getElementById('loginView').classList.add('hidden');
      document.getElementById('successView').classList.remove('hidden');
    }

    function showError(message) {
      const errorEl = document.getElementById('errorMessage');
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');

      setTimeout(() => {
        errorEl.classList.add('hidden');
      }, 5000);
    }