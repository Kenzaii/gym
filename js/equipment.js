document.addEventListener('DOMContentLoaded', async () => {
    if (authService.isAuthenticated()) {
        const bookingForm = document.querySelector('.booking-form');
        const authMessage = document.querySelector('.auth-required-section');
        
        if (bookingForm && authMessage) {
            bookingForm.style.display = 'block';
            authMessage.style.display = 'none';
            
            // Load available equipment
            await loadEquipment();
            
            // Add form submission listener
            document.getElementById('bookingForm').addEventListener('submit', handleBookingSubmission);
        }
    }
});

async function loadEquipment() {
    try {
        const equipment = await bookingService.getAvailableEquipment();
        console.log('Raw equipment data:', equipment);
        
        const select = document.getElementById('equipment');
        select.innerHTML = '<option value="">Choose equipment...</option>';
        
        if (Array.isArray(equipment)) {
            equipment.forEach(item => {
                // Debug each equipment item
                console.log('Processing equipment:', {
                    recordId: item.id,
                    fields: item.fields
                });
                
                const option = document.createElement('option');
                // Use the fields['Equipment ID'] for display but store the record ID as value
                option.value = item.id; // This should be something like 'recXYZ123'
                option.textContent = `${item.fields['Equipment ID']} - ${item.fields['Equipment Name']}`;
                
                // Also store the Equipment ID for reference
                option.dataset.equipmentId = item.fields['Equipment ID'];
                
                select.appendChild(option);
            });
        } else {
            console.error('Equipment data is not an array:', equipment);
        }
    } catch (error) {
        console.error('Error loading equipment:', error);
        alert('Error loading equipment');
    }
}

async function handleBookingSubmission(e) {
    e.preventDefault();
    
    const member = authService.getCurrentMember();
    console.log('Current member:', member);
    
    if (!member) {
        alert('Please log in to book equipment');
        return;
    }

    const equipmentSelect = document.getElementById('equipment');
    const selectedOption = equipmentSelect.selectedOptions[0];
    
    // Debug selected equipment
    console.log('Selected option:', {
        recordId: selectedOption?.value,
        equipmentId: selectedOption?.dataset.equipmentId,
        text: selectedOption?.textContent
    });

    if (!selectedOption || !selectedOption.value || !selectedOption.value.startsWith('rec')) {
        alert('Please select a valid equipment');
        return;
    }

    const formData = {
        memberId: member.id,
        equipmentId: selectedOption.value, // This should now be the Airtable record ID
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        duration: document.getElementById('duration').value
    };

    console.log('Submitting booking with data:', formData);

    let loadingMessage = null;

    try {
        loadingMessage = document.createElement('div');
        loadingMessage.textContent = 'Processing booking...';
        loadingMessage.className = 'loading-message';
        document.body.appendChild(loadingMessage);

        const booking = await bookingService.createBooking(formData);
        console.log('Booking response:', booking);
        
        if (loadingMessage) {
            loadingMessage.remove();
        }
        
        if (booking && !booking.error) {
            // Clear form
            e.target.reset();
            alert('Booking confirmed successfully!');
            
            // Redirect to account page after a short delay
            setTimeout(() => {
                window.location.href = 'account.html';
            }, 3000);
        } else {
            throw new Error(booking.error?.message || 'Failed to create booking');
        }
    } catch (error) {
        console.error('Booking error:', error);
        alert(`Error creating booking: ${error.message}`);
        if (loadingMessage) {
            loadingMessage.remove();
        }
    }
} 