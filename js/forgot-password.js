document.addEventListener('DOMContentLoaded', function() {
    // Initialize EmailJS
    emailjs.init("qIicaPHbGpgKaVArk");

    const resetForm = document.getElementById('resetForm');
    if (!resetForm) return;

    resetForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('resetEmail').value;
        const submitButton = this.querySelector('button[type="submit"]');
        
        try {
            // Show loading state
            submitButton.disabled = true;
            submitButton.textContent = 'SENDING...';

            // Check if email exists in Airtable
            const response = await fetch(`https://api.airtable.com/v0/app7an1IZnEt7BC2L/Members?filterByFormula={Email}="${email}"`, {
                headers: {
                    'Authorization': 'Bearer pat139sD45hTcrgqK.5366c618657ea4e6cc7df110504e2feb0191ce4004dd0272170962555beb3dc0'
                }
            });

            const data = await response.json();
            
            if (!data.records || data.records.length === 0) {
                throw new Error('Email not found');
            }

            // Generate reset link
            const resetToken = btoa(email + '_' + Date.now());
            const resetLink = `https://kenzaii.github.io/gym/reset-password.html?token=${resetToken}&email=${encodeURIComponent(email)}`;

            // Send email using EmailJS
            await emailjs.send('service_6uokdkf', 'template_fl1lsjt', {
                to_email: email,
                reset_link: resetLink,
                to_name: email.split('@')[0],
                from_name: 'Anytime Refresh'
            });

            // Show success message
            document.getElementById('resetForm').style.display = 'none';
            document.getElementById('resetSuccess').style.display = 'block';

        } catch (error) {
            console.error('Error:', error);
            const errorDiv = document.getElementById('resetError');
            errorDiv.style.display = 'block';
            errorDiv.textContent = error.message === 'Email not found' 
                ? 'Email address not found in our records.'
                : 'Sorry, there was an error sending the reset email. Please try again.';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'SEND RESET LINK';
        }
    });
}); 