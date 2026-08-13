// Legacy script originally from pages/auth/login/script.js

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginForm");

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        // Set predefined credentials
        const validUsername = "admin";
        const validPassword = "12345";

        if (username === validUsername && password === validPassword) {
            // Store user session data
            localStorage.setItem('userId', 'user_001');
            localStorage.setItem('authToken', 'token_' + Date.now());
            localStorage.setItem('username', username);
            localStorage.setItem('loginTime', new Date().toISOString());
            
            window.location.href = "../../dashboard/dashboard.html"; // Redirect to dashboard
        } else {
            alert("Invalid username or password. Try again.");
        }
    });
});

