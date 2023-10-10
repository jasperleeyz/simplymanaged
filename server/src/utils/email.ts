"use strict";

import AccountDetails from "../typings/account-details";

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

export const sendApprovedEmail = async (email: string, name: string, company: string, accountDetails: AccountDetails) => {
  try {
    const info = await transporter.sendMail({
      from: '"SimplyManaged" <teamsimplymanaged@gmail.com>',
      to: email,
      subject: "SimplyManaged Registration Approved",
      text: `
            Hi ${name},

            We have reviewed your registration for the company ${company} and are pleased to inform you that your registration has been approved.
            
            Please find your account details below:
            Username: ${accountDetails.username}
            Password: ${accountDetails.password}

            The account has been granted the role of System Admin. You may now login to SimplyManaged using the above credentials.
            
            Your next step:
            1. Do remember to change your password after logging in for the first time.
            2. Review your company and account details and update if necessary.
            3. Enjoy using SimplyManaged!
            
            Best Regards,
            SimplyManaged Team`,
      html: `
        <div>
            <p>Hi <b>${name}</b>,</p>
            <br/>
            <p>We have reviewed your registration for the company <b>${company}</b> and are pleased to inform you that your registration has been approved.</p>
            <br/>
            <p>Please find your account details below:<br/>Username: <b>${accountDetails.username}</b><br/>Password: <b>${accountDetails.password}</b></p>
            <br/>
            <p>The account has been granted the role of System Admin. You may now login to SimplyManaged using the above credentials.</p>
            <br/>
            <p>Your next step:<br/>1. Do remember to change your password after logging in for the first time.<br/>2. Review your company and account details and update if necessary.<br/>3. Enjoy using SimplyManaged!</p>
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

export const sendRejectedEmail = async (email: string, name: string, company: string) => {
  try {
    const info = await transporter.sendMail({
      from: '"SimplyManaged" <teamsimplymanaged@gmail.com>',
      to: email,
      subject: "SimplyManaged Registration Rejected",
      text: `
            Hi ${name},

            We have reviewed your registration for the company ${company} and are sorry to inform you that your registration has been rejected.

            Please feel free to contact us if you have any queries.
            
            Best Regards,
            SimplyManaged Team`,
      html: `
        <div>
            <p>Hi <b>${name}</b>,</p>
            <br/>
            <p>We have reviewed your registration for the company <b>${company}</b> and are sorry to inform you that your registration has been rejected.</p>
            <br/>
            <p>Please feel free to contact us if you have any queries.</p>
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

