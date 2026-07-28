# Learning Paths

A secure form-based system for submitting and managing learning paths using GitHub OAuth authentication. When users submit the form, it automatically creates a GitHub issue to notify repository members.

## 🔒 Security Features

✅ **No Token Exposure** - Uses GitHub OAuth for secure authentication
✅ **User Authentication** - Users must login with their GitHub account
✅ **Server-Side Processing** - GitHub token stored securely on the backend
✅ **Session Management** - Secure session handling with HTTP-only cookies
✅ **Input Validation** - All user inputs are validated server-side
✅ **HTTPS Recommended** - Security headers included for production

## Available Implementations

This repository contains three implementations:

### 1. **OAuth Implementation (RECOMMENDED)** 🔐
Uses GitHub OAuth for secure, token-free authentication.
- **Files:** `index-oauth.html`, `script-oauth.js`, `style-oauth.css`, `server-oauth.js`
- **Best for:** Production deployments, public forms
- **Security:** ⭐⭐⭐⭐⭐

### 2. **Backend Server Implementation**
Uses a backend server with environment variables.
- **Files:** `index.html`, `script.js`, `style.css`, `server.js`
- **Best for:** Internal applications
- **Security:** ⭐⭐⭐⭐

### 3. **Client-Side Implementation (NOT RECOMMENDED FOR PRODUCTION)**
Token stored in client-side JavaScript.
- **Files:** `index.html`, `script.js`, `style.css`
- **Best for:** Development/testing only
- **Security:** ⭐ (Insecure for production)

---

## 🚀 Quick Start - OAuth Implementation (Recommended)

### Prerequisites

- Node.js 14+ and npm
- GitHub account
- GitHub OAuth App credentials

### Step 1: Create a GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Click **New OAuth App**
3. Fill in the details:
   - **Application name:** Learning Paths
   - **Homepage URL:** `http://localhost:5000` (for local development)
   - **Authorization callback URL:** `http://localhost:3000/auth/callback`
4. Copy your **Client ID** and **Client Secret**

### Step 2: Setup Backend Server

```bash
# Install dependencies
npm install express axios cors express-session dotenv

# Create .env file from template
cp .env.oauth.example .env

# Edit .env and add your values
```

**.env file:**
```
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
GITHUB_REDIRECT_URI=http://localhost:3000/auth/callback
GITHUB_REPO_OWNER=ac812
GITHUB_REPO_NAME=Learning-Paths
PORT=3000
NODE_ENV=development
SESSION_SECRET=your-secret-key-change-in-production
FRONTEND_URL=http://localhost:5000
```

### Step 3: Start the Backend Server

```bash
node server-oauth.js
```

Output:
```
Server running on port 3000
GitHub OAuth Redirect URI: http://localhost:3000/auth/callback
```

### Step 4: Serve the Frontend

```bash
# Using Python (for static file serving)
python -m http.server 5000

# Or using Node.js with http-server
npm install -g http-server
http-server -p 5000
```

### Step 5: Open the Form

Navigate to: `http://localhost:5000/index-oauth.html`

---

## 🔄 How OAuth Flow Works

```
1. User clicks "Sign in with GitHub"
   ↓
2. Redirected to GitHub login/authorization page
   ↓
3. User approves the application
   ↓
4. GitHub redirects back with authorization code
   ↓
5. Backend exchanges code for access token
   ��
6. User's GitHub profile is displayed
   ↓
7. User fills and submits the form
   ↓
8. Backend creates issue using user's authenticated token
   ↓
9. Issue appears in repository with user's credentials
```

---

## 📁 File Structure

### OAuth Implementation
```
├── index-oauth.html          # OAuth form UI
├── script-oauth.js           # Frontend OAuth logic
├── style-oauth.css           # Form styling
├── server-oauth.js           # Backend OAuth server
├── .env.oauth.example        # Environment variables template
├── package.json              # Node.js dependencies
└── README.md                 # This file
```

### Other Implementations
```
├── index.html                # Backend form UI
├── script.js                 # Frontend logic
├── style.css                 # Form styling
├── server.js                 # Backend server
├── .env.example              # Environment variables template
└── script-secure.js          # Alternative secure implementation
```

