const { Resend } = require('resend');

const resend = new Resend(process.env.RESEN_API);

const sendEmail = async ({ to, subject, html }) => {
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || 'MovieMania <noreply@moviemania.com>',
    to,
    subject,
    html,
  });

  if (error) throw new Error(error.message);
};

module.exports = sendEmail;
