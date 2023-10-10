"use strict";

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendRegistrationEmail(email: string, name: string, company: string) {
  try {
    const info = await transporter.sendMail({
      from: '"SimplyManaged" <teamsimplymanaged@gmail.com>',
      to: email,
      subject: "SimplyManaged Registration",
      text: `
            Hi ${name},

            Thank you for registering with SimplyManaged.
            We have received your registration for the company ${company} and will get back to you shortly after reviewing the details.
            Once again, thank you for your interest in SimplyManaged.
            
            Best Regards,
            SimplyManaged Team`,
      html: `
        <div>
            <p>Hi <b>${name}</b>,</p>
            <br/>
            <p>Thank you for registering with SimplyManaged.</p>
            <p>We have received your registration for the company <b>${company}</b> and will get back to you shortly after reviewing the details.</p>
            <p>Once again, thank you for your interest in SimplyManaged.</p>
            <br/>
            <p>Best Regards,<br/>SimplyManaged Team</p>
        </div>
        `,
    });
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error(error);
  }
}
