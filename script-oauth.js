// Secure Frontend with GitHub OAuth Login
// Users authenticate via GitHub before submitting

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-url.com'
  : 'http://localhost:3000';

const form = document.getElementById('learningPathForm');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const submitBtn = form.querySelector('.submit-btn');

// DOM elements for auth
const authSection = document.getElementById('authSection');
const loginBtn = document.getElementById('loginBtn');
const userProfile = document.getElementById('userProfile');
const userName = document.getElementById('userName');
const userAvatar = document.getElementById('userAvatar');
const logoutBtn = document.getElementById('logoutBtn');

/**
 * Initialize - Check if user is already authenticated
 */
async function initializeAuth() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/user`, {
      credentials: 'include' // Include cookies for session
    });

    if (response.ok) {
      const user = await response.json();
      displayUserProfile(user);
    } else {
      showLoginSection();
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    showLoginSection();
  }
}

/**
 * Display user profile after successful login
 */
function displayUserProfile(user) {
  loginBtn.style.display = 'none';
  userProfile.style.display = 'flex';
  userName.textContent = user.name || user.login;
  
  if (user.avatar_url) {
    userAvatar.src = user.avatar_url;
    userAvatar.style.display = 'block';
  }

  form.style.display = 'block';
}

/**
 * Show login section
 */
function showLoginSection() {
  loginBtn.style.display = 'block';
  userProfile.style.display = 'none';
  form.style.display = 'none';
}

/**
 * Handle login button click
 */
loginBtn.addEventListener('click', () => {
  window.location.href = `${API_BASE_URL}/auth/login`;
});

/**
 * Handle logout button click
 */
logoutBtn.addEventListener('click', async () => {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      credentials: 'include'
    });
    showLoginSection();
    form.reset();
  } catch (error) {
    console.error('Logout failed:', error);
  }
});

/**
 * Handle form submission
 */
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Hide previous messages
  successMessage.classList.add('hidden');
  errorMessage.classList.add('hidden');

  // Get form data
  const formData = {
    name: document.getElementById('name').value.trim(),
    surname: document.getElementById('surname').value.trim(),
    email: document.getElementById('email').value.trim(),
    title: document.getElementById('title').value.trim(),
    summary: document.getElementById('summary').value.trim()
  };

  // Validate form data
  if (!Object.values(formData).every(val => val !== '')) {
    showError('All fields are required');
    return;
  }

  // Disable submit button
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  try {
    const response = await fetch(`${API_BASE_URL}/api/submit-learning-path`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Include session cookies
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to submit learning path');
    }

    // Show success message
    successMessage.classList.remove('hidden');

    // Reset form
    form.reset();

    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit';

    // Hide success message after 5 seconds
    setTimeout(() => {
      successMessage.classList.add('hidden');
    }, 5000);

  } catch (error) {
    showError(error.message);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit';
  }
});

function showError(message) {
  errorText.textContent = message;
  errorMessage.classList.remove('hidden');
}

// Check for authentication when page loads
window.addEventListener('load', initializeAuth);

// Check for auth errors in URL (from OAuth callback)
window.addEventListener('load', () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('error')) {
    showError(`Authentication error: ${urlParams.get('error')}`);
  }
  if (urlParams.get('authenticated')) {
    initializeAuth();
    // Clean up URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
});
