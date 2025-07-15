import { NextApiRequest, NextApiResponse } from 'next';
import IMAPService from 'utils/imapService';
import { ActivityService } from 'utils/supabase/activityService';
import { SettingsService } from 'utils/supabase/settingsService';

// Function to extract activity ID from email metadata
function extractActivityIdFromEmail(emailBody: string): number | null {
    try {
        // Look for span with activity-id pattern
        const spanRegex = /<span[^>]*id="[^"]*activity-id-(\d+)"[^>]*>#(\d+)<\/span>/;
        const spanMatch = emailBody.match(spanRegex);
        
        if (spanMatch && spanMatch[1]) {
            return parseInt(spanMatch[1], 10);
        }  
        return null;
    } catch (error) {
        console.error('Error extracting activity ID from email:', error);
        return null;
    }
}

// Function to extract activity ID and full span ID from email metadata
function extractActivityIdAndSpanIdFromEmail(emailBody: string): { activityId: number | null; spanId: string | null } {
    try {
        // Look for span with activity-id pattern
        const spanRegex = /<span[^>]*id="([^"]*activity-id-(\d+))"[^>]*>#(\d+)<\/span>/;
        const spanMatch = emailBody.match(spanRegex);
        
        if (spanMatch && spanMatch[2]) {
            return {
                activityId: parseInt(spanMatch[2], 10),
                spanId: spanMatch[1] // Full span ID
            };
        }  
        return { activityId: null, spanId: null };
    } catch (error) {
        console.error('Error extracting activity ID and span ID from email:', error);
        return { activityId: null, spanId: null };
    }
}

// Function to extract just the email address from full email format
function extractEmailAddress(emailString: string): string {
    try {
        // Check if it's in format "Display Name" <email@domain.com>
        const emailRegex = /<([^>]+)>/;
        const match = emailString.match(emailRegex);
        
        if (match && match[1]) {
            return match[1].trim();
        }
        
        // If no angle brackets, assume it's already just the email address
        return emailString.trim();
    } catch (error) {
        console.error('Error extracting email address:', error);
        return emailString;
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const {  days = 7 } = req.body;        

        const imapService = new IMAPService();
        
        // Test connection first
        const connectionTest = await imapService.testConnection();
        if (!connectionTest) {
            return res.status(500).json({ message: 'IMAP connection failed' });
        }

        // Get emails from the last N days
        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - days);
        
        // Use last_fetch_inbox from request body if provided, otherwise fallback to sinceDate
        let since = sinceDate;
        // Get last_fetch_inbox from settings if available
        const lastFetchSetting = await SettingsService.getSettingByKey('last_fetch_inbox');
        if (lastFetchSetting && lastFetchSetting.value) {
            const lastFetch = new Date(lastFetchSetting.value);
            if (!isNaN(lastFetch.getTime())) {
                // Set since to 2 hours before lastFetch
                since = new Date(lastFetch.getTime() - 2 * 60 * 60 * 1000);
            }
        }
        
        const emails = await imapService.getEmailsFromDate(since, 1000);
        
        // Save emails as activity notes
        const savedEmails = [];
        for (const email of emails) {
            try {
                // Extract activity ID from email metadata
                const extractedActivityId = extractActivityIdFromEmail(email.body);
                
                // Use extracted activity ID or fallback to provided activityId
                const finalActivityId = extractedActivityId;
                

                if (!finalActivityId) {
                    // If no activity ID is found, create a new activity and use its ID
                    const newActivity = await ActivityService.createActivityFromEmail?.(email);
                    if (!newActivity || !newActivity.id) {
                        console.error('Failed to create new activity for email without activity ID');
                        continue;

                    }
                    console.log('newActivity', newActivity);
                    const finalActivityId = newActivity.id;
                }else{
                    console.log('finalActivityId', finalActivityId);
                    const existingNotes = await ActivityService.getActivityNotes(finalActivityId);
                    const emailExists = existingNotes.some(note => 
                        note.email_uid === extractActivityIdAndSpanIdFromEmail(email.body).spanId &&
                        note.email === extractEmailAddress(email.from)
                    );

                    if (emailExists) {
                        console.log('Email already exists in database, skipping:', email.subject);
                        continue;
                    }

                    const emailNoteContent = `
                    <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin-bottom: 10px;">
                        <h6 style="color: #1976d2; margin-bottom: 10px;"><i class="icon-mail"></i> Email Received</h6>
                        <div style="margin-bottom: 8px;"><strong>From:</strong> ${email.from}</div>
                        <div style="margin-bottom: 8px;"><strong>To:</strong> ${email.to.join(', ')}</div>
                        ${email.cc?.length ? `<div style="margin-bottom: 8px;"><strong>CC:</strong> ${email.cc.join(', ')}</div>` : ''}
                        <div style="margin-bottom: 8px;"><strong>Subject:</strong> ${email.subject}</div>
                        <div style="margin-bottom: 8px;"><strong>Date:</strong> ${email.date.toLocaleString()}</div>
                        <div style="margin-bottom: 8px;"><strong>Message:</strong></div>
                        <div style="border-left: 3px solid #1976d2; padding-left: 15px; max-height: 300px; overflow-y: auto;">${email.body}</div>
                    </div>
                `;
            
          
                    const savedNote = await ActivityService.createActivityNoteWithTime({
                        activity_id: finalActivityId,
                        user_id: null,
                        email_uid: extractActivityIdAndSpanIdFromEmail(email.body).spanId,
                        email: extractEmailAddress(email.from),
                        content: emailNoteContent,
                        is_internal: false, // Email notes are public
                        created_at:email.date.toISOString(),
                        updated_at:email.date.toISOString()
                    });

                    if (savedNote) {
                        savedEmails.push({
                            email,
                            noteId: savedNote.id,
                            activityId: finalActivityId
                        });
                    }
                }

                
            } catch (noteError) {
                console.error('Error saving email as note:', noteError);
            }
        }
        try {
         
            await SettingsService.updateSetting('last_fetch_inbox', {
                value: new Date().toISOString()
            });
        } catch (updateError) {
            console.error('Error updating last_fetch_inbox setting:', updateError);
        }

        return res.status(200).json({
            message: `Successfully fetched ${emails.length} emails and saved ${savedEmails.length} as notes`,
            emailCount: emails.length,
            savedCount: savedEmails.length,
            emails: savedEmails
        });

    } catch (error) {
        console.error('Error fetching emails:', error);
        return res.status(500).json({ 
            message: 'Failed to fetch emails', 
            error: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
} 