document.addEventListener('DOMContentLoaded', async () => {
    if (!authService.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    const member = authService.getCurrentMember();
    
    // Update user info
    document.getElementById('userName').textContent = member.fullName;
    document.getElementById('userTier').textContent = member.membershipTier;

    // Load bookings
    try {
        const bookings = await bookingService.getUserBookings(member.id);
        
        // Render current bookings
        const currentBookingsContainer = document.getElementById('currentBookings');
        bookings.current.forEach(booking => {
            currentBookingsContainer.appendChild(createBookingCard(booking));
        });

        // Render past bookings
        const pastBookingsContainer = document.getElementById('pastBookings');
        bookings.past.forEach(booking => {
            pastBookingsContainer.appendChild(createBookingCard(booking, true));
        });
    } catch (error) {
        console.error('Error loading bookings:', error);
        alert('Error loading bookings');
    }

    // Handle logout
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        authService.logout();
        window.location.href = 'index.html';
    });
});

function createBookingCard(booking, isPast = false) {
    const card = document.createElement('div');
    card.className = 'booking-card';
    
    const date = new Date(booking.fields['Booking Date']);
    const formattedDate = date.toLocaleDateString();
    
    card.innerHTML = `
        <h4>${booking.fields['Equipment'][0]}</h4>
        <div class="booking-details">
            <p>Date: ${formattedDate}</p>
            <p>Time: ${booking.fields['Start Time']}</p>
            <p>Duration: ${booking.fields['Duration']} minutes</p>
            <p>Status: ${booking.fields['Status']}</p>
        </div>
        ${!isPast ? `
            <div class="qr-code-container">
                <img src="${booking.fields['QR Code']}" alt="Booking QR Code">
            </div>
        ` : ''}
    `;
    
    return card;
} 