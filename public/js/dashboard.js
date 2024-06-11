document.addEventListener('DOMContentLoaded', function() {
    // Check if login form exists
    const loginForm = document.getElementById('login');
    if (loginForm) {
        loginForm.addEventListener('click', function() {
            // Check if login time is not already stored
            if (!localStorage.getItem('logintime')) {
                
                localStorage.setItem('logintime', new Date().toLocaleString());
            }
        });
    }

    // Check if logout button exists
    const logoutButton = document.getElementById('logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            localStorage.removeItem('logintime');
            // Optionally, you can redirect the user to the login page
            
        });
    }

    // Display login time on the dashboard if available
    const loginTimeElement = document.getElementById('login-time');
    if (loginTimeElement) {
        const storedLogintime = localStorage.getItem('logintime');
        if (storedLogintime) {
            loginTimeElement.innerText = `Logged in at: ${new Date(storedLogintime).toLocaleString()}`;
        } else {
            loginTimeElement.innerText = "Not Logged In";
        }
    }
    

    
});