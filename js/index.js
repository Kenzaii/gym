document.addEventListener('DOMContentLoaded', () => {
    // Add click event listeners to all "Select Plan" buttons
    const selectPlanButtons = document.querySelectorAll('.tier-button, .cta-button');
    
    selectPlanButtons.forEach(button => {
        button.addEventListener('click', handlePlanSelection);
    });
});

function handlePlanSelection(e) {
    e.preventDefault();
    
    // Check if user is logged in
    const isAuthenticated = authService.isAuthenticated();
    
    if (isAuthenticated) {
        // If logged in, redirect to account page
        window.location.href = 'account.html';
    } else {
        // If not logged in, redirect to login page
        window.location.href = 'login.html';
    }
} 