const bookingService = {
    async getAvailableEquipment() {
        try {
            const formula = "{Status} = 'Available'";
            const equipment = await airtableService.fetchRecords(TABLES.EQUIPMENT, formula);
            console.log('Fetched equipment:', equipment);
            return equipment;
        } catch (error) {
            console.error('Error fetching equipment:', error);
            throw error;
        }
    },

    async createBooking(bookingData) {
        try {
            const formattedDate = new Date(bookingData.date).toISOString().split('T')[0];
            
            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                JSON.stringify({
                    memberId: bookingData.memberId,
                    equipmentId: bookingData.equipmentId,
                    date: formattedDate,
                    time: bookingData.time
                })
            )}`;

            const fields = {
                'Member': [bookingData.memberId],
                'Equipment': [bookingData.equipmentId],
                'Booking Date': formattedDate,
                'Start Time': bookingData.time,
                'Duration': parseInt(bookingData.duration),
                'Number of People': 1,
                'Status': 'Confirmed',
                'QR Code': qrCodeUrl,
                'Created At': new Date().toISOString()
            };
            
            console.log('Attempting to create booking with fields:', fields);
            
            const booking = await airtableService.createRecord(TABLES.BOOKINGS, fields);
            
            if (booking) {
                console.log('Booking created successfully:', booking);
                this.showQRCode(qrCodeUrl);
                return booking;
            } else {
                throw new Error('Failed to create booking - no response from Airtable');
            }
        } catch (error) {
            console.error('Error creating booking:', error);
            throw error;
        }
    },

    showQRCode(qrCodeUrl) {
        const modal = document.createElement('div');
        modal.className = 'qr-modal';
        modal.innerHTML = `
            <div class="qr-modal-content">
                <h3>Booking Confirmed!</h3>
                <p>Scan this QR code at the gym:</p>
                <img src="${qrCodeUrl}" alt="Booking QR Code">
                <button onclick="this.closest('.qr-modal').remove()">Close</button>
            </div>
        `;
        document.body.appendChild(modal);
    }
};