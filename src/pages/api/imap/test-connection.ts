import { NextApiRequest, NextApiResponse } from 'next';
import IMAPService from 'utils/imapService';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const imapService = new IMAPService();
        
        // Test connection
        const connectionTest = await imapService.testConnection();
        if (!connectionTest) {
            return res.status(500).json({ message: 'IMAP connection failed' });
        }

        // Try to get recent emails (no date filter)
        const recentEmails = await imapService.getRecentEmails(5);
        
        return res.status(200).json({
            message: 'IMAP connection successful',
            connectionWorking: true,
            recentEmailsCount: recentEmails.length,
            sampleEmails: recentEmails.map(email => ({
                from: email.from,
                subject: email.subject,
                date: email.date,
                hasBody: email.body.length > 0
            }))
        });

    } catch (error) {
        console.error('Error testing IMAP:', error);
        return res.status(500).json({ 
            message: 'IMAP test failed', 
            error: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
} 