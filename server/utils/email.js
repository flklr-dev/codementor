const nodemailer = require('nodemailer');
const gmailSend = require('gmail-send');
require('dotenv').config(); // Ensure environment variables are loaded

// Create reusable Gmail sender
const createGmailSender = () => {
  console.log('Creating Gmail sender with:', process.env.EMAIL_USER);
  
  return gmailSend({
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
  });
};

// Create reusable transporter using SMTP transport
const createTransporter = async () => {
  // Check if we have Gmail credentials
  if (process.env.EMAIL_SERVICE === 'gmail' && 
      process.env.EMAIL_USER && 
      process.env.EMAIL_APP_PASSWORD &&
      process.env.EMAIL_USER !== 'your.email@gmail.com') {
    
    // For Gmail we'll use a specialized Gmail sender
    console.log('Using Gmail sender with account:', process.env.EMAIL_USER);
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
      // Enable debug mode to see detailed logs
      debug: true,
      logger: true
    });
  }
  
  // For development environment - use ethereal.email for testing if no real credentials provided
  if (process.env.NODE_ENV !== 'production' || 
    !process.env.EMAIL_USER || 
    !process.env.EMAIL_APP_PASSWORD || 
    process.env.EMAIL_USER === 'your.email@gmail.com') {
    
    // Create a test account at ethereal.email
    const testAccount = await nodemailer.createTestAccount();
    
    console.log('Created test email account:');
    console.log('- Email:', testAccount.user);
    console.log('- Password:', testAccount.pass);
    console.log('- SMTP URL:', `smtp.ethereal.email:${testAccount.smtp.port}`);
    
    // Configure test transporter
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
  
  // Use regular configuration
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
};

/**
 * Directly send a test email to see if our email configuration works
 * @returns {Promise<boolean>} Success status
 */
const sendTestEmail = async () => {
  try {
    console.log('Starting test email...');
    console.log('Environment vars loaded:', { 
      EMAIL_USER: process.env.EMAIL_USER,
      EMAIL_SERVICE: process.env.EMAIL_SERVICE,
      HAS_APP_PASSWORD: !!process.env.EMAIL_APP_PASSWORD
    });
    
    // Try direct Gmail send
    const send = createGmailSender();
    const result = await send({
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'CodeMentor - Test Email',
      text: 'This is a test email to verify email sending functionality.',
      html: '<h1>Test Email</h1><p>This is a test email sent from CodeMentor app.</p>',
    });
    
    console.log('Test email result:', result);
    return true;
  } catch (error) {
    console.error('Test email failed:', error);
    return false;
  }
};

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text version of email
 * @param {string} options.html - HTML version of email
 * @returns {Promise<Object>} - Send info
 */
const sendEmail = async (options) => {
  try {
    console.log('Attempting to send email to:', options.to);
    console.log('Using email credentials:', process.env.EMAIL_USER);
    console.log('Email content:', {
      subject: options.subject,
      text: options.text.substring(0, 100) + '...',
      htmlLength: options.html ? options.html.length : 0
    });
    
    // First try direct with gmail-send
    try {
      console.log('Attempting to send with gmail-send...');
      const send = createGmailSender();
      
      const result = await send({
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      
      console.log('Gmail send result:', result);
      
      return {
        success: true,
        messageId: result.messageId || 'gmail-send-message',
        response: result
      };
    } catch (gmailError) {
      console.error('Error with gmail-send, falling back to nodemailer:', gmailError);
      // Fall back to nodemailer
    }
    
    // Use nodemailer as fallback or primary sender
    const transporter = await createTransporter();
    
    console.log('Created email transporter:', transporter.options?.service || 'custom');
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"CodeMentor App" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };
    
    console.log('Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    
    // Log email preview URL for ethereal.email test accounts
    if (info.messageId && info.testMessageUrl) {
      console.log('Preview URL: %s', info.testMessageUrl);
    }
    
    return {
      success: true,
      messageId: info.messageId,
      previewUrl: info.testMessageUrl,
    };
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Return failure but don't throw, to make verification process more resilient
    return {
      success: false,
      error: error.message || 'Unknown error sending email'
    };
  }
};

/**
 * Send verification email to user
 * @param {Object} user - User object
 * @param {string} email - Email address to verify
 * @param {string} token - Verification token
 * @param {string} baseUrl - Base URL for the verification link
 * @returns {Promise<Object>} - Send info
 */
const sendVerificationEmail = async (user, email, token, baseUrl) => {
  const verificationUrl = `${baseUrl}/verify-email/${token}`;
  
  console.log('Creating verification email with URL:', verificationUrl);
  
  const subject = 'Email Verification - CodeMentor';
  
  const text = `
    Hello ${user.name},
    
    Please verify your email address to complete your profile update.
    
    Click the link below to verify your email:
    ${verificationUrl}
    
    If you didn't request this, please ignore this email.
    
    The verification link will expire in 24 hours.
    
    Thanks,
    The CodeMentor Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #6366F1;">CodeMentor</h1>
      </div>
      
      <p style="font-size: 16px; line-height: 1.5;">Hello ${user.name},</p>
      
      <p style="font-size: 16px; line-height: 1.5;">Please verify your email address to complete your profile update.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #6366F1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Verify Email Address</a>
      </div>
      
      <p style="font-size: 14px; line-height: 1.5;">Or copy and paste this link in your browser:</p>
      <p style="font-size: 14px; line-height: 1.5; word-break: break-all; color: #6366F1;">${verificationUrl}</p>
      
      <p style="font-size: 14px; line-height: 1.5;">If you didn't request this, please ignore this email.</p>
      
      <p style="font-size: 14px; line-height: 1.5;">The verification link will expire in 24 hours.</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e1e1; text-align: center; color: #666; font-size: 12px;">
        <p>Thanks,<br>The CodeMentor Team</p>
      </div>
    </div>
  `;
  
  // Try sending the email with both methods
  const emailResult = await sendEmail({
    to: email,
    subject,
    text,
    html,
  });
  
  // If it failed, try a test email to see if our config works at all
  if (!emailResult.success) {
    console.log('Verification email failed, trying a test email...');
    await sendTestEmail();
  }
  
  return emailResult;
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendTestEmail,
}; 