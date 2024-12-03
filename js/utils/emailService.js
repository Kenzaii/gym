const EMAIL_SERVICE_ID = 'service_6uokdkf';  // Get this from EmailJS dashboard
const EMAIL_TEMPLATE_ID = 'template_92sabqj'; // Create a template in EmailJS
const EMAIL_PUBLIC_KEY = 'qIicaPHbGpgKaVArk';   // Get this from EmailJS dashboard

class EmailService {
    constructor() {
        emailjs.init(EMAIL_PUBLIC_KEY);
    }

    async sendBookingConfirmation(booking, qrCodeUrl, userEmail) {
        try {
            const templateParams = {
                to_email: userEmail,
                booking_id: booking.id,
                booking_date: new Date(booking.fields.Date).toLocaleDateString(),
                booking_time: booking.fields.Time,
                equipment_name: booking.fields['Equipment Name'],
                qr_code_url: qrCodeUrl
            };

            const response = await emailjs.send(
                EMAIL_SERVICE_ID,
                EMAIL_TEMPLATE_ID,
                templateParams
            );

            console.log('Email sent successfully:', response);
            return response;
        } catch (error) {
            console.error('Failed to send email:', error);
            throw error;
        }
    }
}

export const emailService = new EmailService(); 