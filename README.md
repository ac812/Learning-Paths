# Learning Paths

A form-based system for submitting and managing learning paths. When users submit the form, it automatically creates a GitHub issue to notify repository members.

## Features

- 📋 Simple form for learning path submissions
- 👤 Collects name, surname, email
- 🎓 Captures learning path title and summary
- 🔔 Automatically creates GitHub issues on submission
- 📱 Responsive design
- ✨ Real-time feedback

## Setup Instructions

### 1. Create a Personal Access Token (PAT)

1. Go to GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Create a new token with:
   - **Scope:** `ac812/Learning-Paths` repository
   - **Permissions:** `Issues` (Read and write)
3. Copy the generated token

### 2. Configure the Form

Open `script.js` and replace the placeholder token:

```javascript
const CONFIG = {
    GITHUB_TOKEN: 'YOUR_GITHUB_TOKEN_HERE', // Replace with your PAT
    REPO_OWNER: 'ac812',
    REPO_NAME: 'Learning-Paths'
};
```

### 3. Enable GitHub Pages (Optional)

To host the form publicly:

1. Go to repository Settings → Pages
2. Select `main` branch as the source
3. The form will be available at `https://ac812.github.io/Learning-Paths/`

## File Structure

- `index.html` - Form HTML structure
- `style.css` - Form styling and responsive design
- `script.js` - Form submission logic and GitHub API integration
- `README.md` - Documentation

## How It Works

1. User fills out the form with:
   - Name
   - Surname
   - Email
   - Learning Path Title
   - Learning Path Summary

2. User clicks "Submit"

3. JavaScript sends a request to the GitHub API to create an issue

4. The issue includes:
   - Submitter information
   - Learning path details
   - Automatic label: `learning-path-submission`

5. Repository members are notified of the new issue

## Security Notes

⚠️ **Important:** The Personal Access Token is stored in client-side JavaScript, which means it's visible in the browser. For production use, consider:

- Using a backend server to handle API requests
- Using GitHub Actions with Workflow Dispatch
- Using a serverless function (AWS Lambda, Netlify Functions, etc.)

## Customization

### Change Issue Labels

In `script.js`, modify the `labels` array:

```javascript
labels: ['learning-path-submission', 'custom-label']
```

### Modify Issue Template

Edit the `issueBody` variable in the `createGitHubIssue()` function in `script.js`

### Change Form Fields

1. Add new input fields to `index.html`
2. Update the `formData` object in `script.js`
3. Include the new fields in the issue body

## Troubleshooting

**Issue: "GitHub token not configured"**
- Make sure you've added your Personal Access Token to `script.js`

**Issue: "GitHub API Error: Validation Failed"**
- Verify your token has proper permissions (Issues: read and write)
- Check that the repository name is correct

**Issue: "401 Unauthorized"**
- Your token may be expired or invalid
- Generate a new token and update `script.js`

## License

This project is open source and available under the MIT License.
