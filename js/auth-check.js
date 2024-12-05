function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const userName = sessionStorage.getItem('userName');
    
    console.log('Auth check:', {
        isLoggedIn: isLoggedIn,
        userName: userName
    });

    if (isLoggedIn !== 'true') {
        console.log('Unauthorized access, redirecting to login');
        window.location.replace('login.html');
        return false;
    }
    
    // Set member name if available
    const memberNameElement = document.querySelector('.member-name');
    if (memberNameElement && userName) {
        memberNameElement.textContent = userName;
    }
    
    return true;
}

// Only run on non-login pages
if (!window.location.pathname.includes('login.html')) {
    checkAuth();
}

// Only run on non-login pages
if (!window.location.pathname.includes('login.html')) {
    checkAuth();
}

// Add logout functionality
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            sessionStorage.clear();
            window.location.replace('login.html');
        });
    }
}); 