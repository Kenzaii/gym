function updateNavigation() {
    const navLinks = document.querySelector('.nav-links');
    const isAuthenticated = authService.isAuthenticated();
    
    // Clear existing navigation items
    navLinks.innerHTML = '';
    
    // Add common navigation items
    const commonLinks = `
        <li><a href="index.html">HOME</a></li>
        <li><a href="equipment.html">EQUIPMENT</a></li>
        <li><a href="membership.html">MEMBERSHIP</a></li>
    `;
    
    // Add authentication-specific items
    const authLinks = isAuthenticated ? `
        <li><a href="account.html">MY ACCOUNT</a></li>
        <li><a href="#" class="nav-button logout" onclick="handleLogout(); return false;">LOGOUT</a></li>
    ` : `
        <li><a href="login.html" class="nav-button">LOGIN</a></li>
    `;
    
    navLinks.innerHTML = commonLinks + authLinks;

    // Reinitialize mobile menu
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileMenuToggle && navLinks) {
        // Remove any existing listeners
        mobileMenuToggle.replaceWith(mobileMenuToggle.cloneNode(true));
        const newMobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        
        // Add click listener
        newMobileMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            newMobileMenuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }
}

async function handleLogout() {
    await authService.logout();
    window.location.href = 'index.html';
}

// Run on page load
document.addEventListener('DOMContentLoaded', updateNavigation);

// Update navigation when authentication state changes
window.addEventListener('auth-changed', updateNavigation); 