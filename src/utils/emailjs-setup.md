# Setting Up EmailJS for Orion AI

This guide will help you set up EmailJS for both the contact form and error reporting functionality in Orion AI.

## Step 1: Create an EmailJS Account

1. Go to [EmailJS](https://www.emailjs.com/) and sign up for an account if you don't already have one.
2. After signing up, you'll be taken to the dashboard.

## Step 2: Add an Email Service

1. In the EmailJS dashboard, go to the "Email Services" section.
2. Click "Add New Service" and select your email provider (Gmail, Outlook, etc.).
3. Follow the instructions to connect your email account.
4. Name your service "solo-risingclub98717613" to match the service ID in the code, or update the service ID in the code to match your service name.

## Step 3: Create Email Templates

1. In the EmailJS dashboard, go to the "Email Templates" section.
2. Create two new templates:
   - One for error reporting named "template_error_report"
   - One for contact form named "template_contact"
3. Use the HTML templates provided in the `emailjs-templates.md` file in this directory.
4. Make sure to use the correct template variables as specified in the templates.

## Step 4: Get Your Public Key

1. In the EmailJS dashboard, go to the "Account" section.
2. Find your "Public Key" (it should look something like "ORIlzXITQCYLEKMYQ").
3. This key is already configured in the code, but if you need to change it, update it in the `src/utils/emailjs.ts` file.

## Step 5: Test the Integration

1. Try submitting the contact form on the Explore page.
2. Check your email to see if you received the message.
3. If you want to test the error reporting, you can trigger an error in the application or use the error reporting form directly.

## Troubleshooting

If you encounter any issues with EmailJS:

1. Check the browser console for any errors.
2. Verify that your service ID, template IDs, and public key are correct.
3. Make sure your email templates have the correct variables.
4. Check your EmailJS dashboard for any failed email attempts.

## Security Note

The public key used in this application is safe to include in client-side code. However, never include your EmailJS private key or user ID in client-side code.

For more information, visit the [EmailJS documentation](https://www.emailjs.com/docs/).
