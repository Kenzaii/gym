document.addEventListener('DOMContentLoaded', () => {
    loadEquipment();
    
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmission);
    }
});

async function loadEquipment() {
    try {
        console.log('Starting equipment load...');
        const equipment = await bookingService.getAvailableEquipment();
        console.log('Received equipment:', equipment);
        
        const select = document.getElementById('equipmentSelect');
        if (!select) {
            console.error('Equipment select element not found');
            return;
        }

        // Clear existing options
        select.innerHTML = '<option value="">Select Equipment</option>';
        
        if (!equipment || equipment.length === 0) {
            console.log('No equipment data received');
            alertUtils.showAlert('No equipment available.');
            return;
        }

        // Add equipment options
        equipment.forEach(item => {
            // Only show available equipment
            if (item.fields['Status'] === 'Available') {
                const option = document.createElement('option');
                option.value = item.id;
                option.textContent = `${item.fields['Equipment ID']} - ${item.fields['Equipment Name']} (${item.fields['Category']})`;
                select.appendChild(option);
            }
        });

        console.log('Equipment loaded successfully');
    } catch (error) {
        console.error('Error in loadEquipment:', error);
        alertUtils.showAlert('Error loading equipment. Please try again.');
    }
}

async function handleBookingSubmission(e) {
    e.preventDefault();
    
    const member = authService.getCurrentMember();
    if (!member || !member.id) {
        alertUtils.showAlert('Please log in to book equipment');
        return;
    }

    const equipmentSelect = document.getElementById('equipmentSelect');
    const bookingDate = document.getElementById('bookingDate').value;
    const startTime = document.getElementById('startTime').value;
    const duration = parseInt(document.getElementById('duration').value);

    if (!equipmentSelect || !equipmentSelect.value) {
        alertUtils.showAlert('Please select equipment');
        return;
    }

    if (!bookingDate || !startTime || !duration) {
        alertUtils.showAlert('Please fill in all required fields');
        return;
    }

    // Format the datetime for Airtable
    const [hours, minutes] = startTime.split(':');
    const bookingDateTime = new Date(bookingDate);
    bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0);
    const formattedStartTime = bookingDateTime.toISOString();

    const bookingData = {
        'Member': [member.id],
        'Equipment': [equipmentSelect.value],
        'Booking Date': bookingDate,
        'Start Time': formattedStartTime,
        'Duration': duration,
        'Number of People': 1,
        'Status': 'Confirmed'
    };

    try {
        console.log('Submitting booking data:', bookingData); // Debug log
        const booking = await bookingService.createBooking(bookingData);
        if (booking && !booking.error) {
            alertUtils.showAlert('Booking created successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'account.html';
            }, 2000);
        } else {
            throw new Error(booking.error?.message || 'Failed to create booking');
        }
    } catch (error) {
        console.error('Booking error:', error);
        alertUtils.showAlert(`Error creating booking: ${error.message}`);
    }
} 