/**
 * Main JavaScript file for AI-Powered Accounting Software
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is logged in
  checkAuthStatus();
  
  // Add event listeners
  setupEventListeners();
});

/**
 * Check if user is logged in by looking for token in localStorage
 */
function checkAuthStatus() {
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    // User is logged in
    fetchUserProfile(token);
    showAuthenticatedUI();
  } else {
    // User is not logged in
    showUnauthenticatedUI();
  }
}

/**
 * Fetch user profile data from API
 */
async function fetchUserProfile(token) {
  try {
    const response = await fetch('/api/v1/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const userData = await response.json();
      updateUIWithUserData(userData);
    } else {
      // Token might be invalid or expired
      handleLogout();
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
  }
}

/**
 * Update UI with user data
 */
function updateUIWithUserData(userData) {
  // Update username in dropdown
  const usernameElement = document.getElementById('username');
  if (usernameElement) {
    usernameElement.textContent = `${userData.first_name} ${userData.last_name}`;
  }
  
  // Additional UI updates based on user role can be added here
  if (userData.role === 'admin') {
    // Show admin-specific UI elements
    const adminElements = document.querySelectorAll('.admin-only');
    adminElements.forEach(el => el.classList.remove('d-none'));
  }
}

/**
 * Show UI elements for authenticated users
 */
function showAuthenticatedUI() {
  // Hide login/register buttons
  const authButtons = document.getElementById('auth-buttons');
  if (authButtons) {
    authButtons.classList.add('d-none');
  }
  
  // Show user profile dropdown
  const userProfile = document.getElementById('user-profile');
  if (userProfile) {
    userProfile.classList.remove('d-none');
  }
  
  // Show authenticated-only elements
  const authElements = document.querySelectorAll('.auth-only');
  authElements.forEach(el => el.classList.remove('d-none'));
  
  // Hide unauthenticated-only elements
  const unauthElements = document.querySelectorAll('.unauth-only');
  unauthElements.forEach(el => el.classList.add('d-none'));
}

/**
 * Show UI elements for unauthenticated users
 */
function showUnauthenticatedUI() {
  // Show login/register buttons
  const authButtons = document.getElementById('auth-buttons');
  if (authButtons) {
    authButtons.classList.remove('d-none');
  }
  
  // Hide user profile dropdown
  const userProfile = document.getElementById('user-profile');
  if (userProfile) {
    userProfile.classList.add('d-none');
  }
  
  // Hide authenticated-only elements
  const authElements = document.querySelectorAll('.auth-only');
  authElements.forEach(el => el.classList.add('d-none'));
  
  // Show unauthenticated-only elements
  const unauthElements = document.querySelectorAll('.unauth-only');
  unauthElements.forEach(el => el.classList.remove('d-none'));
}

/**
 * Handle user logout
 */
function handleLogout() {
  // Clear auth token from localStorage
  localStorage.removeItem('auth_token');
  
  // Update UI
  showUnauthenticatedUI();
  
  // Redirect to home page
  window.location.href = '/';
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
    });
  }
  
  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Register form
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
}

/**
 * Handle login form submission
 */
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // Save token to localStorage
      localStorage.setItem('auth_token', data.token);
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } else {
      const errorData = await response.json();
      showError(errorData.error || 'Login failed. Please check your credentials.');
    }
  } catch (error) {
    console.error('Login error:', error);
    showError('An error occurred during login. Please try again.');
  }
}

/**
 * Handle register form submission
 */
async function handleRegister(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const firstName = document.getElementById('first_name').value;
  const lastName = document.getElementById('last_name').value;
  
  try {
    const response = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password,
        first_name: firstName,
        last_name: lastName
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // Save token to localStorage
      localStorage.setItem('auth_token', data.token);
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } else {
      const errorData = await response.json();
      showError(errorData.error || 'Registration failed. Please try again.');
    }
  } catch (error) {
    console.error('Registration error:', error);
    showError('An error occurred during registration. Please try again.');
  }
}

/**
 * Show error message
 */
function showError(message) {
  const errorAlert = document.getElementById('error-alert');
  if (errorAlert) {
    errorAlert.textContent = message;
    errorAlert.classList.remove('d-none');
    
    // Hide error after 5 seconds
    setTimeout(() => {
      errorAlert.classList.add('d-none');
    }, 5000);
  }
}
