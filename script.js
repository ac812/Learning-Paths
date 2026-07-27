// Configuration - Update these with your actual values
const CONFIG = {
    GITHUB_TOKEN: 'YOUR_GITHUB_TOKEN_HERE', // Replace with a Personal Access Token (PAT)
    REPO_OWNER: 'ac812',
    REPO_NAME: 'Learning-Paths'
};

const form = document.getElementById('learningPathForm');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const submitBtn = form.querySelector('.submit-btn');

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
        // Create the issue
        await createGitHubIssue(formData);

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

async function createGitHubIssue(formData) {
    // Validate token
    if (CONFIG.GITHUB_TOKEN === 'YOUR_GITHUB_TOKEN_HERE') {
        throw new Error('GitHub token not configured. Please set your Personal Access Token in script.js');
    }

    const issueTitle = `New Learning Path Submission: ${formData.title}`;

    const issueBody = `## New Learning Path Submission

**Submitted by:** ${formData.name} ${formData.surname}
**Email:** ${formData.email}

### Learning Path Title
${formData.title}

### Summary
${formData.summary}

---
*This issue was automatically created from a form submission.*`;

    const url = `https://api.github.com/repos/${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}/issues`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `token ${CONFIG.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: issueTitle,
            body: issueBody,
            labels: ['learning-path-submission']
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`GitHub API Error: ${errorData.message || 'Failed to create issue'}`);
    }

    return await response.json();
}

function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
}