---

## 🔐 What Users Can Do

### After Login
- ✅ View their GitHub profile information
- ✅ Submit learning paths
- ✅ Automatically have issues created in their name
- ✅ Logout and clear their session

### What They Cannot Do
- ❌ See the backend GitHub token (it's server-side only)
- ❌ Access other repository secrets
- ❌ Perform actions outside the form scope

---

## 🌐 Deployment to Production

### Heroku Deployment

1. **Create a Heroku app:**
```bash
heroku create your-app-name
```

2. **Set environment variables:**
```bash
heroku config:set GITHUB_CLIENT_ID=your_id
heroku config:set GITHUB_CLIENT_SECRET=your_secret
heroku config:set GITHUB_REDIRECT_URI=https://your-app-name.herokuapp.com/auth/callback
heroku config:set SESSION_SECRET=your-production-secret
heroku config:set FRONTEND_URL=https://your-app-name.herokuapp.com
heroku config:set NODE_ENV=production
```

3. **Update GitHub OAuth App:**
   - Go to https://github.com/settings/developers
   - Update **Authorization callback URL:** `https://your-app-name.herokuapp.com/auth/callback`
   - Update **Homepage URL:** `https://your-app-name.herokuapp.com`

4. **Deploy:**
```bash
git push heroku main
```

### Vercel Deployment (Backend)

```bash
npm i -g vercel
vercel
```

**Update .env on Vercel:**
- Set all environment variables in Vercel dashboard
- Update GitHub OAuth callback URL

---

## 📝 Customization

### Add Custom Form Fields

1. **Edit `index-oauth.html`:**
```html
<div class="form-group">
  <label for="custom-field">Custom Field *</label>
  <input type="text" id="custom-field" name="customField" required>
</div>
```

2. **Update `script-oauth.js`:**
```javascript
const formData = {
  name: document.getElementById('name').value.trim(),
  surname: document.getElementById('surname').value.trim(),
  email: document.getElementById('email').value.trim(),
  title: document.getElementById('title').value.trim(),
  summary: document.getElementById('summary').value.trim(),
  customField: document.getElementById('custom-field').value.trim()  // Add this
};
```

3. **Update `server-oauth.js`:**
```javascript
const { name, surname, email, title, summary, customField } = req.body;

const issueBody = `...
### Custom Field
${customField}
...`;
```

### Change Issue Labels

In `server-oauth.js`, modify the `labels` array:

```javascript
labels: ['learning-path-submission', 'your-custom-label']
```

### Modify Issue Template

Edit the `issueData` object in `server-oauth.js` to customize how issues are created.

---

## 🆘 Troubleshooting

### OAuth Issues

**"Invalid Client ID"**
- Verify the Client ID in `.env` matches GitHub
- Ensure the OAuth App hasn't been deleted

**"Redirect URI mismatch"**
- Update the redirect URI in both your `.env` file AND GitHub OAuth App settings
- Ensure they match exactly (including `http://` vs `https://`)

**"Session not found"**
- Ensure cookies are enabled in browser
- Check that `secure` flag is correct (HTTP for local, HTTPS for production)

### Form Submission Issues

**"Not authenticated. Please login with GitHub."**
- User session expired
- User needs to click "Sign in with GitHub" again

**"Permission denied"**
- User may not have permission to create issues in the repository
- Add the user as a collaborator if needed

### Deployment Issues

**"Port already in use"**
```bash
# Change PORT in .env or kill existing process
lsof -i :3000
kill -9 <PID>
```

**"Environment variables not loading"**
- Ensure `.env` file is in the project root
- Restart the server after changing `.env`

---

## 🔗 Useful Links

- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [GitHub API Issues Documentation](https://docs.github.com/en/rest/issues)
- [Express.js Documentation](https://expressjs.com/)
- [GitHub Docs - Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

---

## 📄 License

This project is open source and available under the MIT License.

---

## 💡 Support

For issues or questions, please create an issue in the repository.

**Last Updated:** July 2026
