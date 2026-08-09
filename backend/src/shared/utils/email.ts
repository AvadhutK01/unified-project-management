import nodemailer from "nodemailer";
import { env } from "../../config/env.js";
import { internalServerError } from "../errors/app-error.js";
import {
    renderOtpEmail,
    renderWelcomeEmail,
    renderPasswordChangedEmail,
    renderOrgInviteEmail,
    renderTaskAssignmentEmail,
    renderTaskUpdateEmail,
    renderCommentMentionEmail,
    renderSprintDeadlineEmail,
    renderPaymentReceiptEmail,
    renderSubscriptionExpiryEmail,
} from "./email-templates.js";

const smtpUser = env.SMTP_USER;
const smtpPass = env.SMTP_PASS;
const smtpHost = env.SMTP_HOST;
const smtpPort = env.SMTP_PORT;
const smtpFrom = env.SMTP_FROM || smtpUser || "support@unifiedpm.com";
const frontendUrl = (
    env.FRONTEND_URL ||
    process.env.FRONTEND_URL ||
    "http://localhost:5173"
).replace(/\/$/, "");

const transporter =
    smtpUser && smtpPass
        ? nodemailer.createTransport({
              host: smtpHost,
              port: smtpPort,
              secure: smtpPort === 465,
              auth: {
                  user: smtpUser,
                  pass: smtpPass,
              },
          })
        : null;

const sendGenericEmail = async (
    toEmail: string,
    subject: string,
    htmlContent: string,
) => {
    if (!transporter) {
        console.warn(
            `[sendGenericEmail] Nodemailer SMTP credentials not configured (SMTP_USER/SMTP_PASS). Suppressed email "${subject}" to ${toEmail}`,
        );
        return { status: "mocked", to: toEmail, subject };
    }

    try {
        const info = await transporter.sendMail({
            from: `"Unified PM" <${smtpFrom}>`,
            to: toEmail,
            subject,
            html: htmlContent,
        });
        return info;
    } catch (error) {
        console.error(
            `[sendGenericEmail] Error sending email "${subject}" via Nodemailer to ${toEmail}:`,
            error,
        );
        throw internalServerError(
            "Something went wrong, please try again later!",
        );
    }
};

export const sendEmailOtp = async (toEmail: string, otp: string) => {
    const html = renderOtpEmail(otp);
    return sendGenericEmail(toEmail, "Your Verification Code", html);
};

export const sendWelcomeEmail = async (toEmail: string, username: string) => {
    const actionUrl = `${frontendUrl}/organization-loader`;
    const html = renderWelcomeEmail(username, actionUrl);
    return sendGenericEmail(toEmail, "Welcome to Unified PM!", html);
};

export const sendPasswordChangedEmail = async (
    toEmail: string,
    username: string,
) => {
    const securityUrl = `${frontendUrl}/forgot-password`;
    const html = renderPasswordChangedEmail(username, securityUrl);
    return sendGenericEmail(
        toEmail,
        "Password Security Notice - Unified PM",
        html,
    );
};

export const sendOrgInviteEmail = async (
    toEmail: string,
    inviterName: string,
    orgName: string,
    roleName: string,
) => {
    const inviteUrl = `${frontendUrl}/org-setup/select`;
    const html = renderOrgInviteEmail(
        inviterName,
        orgName,
        roleName,
        inviteUrl,
    );
    return sendGenericEmail(toEmail, `Invitation to join ${orgName}`, html);
};

export const sendTaskAssignmentEmail = async (
    toEmail: string,
    taskTitle: string,
    sprintTitle: string,
    projectTitle: string,
    orgName: string,
    metadata?: {
        orgSlug?: string;
        projectId?: string;
        phaseId?: string;
        sprintId?: string;
        workitemId?: string;
    },
) => {
    const taskUrl =
        metadata?.orgSlug &&
        metadata?.projectId &&
        metadata?.phaseId &&
        metadata?.sprintId &&
        metadata?.workitemId
            ? `${frontendUrl}/${metadata.orgSlug}/projects/${metadata.projectId}/phases/${metadata.phaseId}/sprints/${metadata.sprintId}/work-items/${metadata.workitemId}`
            : `${frontendUrl}/organization-loader`;
    const html = renderTaskAssignmentEmail(
        taskTitle,
        sprintTitle,
        projectTitle,
        orgName,
        taskUrl,
    );
    return sendGenericEmail(toEmail, `Task Assignment: ${taskTitle}`, html);
};

