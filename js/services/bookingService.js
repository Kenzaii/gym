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

    async getEquipmentDetails(equipmentId) {
        try {
            console.log('Fetching equipment details for:', equipmentId);
            const response = await airtableService.fetchRecord('Equipment', equipmentId);
            console.log('Equipment details:', response);
            return response;
        } catch (error) {
            console.error('Error fetching equipment details:', error);
            return null;
        }
    },

    async getMemberBookings(memberId) {
        try {
            console.log('Fetching bookings for member:', memberId);
            const response = await airtableService.fetchRecords('Bookings');
            console.log('Raw bookings response:', response);

            // Filter bookings for the specific member
            const memberBookings = response.records.filter(booking => {
                return booking.fields.Member && 
                       booking.fields.Member[0] === memberId &&
                       booking.fields.Status !== 'Cancelled';
            });

            console.log('Filtered member bookings:', memberBookings);
            return memberBookings;
        } catch (error) {
            console.error('Error fetching member bookings:', error);
            throw error;
        }
    },

    async createBooking(bookingData) {
        try {
            console.log('Creating booking with data:', bookingData);
            const response = await airtableService.createRecord('Bookings', bookingData);
            console.log('Booking created:', response);
            return response;
        } catch (error) {
            console.error('Error creating booking:', error);
            throw error;
        }
    },

    async updateBooking(bookingId, updateData) {
        try {
            console.log('Updating booking:', bookingId, updateData);
            const response = await airtableService.updateRecord('Bookings', bookingId, updateData);
            console.log('Booking updated:', response);
            return response;
        } catch (error) {
            console.error('Error updating booking:', error);
            throw error;
        }
    },

    async updateProfilePicture(memberId, file) {
        try {
            // Convert file to base64
            const base64String = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });

            // Update member record with new profile picture
            const response = await airtableService.updateRecord('Members', memberId, {
                'Profile Picture': [{
                    url: base64String
                }]
            });

            return response;
        } catch (error) {
            console.error('Error updating profile picture:', error);
            throw error;
        }
    }
};