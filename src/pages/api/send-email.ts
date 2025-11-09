import { NextApiRequest, NextApiResponse } from 'next';
import EmailService from '../../../utils/emailService';
import { createClient } from '../../../utils/supabase/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { to, cc, bcc, subject, body, activity_id, user_id } = req.body;

        // Validate required fields
        if (!to || !subject || !body) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const emailService = new EmailService();
        
        // Send email via SMTP
        await emailService.sendEmail({
            to,
            cc,
            bcc,
            subject,
            body
        });

        // Store email record in database (non-blocking)
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('activity_emails')
                .insert([{
                    activity_id,
                    user_id,
                    to_emails: to,
                    cc_emails: cc || [],
                    bcc_emails: bcc || [],
                    subject,
                    body,
                    status: 'sent'
                }]);

            if (error) {
                console.error('Database logging error (non-critical):', error);
            } else {
                console.log('Email record logged to database successfully');
            }
        } catch (dbError) {
            console.error('Database logging failed (non-critical):', dbError);
        }

        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send email', error: error.message });
    }
} 