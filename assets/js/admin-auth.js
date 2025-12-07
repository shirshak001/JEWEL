// Admin Authentication Logic with enhanced security
const AUTH_CONFIG = {
    users: [
        {
            email: "shirshakmondaljspbuet@gmail.com",
            passwordHash: "569e8ddd484a4bd3f547ffc342a9ff212fe74717ca19796c9b66a47c2597690c",
            role: "admin"
        }
    ],
    sessionTimeout: 3600000 // 1 hour
};

// Simple hash function (for demo - use bcrypt in production)
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function validateSession() {
    const authData = JSON.parse(localStorage.getItem("adminAuth") || "{}");
    const now = Date.now();
    
    if (authData.authenticated && authData.sessionStart) {
        const elapsed = now - authData.sessionStart;
        if (elapsed < AUTH_CONFIG.sessionTimeout) {
            // Extend session
            authData.sessionStart = now;
            localStorage.setItem("adminAuth", JSON.stringify(authData));
            return true;
        }
    }
    
    // Clear invalid session
    localStorage.removeItem("adminAuth");
    return false;
}

function createSession(email, role) {
    const sessionData = {
        authenticated: true,
        email: email,
        role: role,
        sessionStart: Date.now(),
        sessionId: generateSessionId()
    };
    localStorage.setItem("adminAuth", JSON.stringify(sessionData));
}

function generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
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

            // Hash the entered password
            const enteredHash = await hashPassword(password);

            // Find matching user
            const user = AUTH_CONFIG.users.find(u => 
                u.email.toLowerCase() === email.toLowerCase() && 
                u.passwordHash === enteredHash
            );

            if (user) {
                createSession(user.email, user.role);
                feedback.textContent = "Login successful. Redirecting...";
                feedback.dataset.state = "success";
                
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 800);
            } else {
                feedback.textContent = "Invalid credentials. Please try again.";
                feedback.dataset.state = "error";
                
                // Clear password field on failed attempt
                document.getElementById("admin-password").value = "";
            }
        });
    }
});