export const sendTaskUpdateEmail = async (
    toEmail: string,
    taskTitle: string,
    oldStatus: string,
    newStatus: string,
    projectTitle: string,
    orgName: string,
    metadata?: {
        orgSlug?: string;
        projectId?: string;
        phaseId?: string;
        sprintId?: string;
        workitemId?: string;
    },
) => {
    const taskUrl =
        metadata?.orgSlug &&
        metadata?.projectId &&
        metadata?.phaseId &&
        metadata?.sprintId &&
        metadata?.workitemId
            ? `${frontendUrl}/${metadata.orgSlug}/projects/${metadata.projectId}/phases/${metadata.phaseId}/sprints/${metadata.sprintId}/work-items/${metadata.workitemId}`
            : `${frontendUrl}/organization-loader`;
    const html = renderTaskUpdateEmail(
        taskTitle,
        oldStatus,
        newStatus,
        projectTitle,
        orgName,
        taskUrl,
    );
    return sendGenericEmail(toEmail, `Task Update: ${taskTitle}`, html);
};

export const sendCommentMentionEmail = async (
    toEmail: string,
    mentionerName: string,
    commentPreview: string,
    contextDescription: string,
    metadata?: {
        orgSlug?: string;
        projectId?: string;
        phaseId?: string;
        sprintId?: string;
        workitemId?: string;
    },
) => {
    const viewUrl =
        metadata?.orgSlug &&
        metadata?.projectId &&
        metadata?.phaseId &&
        metadata?.sprintId &&
        metadata?.workitemId
            ? `${frontendUrl}/${metadata.orgSlug}/projects/${metadata.projectId}/phases/${metadata.phaseId}/sprints/${metadata.sprintId}/work-items/${metadata.workitemId}`
            : `${frontendUrl}/organization-loader`;
    const html = renderCommentMentionEmail(
        mentionerName,
        commentPreview,
        contextDescription,
        viewUrl,
    );
    return sendGenericEmail(
        toEmail,
        `${mentionerName} mentioned you in a comment`,
        html,
    );
};

export const sendSprintDeadlineEmail = async (
    toEmail: string,
    sprintTitle: string,
    endDate: string,
    projectTitle: string,
    orgName: string,
    metadata?: {
        orgSlug?: string;
        projectId?: string;
        phaseId?: string;
        sprintId?: string;
    },
) => {
    const sprintUrl =
        metadata?.orgSlug &&
        metadata?.projectId &&
        metadata?.phaseId &&
        metadata?.sprintId
            ? `${frontendUrl}/${metadata.orgSlug}/projects/${metadata.projectId}/phases/${metadata.phaseId}/sprints/${metadata.sprintId}/work-items`
            : `${frontendUrl}/organization-loader`;
    const html = renderSprintDeadlineEmail(
        sprintTitle,
        endDate,
        projectTitle,
        orgName,
        sprintUrl,
    );
    return sendGenericEmail(
        toEmail,
        `Sprint Deadline: ${sprintTitle} ends tomorrow`,
        html,
    );
};

export const sendPaymentReceiptEmail = async (
    toEmail: string,
    orgName: string,
    amountFormatted: string,
    paymentId: string,
    orgSlug?: string,
) => {
    const billingUrl = orgSlug
        ? `${frontendUrl}/${orgSlug}/billing`
        : `${frontendUrl}/organization-loader`;
    const html = renderPaymentReceiptEmail(
        orgName,
        amountFormatted,
        paymentId,
        billingUrl,
    );
    return sendGenericEmail(toEmail, `Payment Receipt - ${orgName}`, html);
};

export const sendSubscriptionExpiryEmail = async (
    toEmail: string,
    orgName: string,
    expiryDate: string,
    orgSlug?: string,
) => {
    const renewUrl = orgSlug
        ? `${frontendUrl}/${orgSlug}/billing`
        : `${frontendUrl}/organization-loader`;
    const html = renderSubscriptionExpiryEmail(orgName, expiryDate, renewUrl);
    return sendGenericEmail(
        toEmail,
        `Subscription Expiry Warning - ${orgName}`,
        html,
    );
};
