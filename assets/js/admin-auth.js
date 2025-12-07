// Admin Authentication Logic with Backend API
const API_URL = window.APP_CONFIG?.API_URL || 'https://jewel-b1ic.onrender.com';

function validateSession() {
    const token = localStorage.getItem("adminToken");
    const authData = JSON.parse(localStorage.getItem("adminAuth") || "{}");
    
    if (token && authData.authenticated) {
        return true;
    }
    
    // Clear invalid session
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminAuth");
    return false;
}

function createSession(token, user) {
    const sessionData = {
        authenticated: true,
        email: user.email,
        role: user.role,
        name: user.name,
        userId: user.id,
        sessionStart: Date.now()
    };
    localStorage.setItem("adminToken", token);
    localStorage.setItem("adminAuth", JSON.stringify(sessionData));
}

function getAuthToken() {
    return localStorage.getItem("adminToken");
}

function clearSession() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminAuth");
}

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("admin-login-form");
    const feedback = document.querySelector(".login-feedback");

    // Check if already logged in with valid session
    if (validateSession()) {
        window.location.href = "dashboard.html";
    }

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("admin-email").value.trim();
            const password = document.getElementById("admin-password").value;

            // Prevent empty submissions
            if (!email || !password) {
                feedback.textContent = "Please enter both email and password.";
                feedback.dataset.state = "error";
                return;
            }

            // Show loading state
            feedback.textContent = "Logging in...";
            feedback.dataset.state = "info";

            try {
                // Call backend API for authentication
                const response = await fetch(`${API_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok && data.token) {
                    createSession(data.token, data.user);
                    feedback.textContent = "Login successful. Redirecting...";
                    feedback.dataset.state = "success";
                    
                    setTimeout(() => {
                        window.location.href = "dashboard.html";
                    }, 800);
                } else {
                    feedback.textContent = data.error || "Invalid credentials. Please try again.";
                    feedback.dataset.state = "error";
                    document.getElementById("admin-password").value = "";
                }
            } catch (error) {
                console.error('Login error:', error);
                feedback.textContent = "Unable to connect to server. Please try again later.";
                feedback.dataset.state = "error";
                document.getElementById("admin-password").value = "";
            }
        });
    }
});
