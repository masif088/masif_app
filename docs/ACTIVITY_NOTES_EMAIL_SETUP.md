# Activity Notes & Email Database Setup

This guide will help you set up the database tables and functionality for activity notes and email features.

## Database Tables

### 1. Activity Notes Table
Stores internal and public notes for activities.

```sql
CREATE TABLE IF NOT EXISTS activity_notes (
    id SERIAL PRIMARY KEY,
    activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Activity Emails Table
Tracks sent emails for activities.

```sql
CREATE TABLE IF NOT EXISTS activity_emails (
    id SERIAL PRIMARY KEY,
    activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    to_emails TEXT[] NOT NULL,
    cc_emails TEXT[] DEFAULT '{}',
    bcc_emails TEXT[] DEFAULT '{}',
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'sent'
);
```

## Setup Instructions

### 1. Run the SQL Script
Execute the `ACTIVITY_NOTES_EMAIL_DATABASE.sql` file in your Supabase SQL editor or database console.

### 2. Verify Tables Created
Check that the following tables exist:
- `activity_notes`
- `activity_emails`

### 3. Check RLS Policies
Ensure Row Level Security is enabled and policies are in place:
- Users can only view notes for activities they're assigned to
- Users can only create notes for activities they're assigned to
- Users can only update/delete their own notes

### 4. Test the Functionality
1. Go to an activity detail page
2. Try adding a public note
3. Try adding an internal note
4. Test the email functionality

## Email Integration

The current implementation logs email data to the console. To integrate with a real email service:

### Option 1: SendGrid
```typescript
// Install: npm install @sendgrid/mail
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// In sendActivityEmail method:
const msg = {
    to: emailData.to,
    cc: emailData.cc,
    bcc: emailData.bcc,
    from: 'your-verified-sender@domain.com',
    subject: emailData.subject,
    text: emailData.body,
    html: emailData.body
};

await sgMail.send(msg);
```

### Option 2: AWS SES
```typescript
// Install: npm install @aws-sdk/client-ses
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const ses = new SESClient({ region: 'us-east-1' });

// In sendActivityEmail method:
const command = new SendEmailCommand({
    Source: 'your-verified-sender@domain.com',
    Destination: {
        ToAddresses: emailData.to,
        CcAddresses: emailData.cc,
        BccAddresses: emailData.bcc
    },
    Message: {
        Subject: { Data: emailData.subject },
        Body: { Text: { Data: emailData.body } }
    }
});

await ses.send(command);
```

### Option 3: Nodemailer (for custom SMTP)
```typescript
// Install: npm install nodemailer
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'your-email@gmail.com',
        pass: 'your-app-password'
    }
});

// In sendActivityEmail method:
await transporter.sendMail({
    from: 'your-email@gmail.com',
    to: emailData.to.join(', '),
    cc: emailData.cc?.join(', '),
    bcc: emailData.bcc?.join(', '),
    subject: emailData.subject,
    text: emailData.body
});
```

## Environment Variables

Add these to your `.env.local`:

```env
# For SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key

# For AWS SES
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1

# For Nodemailer
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Features Overview

### Activity Notes
- ✅ Add public notes (visible to all)
- ✅ Add internal notes (team only)
- ✅ View note history with timestamps
- ✅ See who added each note
- ✅ Real-time updates

### Email Functionality
- ✅ Send emails with multiple recipients
- ✅ Support for To, CC, and BCC
- ✅ Email tracking in database
- ✅ Email history per activity
- ✅ Rich text email composition

### Security
- ✅ Row Level Security (RLS) enabled
- ✅ Users can only access their assigned activities
- ✅ Users can only modify their own notes
- ✅ Proper authentication checks

## Troubleshooting

### Common Issues

1. **Notes not appearing**: Check RLS policies and user permissions
2. **Email not sending**: Verify email service integration and API keys
3. **Database errors**: Ensure all tables are created and indexed properly

### Debug Commands

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('activity_notes', 'activity_emails');

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('activity_notes', 'activity_emails');

-- Test note insertion
INSERT INTO activity_notes (activity_id, user_id, content, is_internal) 
VALUES (1, 'your-user-id', 'Test note', false);
```

## Next Steps

1. Choose and integrate an email service
2. Test the complete workflow
3. Add email templates if needed
4. Implement email notifications for new notes
5. Add file attachments to notes/emails if required 