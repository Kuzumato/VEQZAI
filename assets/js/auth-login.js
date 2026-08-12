// Scripts for pages\auth\login\login.html
document.addEventListener("DOMContentLoaded", function () {
      const form = document.getElementById("loginForm");
      const errorMsg = document.getElementById("error-msg");

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        errorMsg.style.display = "none";

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;

        // Demo credentials
        const validUsername = "admin";
        const validPassword = "12345";

        if (username === validUsername && password === validPassword) {
          localStorage.setItem('loggedIn', 'true');
          localStorage.setItem('username', username);
          localStorage.setItem('userId', 'demo-user');
          localStorage.setItem('authToken', 'demo-token');
          window.location.href = "../../../dashboard.html";
        } else {
          errorMsg.textContent = "Invalid username or password. Try admin / 12345";
          errorMsg.style.display = "block";
        }
      });
    });
