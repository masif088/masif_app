import nodemailer from 'nodemailer';

interface EmailConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
}

interface EmailData {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    from?: string;
}

class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        const config: EmailConfig = {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER || '',
                pass: process.env.SMTP_PASS || ''
            }
        };

        this.transporter = nodemailer.createTransport(config);
    }

    async sendEmail(emailData: EmailData): Promise<boolean> {
        try {
            const mailOptions = {
                from: emailData.from || process.env.SMTP_FROM || process.env.SMTP_USER,
                to: emailData.to.join(', '),
                cc: emailData.cc?.join(', '),
                bcc: emailData.bcc?.join(', '),
                subject: emailData.subject,
                html: emailData.body, // Use HTML for rich content
                text: this.stripHtml(emailData.body) // Fallback text version
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', result.messageId);
            return true;
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }

    private stripHtml(html: string): string {
        // Simple HTML to text conversion
        return html.replace(/<[^>]*>/g, '');
    }

    async verifyConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            console.log('SMTP connection verified successfully');
            return true;
        } catch (error) {
            console.error('SMTP connection failed:', error);
            return false;
        }
    }
}

export default EmailService; 