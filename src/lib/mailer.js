const nodemailer = require('nodemailer');

console.log("Mailer Config:", {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS
});

// Configuração do transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true para porta 465, false para outras portas
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    ciphers: 'TLSv1.2',
    rejectUnauthorized: false
  }
});

module.exports = {
  sendMail: async (message) => {
    try {
      const mailOptions = {
        ...message,
        from: message.from || process.env.SMTP_FROM || 'SUA EMPRESA <SEU EMAIL>'
      };
      
      const info = await transporter.sendMail(mailOptions);
      console.log('E-mail enviado:', info.messageId);
      return info;
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      throw error;
    }
  }
};