# IMAP Email Retrieval Setup

This document explains how to configure IMAP email retrieval for the activity management system.

## Environment Variables

Add these IMAP variables to your `.env.local` file:

```env
# IMAP Email Retrieval Configuration
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your-email@gmail.com
IMAP_PASS=your-app-password
IMAP_TLS=true
```

## Provider-Specific Settings

### Gmail
```env
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your-email@gmail.com
IMAP_PASS=your-16-digit-app-password
IMAP_TLS=true
```

**Note**: For Gmail, you need to:
1. Enable 2-factor authentication
2. Generate an "App Password" (not your regular password)
3. Use the 16-digit app password in `IMAP_PASS`

### Outlook/Hotmail
```env
IMAP_HOST=imap-mail.outlook.com
IMAP_PORT=993
IMAP_USER=your-email@outlook.com
IMAP_PASS=your-password
IMAP_TLS=true
```

### Yahoo
```env
IMAP_HOST=imap.mail.yahoo.com
IMAP_PORT=993
IMAP_USER=your-email@yahoo.com
IMAP_PASS=your-app-password
IMAP_TLS=true
```

## Features

The IMAP integration provides:

- ✅ **Automatic Email Fetching** - Retrieve emails from your inbox
- ✅ **Email to Notes Conversion** - Automatically save emails as activity notes
- ✅ **Date-based Filtering** - Fetch emails from the last N days
- ✅ **Connection Testing** - Verify IMAP credentials before fetching
- ✅ **Rich Email Display** - Preserve email formatting and structure

## How to Use

1. **Configure Environment Variables** - Add your IMAP credentials to `.env.local`
2. **Go to Activity Detail Page** - Navigate to any activity
3. **Click "Fetch Emails"** - Button is located next to "Send Email"
4. **View Retrieved Emails** - Emails appear as notes in the activity

## API Endpoint

The IMAP functionality is available via API:

```typescript
POST /api/imap/fetch-emails
{
    "activityId": 123,
    "userId": "user-id",
    "days": 7  // Optional: fetch emails from last N days
}
```

## Security Notes

- IMAP credentials are stored securely in environment variables
- Only emails from the configured account are retrieved
- All emails are saved as **public notes** (not internal)
- Connection testing is performed before each fetch operation

## Troubleshooting

### Common Issues:

1. **IMAP Connection Failed**
   - Check your email and password
   - For Gmail, use App Password, not regular password
   - Verify IMAP is enabled in your email provider

2. **No Emails Retrieved**
   - Check if there are emails in the specified date range
   - Verify IMAP folder permissions
   - Check console for detailed error messages

3. **Authentication Errors**
   - Ensure 2FA is enabled (for Gmail)
   - Use correct app-specific passwords
   - Check account security settings

### Debug Steps:

1. **Test Connection**
   ```bash
   # Check if IMAP service can connect
   # Look for "IMAP connection successful" in console
   ```

2. **Check Environment Variables**
   ```bash
   # Verify all IMAP_* variables are set
   echo $IMAP_HOST
   echo $IMAP_USER
   ```

3. **Monitor Console**
   ```bash
   # Check browser console for detailed error messages
   # Look for IMAP-related errors
   ```

## Email Processing

When emails are fetched, they are:

1. **Parsed** - Subject, body, sender, recipients extracted
2. **Formatted** - Converted to rich HTML with proper styling
3. **Saved** - Stored as activity notes with email metadata
4. **Displayed** - Shown in the notes section with email formatting

## Example Email Note Format

```html
<div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px;">
    <h6><i class="icon-mail"></i> Email Received</h6>
    <div><strong>From:</strong> sender@example.com</div>
    <div><strong>To:</strong> recipient@example.com</div>
    <div><strong>Subject:</strong> Email Subject</div>
    <div><strong>Date:</strong> 2024-01-15 10:30:00</div>
    <div><strong>Message:</strong></div>
    <div style="border-left: 3px solid #1976d2; padding-left: 15px;">
        Email content here...
    </div>
</div>
```

## Next Steps

1. Configure your IMAP credentials in `.env.local`
2. Test the connection using the "Fetch Emails" button
3. Monitor the notes section for retrieved emails
4. Adjust the date range if needed (currently set to 7 days) 