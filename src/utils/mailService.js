import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();  // Load .env variables

// Create a reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail', // For example, using Gmail's SMTP server
    auth: {
        user: 'your-email@gmail.com', // Your email address
        pass: 'your-email-password'   // Your email password or App Password (if 2FA enabled)
    }
});

// Function to send an email
export const sendEmail = async (to, subject, text) => {
    try {
        const info = await transporter.sendMail({
            from: '"Your Company" <your-email@gmail.com>', // Sender address
            to,  // Recipient's email
            subject,  // Subject line
            text,  // Plain text body
        });
        
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error("Error sending email: ", error);
    }
};
