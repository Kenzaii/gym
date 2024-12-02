const bookingService = {
    async getAvailableEquipment() {
        try {
            console.log('Fetching equipment...');
            const response = await airtableService.fetchRecords('Equipment');
            console.log('Raw Airtable response:', response);
            
            if (!response || !response.records) {
                throw new Error('Invalid equipment data received');
            }
            
            if (response.records.length > 0) {
                console.log('Sample record structure:', response.records[0]);
            }
            
            return response.records;
        } catch (error) {
            console.error('Error fetching equipment:', error);
            throw error;
        }
    },

    async createBooking(bookingData) {
        try {
            // Generate a unique QR code value
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substr(2, 9);
            const qrCodeData = `BOOKING-${bookingData.Member[0]}-${timestamp}-${randomString}`;
            
            // Add QR code to booking data
            const bookingWithQR = {
                ...bookingData,
                'QR Code': qrCodeData,
                'Status': 'Confirmed'  // Set initial status
            };

            // Debug logs
            console.log('Original booking data:', bookingData);
            console.log('Generated QR code:', qrCodeData);
            console.log('Final booking data with QR:', bookingWithQR);
            
            const response = await airtableService.createRecord('Bookings', bookingWithQR);
            
            // Debug log for response
            console.log('Airtable create response:', response);
            
            return response;
        } catch (error) {
            console.error('Error creating booking:', error);
            console.error('Full error details:', {
                message: error.message,
                stack: error.stack,
                data: bookingData
            });
            throw error;
        }
    },

    async getUserBookings(memberId) {
        try {
            console.log('Fetching bookings for member:', memberId);
            
            if (!memberId) {
                throw new Error('Member ID is required');
            }

            const response = await airtableService.fetchRecords('Bookings');
            
            // Debug log for fetched bookings
            console.log('Raw bookings response:', response);

            if (!response || !response.records) {
                throw new Error('Invalid response from Airtable');
            }

            // Filter bookings for this member
            const userBookings = response.records.filter(booking => {
                return booking.fields.Member && 
                       Array.isArray(booking.fields.Member) && 
                       booking.fields.Member.includes(memberId);
            });

            // Debug log for filtered bookings
            console.log('Filtered bookings:', userBookings);
            console.log('Number of bookings found:', userBookings.length);
            
            // Log QR codes for each booking
            userBookings.forEach((booking, index) => {
                console.log(`Booking ${index + 1} QR Code:`, booking.fields['QR Code']);
            });

            return userBookings;
        } catch (error) {
            console.error('Detailed booking error:', error);
            console.error('Error stack:', error.stack);
            throw error;
        }
    }
};