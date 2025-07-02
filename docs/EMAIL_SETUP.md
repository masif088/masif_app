# Email Setup Guide

This guide will help you configure SMTP email functionality for the activity management system.

## Environment Variables

Add these variables to your `.env.local` file:

```env
# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

## SMTP Provider Examples

### Gmail Setup
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-digit-app-password
SMTP_FROM=your-email@gmail.com
```

**Note**: For Gmail, you need to:
1. Enable 2-factor authentication
2. Generate an "App Password" (not your regular password)
3. Use the 16-digit app password in `SMTP_PASS`

### Outlook/Hotmail Setup
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SMTP_FROM=your-email@outlook.com
```

### Yahoo Setup
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@yahoo.com
```

### Custom SMTP Server
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASS=your-password
SMTP_FROM=noreply@yourdomain.com
```

## Installation

Install the required package:

```bash
npm install nodemailer
npm install @types/nodemailer --save-dev
```

## Testing Email Configuration

You can test your email configuration by adding this to your component:

```typescript
import EmailService from 'utils/emailService';

// Test email connection
const testEmail = async () => {
    const emailService = new EmailService();
    const isConnected = await emailService.verifyConnection();
    console.log('SMTP Connection:', isConnected ? 'Success' : 'Failed');
};
```

## Features

The email service supports:
- ✅ **Rich HTML Content** - WYSIWYG editor content
- ✅ **Multiple Recipients** - To, CC, BCC
- ✅ **SMTP Authentication** - Secure email sending
- ✅ **Error Handling** - Proper error messages
- ✅ **Database Logging** - Email history tracking

## Troubleshooting

### Common Issues:

1. **Authentication Failed**
   - Check your email and password
   - For Gmail, use App Password, not regular password
   - Enable "Less secure app access" (if available)

2. **Connection Timeout**
   - Verify SMTP host and port
   - Check firewall settings
   - Try different ports (587, 465, 25)

3. **Email Not Sending**
   - Check console for error messages
   - Verify all environment variables are set
   - Test with a simple email first

### Debug Commands:

```typescript
// Test connection
const emailService = new EmailService();
await emailService.verifyConnection();

// Test email sending
await emailService.sendEmail({
    to: ['test@example.com'],
    subject: 'Test Email',
    body: '<h1>Test</h1><p>This is a test email.</p>'
});
```

## Security Notes

- Never commit `.env.local` to version control
- Use App Passwords for Gmail/Google accounts
- Consider using environment-specific configurations
- Regularly rotate email passwords

## Next Steps

1. Add your email credentials to `.env.local`
2. Install nodemailer package
3. Test the email functionality
4. Configure email templates if needed 