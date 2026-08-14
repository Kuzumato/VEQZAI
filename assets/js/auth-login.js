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
          // Use sessionStorage so login does not persist after browser is closed
          sessionStorage.setItem('loggedIn', 'true');
          sessionStorage.setItem('username', username);
          sessionStorage.setItem('userId', 'demo-user');
          sessionStorage.setItem('authToken', 'demo-token');
          window.location.href = "../../dashboard/dashboard.html";
        } else {
          errorMsg.textContent = "Invalid username or password. Try admin / 12345";
          errorMsg.style.display = "block";
        }
      });
    });
