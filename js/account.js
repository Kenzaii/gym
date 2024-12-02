document.addEventListener('DOMContentLoaded', async () => {
    const member = authService.getCurrentMember();
    if (!member || !member.id) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // Display member info
        displayMemberInfo(member);
        
        // Load and display bookings
        await loadBookings(member.id);
    } catch (error) {
        console.error('Error initializing account page:', error);
        alertUtils.showAlert('Error loading account information');
    }
});

function displayMemberInfo(member) {
    const nameElement = document.getElementById('memberName');
    const emailElement = document.getElementById('memberEmail');
    const tierElement = document.getElementById('membershipTier');
    
    if (nameElement) nameElement.textContent = member.fields['Full Name'] || 'N/A';
    if (emailElement) emailElement.textContent = member.fields['Email'] || 'N/A';
    if (tierElement) tierElement.textContent = member.fields['Membership Tier'] || 'N/A';
}

async function loadBookings(memberId) {
    try {
        console.log('Fetching bookings for member:', memberId);
        const bookings = await bookingService.getUserBookings(memberId);
        console.log('Received bookings:', bookings);

        const bookingsContainer = document.getElementById('bookingsContainer');
        if (!bookingsContainer) {
            console.error('Bookings container not found');
            return;
        }

        if (!bookings || bookings.length === 0) {
            bookingsContainer.innerHTML = '<p class="no-bookings">No bookings found.</p>';
            return;
        }

        // Debug log for QR codes
        bookings.forEach((booking, index) => {
            console.log(`Booking ${index + 1} QR Code:`, booking.fields['QR Code']);
        });

        const bookingsHTML = bookings.map(booking => {
            console.log('Processing booking:', booking);
            
            // Get equipment details
            const equipmentId = booking.fields.Equipment ? booking.fields.Equipment[0] : null;
            console.log('Equipment ID:', equipmentId);
            
            // Basic data with fallbacks
            const date = booking.fields['Booking Date'] || 'N/A';
            const time = booking.fields['Start Time'] || 'N/A';
            const status = booking.fields['Status'] || 'Unknown';
            const duration = booking.fields['Duration'] || 'N/A';
            const qrCode = booking.fields['QR Code'];

            console.log('QR Code value:', qrCode); // Debug log

            return `
                <div class="booking-card ${status.toLowerCase()}">
                    <div class="booking-header">
                        <h3>${equipmentId ? `Booking #${booking.id.slice(-4)}` : 'New Booking'}</h3>
                        <span class="status-badge">${status}</span>
                    </div>
                    <div class="booking-details">
                        <p>
                            <strong>Date:</strong>
                            <span>${date}</span>
                        </p>
                        <p>
                            <strong>Time:</strong>
                            <span>${time}</span>
                        </p>
                        <p>
                            <strong>Duration:</strong>
                            <span>${duration} minutes</span>
                        </p>
                        <p>
                            <strong>Equipment:</strong>
                            <span>${equipmentId || 'N/A'}</span>
                        </p>
                    </div>
                    ${qrCode ? `
                        <div class="qr-code-section">
                            <h4>Check-in QR Code</h4>
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrCode)}" 
                                 alt="Booking QR Code" 
                                 class="qr-code-image"
                                 onclick="window.open(this.src, '_blank')">
                        </div>
                    ` : '<p class="no-qr">No QR Code available</p>'}
                </div>
            `;
        }).join('');

        bookingsContainer.innerHTML = bookingsHTML;
    } catch (error) {
        console.error('Error loading bookings:', error);
        console.error('Error details:', error.message);
        alertUtils.showAlert('Error loading bookings');
    }
} 