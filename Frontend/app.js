const BACKEND_BASE_URL = window.location.hostname === 'localhost' && window.location.port === '3000' 
    ? '' 
    : 'http://localhost:3000';
const API_URL = `${BACKEND_BASE_URL}/api`;

// State Management
let currentUser = null;
let currentAIQuestion = '';

// DOM Elements
const sections = {
    register: document.getElementById('register-page'),
    login: document.getElementById('login-page'),
    submit: document.getElementById('submit-page'),
    myComplaints: document.getElementById('my-complaints-page'),
    admin: document.getElementById('admin-dashboard')
};

const nav = document.getElementById('main-nav');
const userInfo = document.getElementById('user-info');
const toast = document.getElementById('toast');

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    await checkSession();
    setupEventListeners();
});

// Session Management
async function checkSession() {
    try {
        const response = await fetch(`${API_URL}/auth/me`, { credentials: 'include' });
        if (response.ok) {
            currentUser = await response.json();
            updateUIForUser();
        } else {
            showSection('login');
        }
    } catch (error) {
        showSection('login');
    }
}

function updateUIForUser() {
    nav.classList.remove('hidden');
    userInfo.textContent = `${currentUser.name} (${currentUser.role})`;
    
    if (currentUser.role === 'admin') {
        showSection('admin');
        fetchAdminComplaints();
    } else {
        showSection('myComplaints');
        fetchMyComplaints();
    }
}

// Routing
function showSection(sectionName) {
    Object.values(sections).forEach(s => s.classList.add('hidden'));
    sections[sectionName].classList.remove('hidden');
    
    // Reset forms if needed
    if (sectionName === 'register') {
        document.getElementById('register-form').classList.remove('hidden');
        document.getElementById('otp-form').classList.add('hidden');
        document.getElementById('password-form').classList.add('hidden');
    }
}

// Event Listeners
function setupEventListeners() {
    // Navigation
    document.getElementById('show-login').addEventListener('click', () => showSection('login'));
    document.getElementById('show-register').addEventListener('click', () => showSection('register'));
    document.getElementById('show-submit-page').addEventListener('click', () => showSection('submit'));
    document.getElementById('back-to-my-complaints').addEventListener('click', () => showSection('myComplaints'));
    
    document.getElementById('logout-btn').addEventListener('click', logout);

    // Auth Forms
    document.getElementById('register-form').addEventListener('submit', sendOTP);
    document.getElementById('otp-form').addEventListener('submit', verifyOTP);
    document.getElementById('password-form').addEventListener('submit', completeRegistration);
    document.getElementById('login-form').addEventListener('submit', login);

    // Complaint Flow
    document.getElementById('get-ai-question').addEventListener('click', getAIQuestion);
    document.getElementById('complaint-form').addEventListener('submit', submitComplaint);
}

// Auth Actions
async function sendOTP(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;

    const response = await apiCall('/auth/send-otp', 'POST', { name, email });
    if (response.ok) {
        showToast('OTP sent to your email', 'success');
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('otp-form').classList.remove('hidden');
    }
}

async function verifyOTP(e) {
    e.preventDefault();
    // Simplified: Just moving to password step for UI flow
    // Backend will verify it in the final register call per BACKEND.md requirements 
    // Wait, BACKEND.md says: POST /api/auth/register Accepts: email, otp, password
    // So I should just keep the OTP in state or just let the final form handle it.
    // Let's actually just show the password form.
    document.getElementById('otp-form').classList.add('hidden');
    document.getElementById('password-form').classList.remove('hidden');
}

async function completeRegistration(e) {
    e.preventDefault();
    const email = document.getElementById('reg-email').value;
    const otp = document.getElementById('reg-otp').value;
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm-password').value;

    if (password !== confirm) {
        return showToast('Passwords do not match', 'error');
    }

    const response = await apiCall('/auth/register', 'POST', { email, otp, password });
    if (response.ok) {
        showToast('Registration successful! Please login.', 'success');
        showSection('login');
    }
}

