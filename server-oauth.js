// GitHub OAuth Configuration and Backend
// This implements GitHub App OAuth flow for secure issue creation

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// GitHub OAuth Configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/auth/callback';
const REPO_OWNER = process.env.GITHUB_REPO_OWNER;
const REPO_NAME = process.env.GITHUB_REPO_NAME;

// Security headers
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

/**
 * GET /auth/login
 * Redirects user to GitHub for authentication
 */
app.get('/auth/login', (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_REDIRECT_URI)}&scope=public_repo`;
  res.redirect(githubAuthUrl);
});

/**
 * GET /auth/callback
 * GitHub redirects here after user approves
 */
app.get('/auth/callback', async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code,
        redirect_uri: GITHUB_REDIRECT_URI
      },
      {
        headers: { 'Accept': 'application/json' }
      }
    );

    if (tokenResponse.data.error) {
      throw new Error(tokenResponse.data.error_description);
    }

    const accessToken = tokenResponse.data.access_token;

    // Get user info
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { 'Authorization': `token ${accessToken}` }
    });

    // Store in session
    req.session.user = {
      id: userResponse.data.id,
      login: userResponse.data.login,
      name: userResponse.data.name,
      avatar_url: userResponse.data.avatar_url,
      accessToken: accessToken
    };

    // Redirect to frontend with success
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5000'}?authenticated=true&user=${encodeURIComponent(userResponse.data.login)}`);

  } catch (error) {
    console.error('OAuth error:', error.message);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5000'}?error=${encodeURIComponent(error.message)}`);
  }
});

/**
 * GET /auth/user
 * Returns current authenticated user
 */
app.get('/auth/user', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  res.json({
    login: req.session.user.login,
    name: req.session.user.name,
    avatar_url: req.session.user.avatar_url
  });
});

/**
 * GET /auth/logout
 * Logs out the user
 */
app.get('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true });
  });
});

/**
 * POST /api/submit-learning-path
 * Creates a GitHub issue using the user's authenticated token
 */
app.post('/api/submit-learning-path', async (req, res) => {
  try {
    // Check authentication
    if (!req.session.user || !req.session.user.accessToken) {
      return res.status(401).json({ error: 'Not authenticated. Please login with GitHub.' });
    }

    const { name, surname, email, title, summary } = req.body;

    // Validate input
    if (!name || !surname || !email || !title || !summary) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate title and summary length
    if (title.length > 200) {
      return res.status(400).json({ error: 'Learning path title must be less than 200 characters' });
    }

    if (summary.length > 5000) {
      return res.status(400).json({ error: 'Learning path summary must be less than 5000 characters' });
    }

    // Create GitHub issue
    const issueData = {
      title: `New Learning Path Submission: ${title}`,
      body: `## New Learning Path Submission

**Submitted by:** ${name} ${surname}
**Email:** ${email}
**GitHub User:** [@${req.session.user.login}](https://github.com/${req.session.user.login})

### Learning Path Title
${title}

### Summary
${summary}

---
*This issue was automatically created from a form submission on ${new Date().toLocaleDateString()}.*`,
      labels: ['learning-path-submission']
    };

    const response = await axios.post(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`,
      issueData,
      {
        headers: {
          'Authorization': `token ${req.session.user.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(201).json({
      success: true,
      message: 'Learning path submitted successfully',
      issueNumber: response.data.number,
      issueUrl: response.data.html_url
    });

  } catch (error) {
    console.error('Error creating GitHub issue:', error.message);

    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Authentication failed - your GitHub session may have expired' });
    }

    if (error.response?.status === 403) {
      return res.status(403).json({ error: 'Permission denied. You may not have access to create issues in this repository.' });
    }

    res.status(500).json({ error: 'Failed to submit learning path. Please try again.' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`GitHub OAuth Redirect URI: ${GITHUB_REDIRECT_URI}`);
});
