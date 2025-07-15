import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import { SettingsService } from './supabase/settingsService';

interface IMAPConfig {
    imap: {
        user: string;
        password: string;
        host: string;
        port: number;
        tls: boolean;
        authTimeout: number;
        connTimeout?: number;
        keepalive?: boolean;
    };
}

interface EmailMessage {
    from: string;
    to: string[];
    cc?: string[];
    subject: string;
    body: string;
    date: Date;
    messageId: string;
}

class IMAPService {
    private config: IMAPConfig;

    private extractEmailAddresses(addressObject: any): string[] {
        if (!addressObject) return [];
        
        if (Array.isArray(addressObject)) {
            return addressObject.map(addr => addr.address || addr.text || '').filter(Boolean);
        }
        
        if (addressObject.address) {
            return [addressObject.address];
        }
        
        if (addressObject.text) {
            return [addressObject.text];
        }
        
        return [];
    }

    constructor() {
        this.config = {
            imap: {
                user: process.env.IMAP_USER || '',
                password: process.env.IMAP_PASS || '',
                host: process.env.IMAP_HOST || 'imap.gmail.com',
                port: parseInt(process.env.IMAP_PORT || '993'),
                tls: process.env.IMAP_TLS !== 'false',
                authTimeout: 10000, // Increased timeout
                connTimeout: 10000,
                keepalive: false
            }
        };
        
        console.log('IMAP Config:', {
            host: this.config.imap.host,
            port: this.config.imap.port,
            user: this.config.imap.user ? this.config.imap.user.substring(0, 3) + '***' : 'not set',
            tls: this.config.imap.tls
        });
    }

    async testConnection(): Promise<boolean> {
        try {
            console.log('Testing IMAP connection...');
            const connection = await imaps.connect(this.config);
            
            // Try to open INBOX to make sure we can access emails
            const box = await connection.openBox('INBOX');
            console.log('INBOX opened successfully. Box info:', typeof box, box);
            
            await connection.end();
            console.log('IMAP connection successful');
            return true;
        } catch (error) {
            console.error('IMAP connection failed:', error);
            return false;
        }
    }

    async getRecentEmails(limit: number = 10): Promise<EmailMessage[]> {
        let connection;
        try {
            connection = await imaps.connect(this.config);
            
            // Open the INBOX
            await connection.openBox('INBOX');
            
            // Get recent emails (last 20 emails)
            const searchCriteria = ['ALL']; // Get all emails, we'll limit later
            const fetchOptions = {
                bodies: '',
                markSeen: false,
                struct: true
            };
            
            const results = await connection.search(searchCriteria, fetchOptions);
            
            const emails: EmailMessage[] = [];
            
            // Limit the results
            const limitedResults = results.slice(0, limit);
            
            for (const item of limitedResults) {
                try {
                    const all = item.parts.find((part: any) => part.which === '');
                    if (all && all.body) {
                        const parsed = await simpleParser(all.body);
                        
                        const fromAddresses = this.extractEmailAddresses(parsed.from);
                        const toAddresses = this.extractEmailAddresses(parsed.to);
                        const ccAddresses = this.extractEmailAddresses(parsed.cc);
                        
                        const email: EmailMessage = {
                            from: fromAddresses[0] || 'Unknown Sender',
                            to: toAddresses,
                            cc: ccAddresses.length > 0 ? ccAddresses : undefined,
                            subject: parsed.subject || 'No Subject',
                            body: parsed.html || parsed.text || 'No Content',
                            date: parsed.date || new Date(),
                            messageId: parsed.messageId || `${Date.now()}-${Math.random()}`
                        };
                        
                        emails.push(email);
                    }
                } catch (parseError) {
                    console.error('Error parsing email:', parseError);
                }
            }
            
            return emails;
            
        } catch (error) {
            console.error('Error fetching emails:', error);
            throw error;
        } finally {
            if (connection) {
                try {
                    await connection.end();
                } catch (endError) {
                    console.error('Error closing IMAP connection:', endError);
                }
            }
        }
    }

    async getEmailsFromDate(since: Date, limit: number = 9999): Promise<EmailMessage[]> {

        // console.log('Getting emails from date:', since.toISOString());
        let connection;
        try {
            connection = await imaps.connect(this.config);
            
            // Open the INBOX
            await connection.openBox('INBOX');
            
            // Get all recent emails (we'll filter by date afterwards)
            const searchCriteria = ['ALL'];
            const fetchOptions = {
                bodies: '',
                markSeen: false,
                struct: true
            };
            
            console.log('Searching IMAP with criteria:', searchCriteria);
            const results = await connection.search(searchCriteria, fetchOptions);
            console.log('IMAP search returned:', results.length, 'results');
            
            const emails: EmailMessage[] = [];
            
            // Limit the results
            const limitedResults = results.slice(0, limit);
            console.log('Processing', limitedResults.length, 'emails (limited from', results.length, ')');
            
            for (const item of limitedResults) {
                try {
                    const all = item.parts.find((part: any) => part.which === '');
                    if (all && all.body) {
                        const parsed = await simpleParser(all.body);
                        
                        const fromAddresses = this.extractEmailAddresses(parsed.from);
                        const toAddresses = this.extractEmailAddresses(parsed.to);
                        const ccAddresses = this.extractEmailAddresses(parsed.cc);
                        
                        const email: EmailMessage = {
                            from: fromAddresses[0] || 'Unknown Sender',
                            to: toAddresses,
                            cc: ccAddresses.length > 0 ? ccAddresses : undefined,
                            subject: parsed.subject || 'No Subject',
                            body: parsed.html || parsed.text || 'No Content',
                            date: parsed.date || new Date(),
                            messageId: parsed.messageId || `${Date.now()}-${Math.random()}`
                        };
                        
                        emails.push(email);
                    }
                } catch (parseError) {
                    console.error('Error parsing email:', parseError);
                }
            }
            
            console.log('Parsed', emails.length, 'emails from IMAP');
            if (emails.length > 0) {
                console.log('Date range filter: emails since', since.toISOString());
                console.log('Sample email dates:', emails.slice(0, 3).map(e => e.date.toISOString()));
            }
            
            // Filter emails by date and sort by date (newest first)
            const filteredEmails = emails.filter(email => email.date >= since);
            console.log('After date filtering:', filteredEmails.length, 'emails remain');
            
            filteredEmails.sort((a, b) => b.date.getTime() - a.date.getTime());
            
            return filteredEmails;
            
        } catch (error) {
            console.error('Error fetching emails from date:', error);
            throw error;
        } finally {
            if (connection) {
                try {
                    await connection.end();
                } catch (endError) {
                    console.error('Error closing IMAP connection:', endError);
                }
            }
        }
    }

    
}

export default IMAPService;
export type { EmailMessage }; 