async function login(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const response = await apiCall('/auth/login', 'POST', { email, password });
    if (response.ok) {
        currentUser = await response.json();
        showToast(`Welcome back, ${currentUser.name}`, 'success');
        updateUIForUser();
    }
}

async function logout() {
    await apiCall('/auth/logout', 'POST');
    currentUser = null;
    nav.classList.add('hidden');
    showSection('login');
    showToast('Logged out successfully', 'success');
}

// Complaint Actions
async function getAIQuestion() {
    const complaintText = document.getElementById('complaint-text').value;
    if (!complaintText) return showToast('Please describe your issue first', 'error');

    const btn = document.getElementById('get-ai-question');
    btn.textContent = 'Analyzing...';
    btn.disabled = true;

    const response = await apiCall('/ai/question', 'POST', { complaint_text: complaintText });
    if (response.ok) {
        const data = await response.json();
        currentAIQuestion = data.ai_question;
        document.getElementById('display-ai-question').textContent = currentAIQuestion;
        document.getElementById('ai-section').classList.remove('hidden');
        btn.classList.add('hidden');
    }
    btn.textContent = 'Analyze with AI';
    btn.disabled = false;
}

async function submitComplaint(e) {
    e.preventDefault();
    const complaintText = document.getElementById('complaint-text').value;
    const userAnswer = document.getElementById('user-answer').value;

    const response = await apiCall('/complaints', 'POST', {
        complaint_text: complaintText,
        ai_question: currentAIQuestion,
        user_answer: userAnswer
    });

    if (response.ok) {
        showToast('Complaint submitted successfully', 'success');
        resetComplaintForm();
        showSection('myComplaints');
        fetchMyComplaints();
    }
}

async function fetchMyComplaints() {
    const response = await apiCall('/complaints/my', 'GET');
    if (response.ok) {
        const complaints = await response.json();
        renderComplaints(complaints, 'my-complaints-list');
    }
}

async function fetchAdminComplaints() {
    const response = await apiCall('/admin/complaints', 'GET');
    if (response.ok) {
        const complaints = await response.json();
        document.getElementById('total-complaints').textContent = `Total: ${complaints.length}`;
        renderComplaints(complaints, 'admin-complaints-list', true);
    }
}

// Rendering
function renderComplaints(complaints, containerId, isAdmin = false) {
    const container = document.getElementById(containerId);
    if (complaints.length === 0) {
        container.innerHTML = '<p class="subtitle">No complaints found.</p>';
        return;
    }

    container.innerHTML = complaints.map(c => `
        <div class="complaint-card">
            <div class="complaint-header">
                ${isAdmin ? `<span class="user-badge">${c.userName}</span>` : '<span></span>'}
                <span class="complaint-date">${new Date(c.created_at).toLocaleDateString()}</span>
            </div>
            <div class="complaint-content">
                <span class="label">Issue</span>
                <p>${c.complaintText}</p>
                
                <span class="label">AI Follow-up</span>
                <p><em>${c.aiQuestion}</em></p>
                
                <span class="label">Resolution Details</span>
                <p>${c.userAnswer}</p>

                ${isAdmin ? `<span class="user-info">${c.userEmail}</span>` : ''}
            </div>
        </div>
    `).join('');
}

function resetComplaintForm() {
    document.getElementById('complaint-form').reset();
    document.getElementById('ai-section').classList.add('hidden');
    document.getElementById('get-ai-question').classList.remove('hidden');
    currentAIQuestion = '';
}

// Helper Utilities
async function apiCall(endpoint, method, body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    };
    if (body) options.body = JSON.stringify(body);

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        if (!response.ok) {
            const errorData = await response.json();
            showToast(errorData.message || 'Something went wrong', 'error');
            
            if (response.status === 401) {
                currentUser = null;
                showSection('login');
            }
        }
        return response;
    } catch (error) {
        showToast('Network error. Is the server running?', 'error');
        return { ok: false };
    }
}

function showToast(message, type) {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}
