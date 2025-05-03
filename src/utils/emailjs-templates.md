# EmailJS Templates for Orion AI

This document contains the HTML templates for EmailJS that you can use in your EmailJS dashboard.

## Error Report Template (template_error_report)

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Error Report from Orion AI</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(to right, #6366f1, #8b5cf6);
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            text-align: center;
        }
        .content {
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 0 0 8px 8px;
            border: 1px solid #e5e7eb;
            border-top: none;
        }
        .error-box {
            background-color: #fee2e2;
            border: 1px solid #fecaca;
            border-radius: 6px;
            padding: 15px;
            margin: 15px 0;
            color: #b91c1c;
            font-family: monospace;
            white-space: pre-wrap;
        }
        .info-row {
            display: flex;
            margin-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 10px;
        }
        .info-label {
            font-weight: bold;
            width: 120px;
            flex-shrink: 0;
        }
        .info-value {
            flex-grow: 1;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Error Report from Orion AI</h1>
    </div>
    <div class="content">
        <p>An error has been reported by a user of the Orion AI application:</p>
        
        <div class="error-box">{{error}}</div>
        
        <h3>Error Details</h3>
        
        <div class="info-row">
            <div class="info-label">Timestamp:</div>
            <div class="info-value">{{timestamp}}</div>
        </div>
        
        <div class="info-row">
            <div class="info-label">URL:</div>
            <div class="info-value">{{url}}</div>
        </div>
        
        <div class="info-row">
            <div class="info-label">IP Address:</div>
            <div class="info-value">{{ipAddress}}</div>
        </div>
        
        <div class="info-row">
            <div class="info-label">User Agent:</div>
            <div class="info-value">{{userAgent}}</div>
        </div>
        
        <div class="info-row">
            <div class="info-label">Additional Info:</div>
            <div class="info-value">{{additionalInfo}}</div>
        </div>
    </div>
    <div class="footer">
        <p>This is an automated message from the Orion AI error reporting system.</p>
    </div>
</body>
</html>
```

## Contact Form Template (template_contact)

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Contact Message from Orion AI</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(to right, #6366f1, #8b5cf6);
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            text-align: center;
        }
        .content {
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 0 0 8px 8px;
            border: 1px solid #e5e7eb;
            border-top: none;
        }
        .message-box {
            background-color: #f3f4f6;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 15px;
            margin: 15px 0;
            white-space: pre-wrap;
        }
        .info-row {
            display: flex;
            margin-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 10px;
        }
        .info-label {
            font-weight: bold;
            width: 80px;
            flex-shrink: 0;
        }
        .info-value {
            flex-grow: 1;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #6b7280;
        }
        .button {
            display: inline-block;
            background: linear-gradient(to right, #6366f1, #8b5cf6);
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>New Contact Message</h1>
    </div>
    <div class="content">
        <p>You have received a new message from the Orion AI contact form:</p>
        
        <div class="info-row">
            <div class="info-label">From:</div>
            <div class="info-value">{{name}} ({{email}})</div>
        </div>
        
        <div class="info-row">
            <div class="info-label">Subject:</div>
            <div class="info-value">{{subject}}</div>
        </div>
        
        <h3>Message:</h3>
        <div class="message-box">{{message}}</div>
        
        <a href="mailto:{{email}}" class="button">Reply to {{name}}</a>
    </div>
    <div class="footer">
        <p>This message was sent from the contact form on the Orion AI website.</p>
    </div>
</body>
</html>
```

## How to Use These Templates

1. Log in to your EmailJS account
2. Go to the "Email Templates" section
3. Create a new template for each of the above (Error Report and Contact Form)
4. Copy and paste the HTML code into the template editor
5. Save the templates with the IDs specified in the EmailJS utility file:
   - `template_error_report` for the Error Report template
   - `template_contact` for the Contact Form template
6. Make sure the template variables match the ones used in the code:
   - Error Report: `error`, `timestamp`, `url`, `ipAddress`, `userAgent`, `additionalInfo`
   - Contact Form: `name`, `email`, `subject`, `message`
