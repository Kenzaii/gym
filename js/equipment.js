document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication first
    const member = authService.getCurrentMember();
    console.log('Auth check:', { member });

    // If not logged in, redirect to login page
    if (!member || !member.id) {
        console.log('Unauthorized access, redirecting to login');
        window.location.href = 'login.html';
        return;
    }

    // Only continue if user is authenticated
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
            if (item.fields['Status'] === 'Available') {
                const option = document.createElement('option');
                option.value = item.id;
                option.textContent = `${item.fields['Equipment ID']} - ${item.fields['Equipment Name']} (${item.fields['Category']})`;
                select.appendChild(option);
            }
        });

        // Add event listener for booking form
        const bookingForm = document.getElementById('bookingForm');
        if (bookingForm) {
            bookingForm.addEventListener('submit', handleBookingSubmission);
        }

        console.log('Equipment loaded successfully');
    } catch (error) {
        console.error('Error in loadEquipment:', error);
        alertUtils.showAlert('Error loading equipment. Please try again.');
    }
});

async function handleBookingSubmission(e) {
    e.preventDefault();
    
    try {
        loadingUtils.show();
        
        const member = authService.getCurrentMember();
        if (!member || !member.id) {
            alertUtils.showAlert('Please log in to book equipment');
            window.location.href = 'login.html';
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

        console.log('Submitting booking data:', bookingData);
        const booking = await bookingService.createBooking(bookingData);
        
        if (booking && !booking.error) {
            // Generate QR Code URL
            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${booking.id}`;
            
            // Send confirmation email
            try {
                await emailjs.send('service_6uokdkf', 'template_92sabqj', {
                    to_email: member.fields.Email,
                    booking_id: booking.id,
                    booking_date: bookingDate,
                    booking_time: startTime,
                    equipment_name: equipmentSelect.options[equipmentSelect.selectedIndex].text,
                    qr_code_url: qrCodeUrl
                }, 'qIicaPHbGpgKaVArk');
                
                console.log('Confirmation email sent successfully');
            } catch (emailError) {
                console.error('Error sending confirmation email:', emailError);
                // Don't throw the error - we still want to show booking success
            }

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
    } finally {
        loadingUtils.hide();
    }
} 