const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
    // For development, you can use ethereal.email (fake SMTP service)
    // For production, configure with real SMTP credentials

    if (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS) {
        // Production configuration
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    } else {
        // Development: Log to console instead of sending
        console.log('⚠️  SMTP not configured. Email will be logged to console.');
        return null;
    }
};

const sendConfirmationEmail = async (email, name, token) => {
    const transporter = createTransporter();

    const confirmationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/confirm-email/${token}`;

    const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@uniza.sk',
        to: email,
        subject: 'Potvrďte svoju emailovú adresu - Otázkový systém',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Vitajte, ${name}!</h2>
        <p>Ďakujeme za registráciu v otázkovom systéme.</p>
        <p>Pre dokončenie registrácie prosím potvrďte svoju emailovú adresu kliknutím na nasledujúci odkaz:</p>
        <div style="margin: 30px 0;">
          <a href="${confirmationUrl}" 
             style="background-color: #1976d2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Potvrdiť email
          </a>
        </div>
        <p>Alebo skopírujte tento odkaz do prehliadača:</p>
        <p style="word-break: break-all; color: #666;">${confirmationUrl}</p>
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          Tento odkaz vyprší za 24 hodín.<br>
          Ak ste sa neregistrovali, ignorujte tento email.
        </p>
      </div>
    `,
        text: `
Vitajte, ${name}!

Ďakujeme za registráciu v otázkovom systéme.

Pre dokončenie registrácie prosím potvrďte svoju emailovú adresu kliknutím na nasledujúci odkaz:
${confirmationUrl}

Tento odkaz vyprší za 24 hodín.
Ak ste sa neregistrovali, ignorujte tento email.
    `,
    };

    if (transporter) {
        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('✅ Confirmation email sent:', info);
            return true;
        } catch (error) {
            console.error('❌ Error sending confirmation email:', error);
            return false;
        }
    } else {
        // Development mode: just log the confirmation URL
        console.log('\n📧 ========== CONFIRMATION EMAIL ==========');
        console.log(`To: ${email}`);
        console.log(`Name: ${name}`);
        console.log(`Confirmation URL: ${confirmationUrl}`);
        console.log('==========================================\n');
        return true;
    }
};

module.exports = {
    sendConfirmationEmail,
};
