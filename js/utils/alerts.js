const alertUtils = {
    showAlert(message, type = 'error') {
        // Remove any existing alerts
        const existingAlert = document.querySelector('.custom-alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        // Create new alert
        const alert = document.createElement('div');
        alert.className = `custom-alert ${type}`;
        alert.textContent = message;

        // Add to document
        document.body.appendChild(alert);

        // Show alert
        setTimeout(() => {
            alert.classList.add('show');
        }, 10);

        // Remove alert after 3 seconds
        setTimeout(() => {
            alert.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => {
                alert.remove();
            }, 300);
        }, 3000);
    }
}; 