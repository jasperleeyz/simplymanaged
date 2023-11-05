"use strict";

import { Request } from "@prisma/client";
import AccountDetails from "../typings/account-details";
import { DATE } from "./constants";

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

export async function sendRegistrationEmail(
  email: string,
  name: string,
  company: string
) {
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
    console.log("Registration received email sent: %s", info.messageId);
  } catch (error) {
    console.error(error);
  }
}

export const sendApprovedEmail = async (
  email: string,
  name: string,
  company: string,
  accountDetails: AccountDetails
) => {
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
    console.log("Registration approved email sent: %s", info.messageId);
  } catch (error) {
    console.error(error);
  }
};

export const sendRejectedEmail = async (
  email: string,
  name: string,
  company: string
) => {
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
    console.log("Registration rejected email sent: %s", info.messageId);
  } catch (error) {
    console.error(error);
  }
};

export const sendApproveRejectRequestEmail = async (
  email: string,
  name: string,
  requestType: string,
  requestStatus: string,
  request: any
) => {
  try {
    const getAdditionalRequestDetails = (requestType: string, type: string) => {
      if (requestType.toLowerCase() === "leave") {
        return type === "text"
          ? `
            Type: ${request.leave_request.type}
            Start Date: ${request.leave_request.start_date.toLocaleDateString(DATE.LANGUAGE, DATE.DDMMYYYY_OPTION)}
            End Date: ${request.leave_request.end_date.toLocaleDateString(DATE.LANGUAGE, DATE.DDMMYYYY_OPTION)}
            Remarks: ${request.leave_request.remarks || "N/A"}
        `
          : `Type: <b>${
              request.leave_request.type
            }</b><br/>Start Date: <b>${
              request.leave_request.start_date.toLocaleDateString(DATE.LANGUAGE, DATE.DDMMYYYY_OPTION)
            }</b><br/>End Date: <b>${
              request.leave_request.end_date.toLocaleDateString(DATE.LANGUAGE, DATE.DDMMYYYY_OPTION)
            }</b><br/>Remarks: <b>${
              request.leave_request.remarks || "N/A"
            }</b>`;
      } else if (requestType.toLowerCase() === "swap") {
        return type === "text"
          ? `
            Your shift: ${request.swap_request.start_date}
            Requested Shift: ${request.swap_request.end_date}
            Reason: ${request.swap_request.reason || "N/A"}
        `
          : `Your shift: <b>${
              request.swap_request.start_date
            }</b><br/>Requested Shift: <b>${
              request.swap_request.end_date
            }</b><br/>Reason: <b>${request.swap_request.reason || "N/A"}</b>`;
      } else if (requestType.toLowerCase() === "bid") {
        return type === "text"
          ? `
            Requested Shift: ${request.bid_request.end_date}
        `
          : `Requested Shift: <b>${request.bid_request.end_date}</b>`;
      }
    };

    const info = await transporter.sendMail({
      from: '"SimplyManaged" <teamsimplymanaged@gmail.com>',
      to: email,
      subject: "SimplyManaged Request Status Update",
      text: `
            Hi ${name},

            Your ${requestType.toLowerCase()} request has been ${requestStatus === "A" ? "approved" : "rejected"}.

            Your request details:
            Request Type: ${requestType}
            ${getAdditionalRequestDetails(requestType, "text")}
            
            Best Regards,
            SimplyManaged Team`,
      html: `
        <div>
            <p>Hi <b>${name}</b>,</p>
            <p>Your ${requestType.toLowerCase()} request has been <b>${requestStatus === "A" ? "approved" : "rejected"}</b>.</p>
            <p>Your request details:<br/>Request Type: <b>${requestType}</b><br/>${getAdditionalRequestDetails(
        requestType,
        "html"
      )}</p>
            <br/>
            <p>Best Regards,<br/>SimplyManaged Team</p>
        </div>
        `,
    });
    console.log("Request status update email sent: %s", info.messageId);
  } catch (error) {
    console.error(error);
  }
};
