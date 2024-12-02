function updateNavigation() {
    const navLinks = document.querySelector('.nav-links');
    const isAuthenticated = authService.isAuthenticated();
    
    // Clear existing navigation items
    navLinks.innerHTML = '';
    
    // Add common navigation items
    navLinks.innerHTML += `
        <li><a href="index.html">HOME</a></li>
        <li><a href="equipment.html">EQUIPMENT</a></li>
        <li><a href="membership.html">MEMBERSHIP</a></li>
    `;
    
    // Add authentication-specific items
    if (isAuthenticated) {
        navLinks.innerHTML += `
            <li><a href="account.html">MY ACCOUNT</a></li>
            <li><a href="#" class="nav-button logout" onclick="handleLogout(); return false;">LOGOUT</a></li>
        `;
    } else {
        navLinks.innerHTML += `
            <li><a href="login.html" class="nav-button">LOGIN</a></li>
        `;
    }
}

async function handleLogout() {
    await authService.logout();
    window.location.href = 'index.html'; // Redirect to home page
}

// Run on page load
document.addEventListener('DOMContentLoaded', updateNavigation);

// Update navigation when authentication state changes
window.addEventListener('auth-changed', updateNavigation); 