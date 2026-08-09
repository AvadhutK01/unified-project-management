/**
 * HTML Email Templates System for Unified PM
 * Provides modern, responsive, premium email design templates with CTA links.
 */

interface BaseTemplateOptions {
    title: string;
    preheader?: string;
    content: string;
}

const renderBaseTemplate = ({
    title,
    preheader = "",
    content,
}: BaseTemplateOptions): string => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B; }
    </style>
</head>
<body style="background-color: #F8FAFC; margin: 0; padding: 0; -webkit-font-smoothing: antialiased;">
    ${preheader ? `<div style="display: none; max-height: 0px; overflow: hidden;">${preheader}</div>` : ""}
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; padding: 40px 16px;">
        <tr>
            <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04); border: 1px solid #E2E8F0;">
                    <!-- Header -->
                    <tr>
                        <td align="center" style="background: linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4F46E5 100%); padding: 36px 32px; text-align: center;">
                            <table border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="background-color: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 10px 16px; border: 1px solid rgba(255, 255, 255, 0.2);">
                                        <span style="font-size: 20px; font-weight: 800; color: #FFFFFF; letter-spacing: 1px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">UNIFIED <span style="color: #818CF8;">PM</span></span>
                                    </td>
                                </tr>
                            </table>
                            <h1 style="color: #FFFFFF; font-size: 22px; font-weight: 700; margin: 20px 0 0 0; letter-spacing: -0.5px;">${title}</h1>
                        </td>
                    </tr>
                    
                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 36px 32px; background-color: #FFFFFF;">
                            ${content}
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #F1F5F9; padding: 24px 32px; text-align: center; border-top: 1px solid #E2E8F0;">
                            <p style="margin: 0; font-size: 13px; color: #64748B; line-height: 1.5;">
                                &copy; ${new Date().getFullYear()} <strong>Unified PM</strong>. All rights reserved.<br>
                                Managing teams, projects, and sprints efficiently.
                            </p>
                            <p style="margin: 12px 0 0 0; font-size: 12px; color: #94A3B8;">
                                You are receiving this notification because you are a registered user on Unified PM.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
};

/**
 * OTP Verification Email Template
 */
export const renderOtpEmail = (otp: string): string => {
    const content = `
        <p style="font-size: 16px; color: #334155; line-height: 1.6; margin-top: 0;">Hello,</p>
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">Use the verification code below to complete your authentication process. This code will expire in <strong>10 minutes</strong>.</p>
        
        <div style="text-align: center; margin: 32px 0;">
            <div style="display: inline-block; background: #EEF2FF; border: 2px dashed #818CF8; border-radius: 14px; padding: 18px 36px;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #3730A3;">${otp}</span>
            </div>
        </div>

        <div style="background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 14px 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 13px; color: #991B1B; line-height: 1.5;">
                <strong>Security Alert:</strong> Never share this OTP with anyone. Our support team will never ask for your verification code.
            </p>
        </div>

        <p style="font-size: 14px; color: #64748B; margin-bottom: 0;">If you did not request this verification code, please ignore this email.</p>
    `;
    return renderBaseTemplate({
        title: "Verification Code",
        preheader: `Your verification code is ${otp}`,
        content,
    });
};

/**
 * Welcome Email Template
 */
export const renderWelcomeEmail = (
    username: string,
    actionUrl: string,
): string => {
    const content = `
        <p style="font-size: 16px; color: #334155; margin-top: 0;">Hi <strong>${username}</strong>,</p>
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">Welcome to <strong>Unified PM</strong>! Your account has been verified successfully.</p>
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">With Unified PM, you can seamlessly manage organizations, collaborate with your teams, track project phases, and run agile sprints effortlessly.</p>
        
        <div style="text-align: center; margin: 32px 0;">
            <a href="${actionUrl}" target="_blank" style="background-color: #4F46E5; color: #FFFFFF; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; text-decoration: none; display: inline-block; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
                Go to Dashboard
            </a>
        </div>
        
        <p style="font-size: 14px; color: #64748B;">If you have any questions, feel free to reach out to our support team.</p>
    `;
    return renderBaseTemplate({
        title: "Welcome to Unified PM!",
        preheader: `Welcome ${username}! Your account is active.`,
        content,
    });
};

/**
 * Password Reset Alert Email Template
 */
export const renderPasswordChangedEmail = (
    username: string,
    securityUrl: string,
): string => {
    const content = `
        <p style="font-size: 16px; color: #334155; margin-top: 0;">Hi <strong>${username}</strong>,</p>
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">Your password for Unified PM was updated successfully.</p>
        
        <div style="background-color: #EFF6FF; border-left: 4px solid #3B82F6; padding: 14px 16px; border-radius: 0 8px 8px 0; margin: 24px 0;">
            <p style="margin: 0; font-size: 13px; color: #1E40AF; line-height: 1.5;">
                If you made this change, no further action is required. If you did not update your password, please secure your account immediately.
            </p>
        </div>

        <div style="text-align: center; margin: 28px 0;">
            <a href="${securityUrl}" target="_blank" style="background-color: #3B82F6; color: #FFFFFF; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; text-decoration: none; display: inline-block;">
                Manage Account Security
            </a>
        </div>
    `;
    return renderBaseTemplate({
        title: "Password Security Notice",
        preheader: "Your password was updated successfully",
        content,
    });
};

/**
 * Organization Invitation Email Template
 */
export const renderOrgInviteEmail = (
    inviterName: string,
    orgName: string,
    roleName: string,
    inviteUrl: string,
): string => {
    const content = `
        <p style="font-size: 16px; color: #334155; margin-top: 0;">Hello,</p>
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">
            <strong>${inviterName}</strong> has invited you to join the organization <strong>"${orgName}"</strong> as a <strong>${roleName}</strong> on Unified PM.
        </p>

        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                    <td style="font-size: 14px; color: #64748B; padding-bottom: 8px;">Organization:</td>
                    <td style="font-size: 14px; font-weight: 600; color: #1E293B; text-align: right; padding-bottom: 8px;">${orgName}</td>
                </tr>
                <tr>
                    <td style="font-size: 14px; color: #64748B; padding-bottom: 8px;">Role:</td>
                    <td style="font-size: 14px; font-weight: 600; color: #4F46E5; text-align: right; padding-bottom: 8px;">${roleName}</td>
                </tr>
                <tr>
                    <td style="font-size: 14px; color: #64748B;">Invited By:</td>
                    <td style="font-size: 14px; font-weight: 600; color: #1E293B; text-align: right;">${inviterName}</td>
                </tr>
            </table>
        </div>

        <div style="text-align: center; margin: 32px 0;">
            <a href="${inviteUrl}" target="_blank" style="background-color: #4F46E5; color: #FFFFFF; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; text-decoration: none; display: inline-block; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
                View & Accept Invitation
            </a>
        </div>

        <p style="font-size: 13px; color: #64748B;">Log in to your account to review pending invitations.</p>
    `;
    return renderBaseTemplate({
        title: `Invitation to join ${orgName}`,
        preheader: `${inviterName} invited you to join ${orgName}`,
        content,
    });
};

/**
 * Task Assignment Email Template
 */
export const renderTaskAssignmentEmail = (
    taskTitle: string,
    sprintTitle: string,
    projectTitle: string,
    orgName: string,
    taskUrl: string,
): string => {
    const content = `
        <p style="font-size: 16px; color: #334155; margin-top: 0;">Hello,</p>
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">You have been assigned a new task on <strong>Unified PM</strong>.</p>
        
        <div style="background-color: #EEF2FF; border-left: 4px solid #4F46E5; padding: 18px; border-radius: 0 12px 12px 0; margin: 24px 0;">
            <h3 style="margin: 0 0 10px 0; color: #1E1B4B; font-size: 17px;">${taskTitle}</h3>
            <p style="margin: 0; font-size: 13px; color: #4338CA; line-height: 1.5;">
                Sprint: <strong>${sprintTitle}</strong><br>
                Project: <strong>${projectTitle}</strong><br>
                Organization: <strong>${orgName}</strong>
            </p>
        </div>

        <div style="text-align: center; margin: 32px 0;">
            <a href="${taskUrl}" target="_blank" style="background-color: #4F46E5; color: #FFFFFF; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; text-decoration: none; display: inline-block;">
                View Task Details
            </a>
        </div>
    `;
    return renderBaseTemplate({
        title: "New Task Assignment",
        preheader: `You were assigned task: ${taskTitle}`,
        content,
    });
};

/**
 * Task Update Email Template
 */
export const renderTaskUpdateEmail = (
    taskTitle: string,
    oldStatus: string,
    newStatus: string,
    projectTitle: string,
    orgName: string,
    taskUrl: string,
): string => {
    const content = `
        <p style="font-size: 16px; color: #334155; margin-top: 0;">Hello,</p>
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">The status of task <strong>"${taskTitle}"</strong> in project <strong>"${projectTitle}"</strong> (${orgName}) has changed.</p>

        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
            <span style="display: inline-block; background-color: #E2E8F0; color: #475569; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600;">${oldStatus}</span>
            <span style="font-size: 18px; color: #94A3B8; margin: 0 12px;">&rarr;</span>
            <span style="display: inline-block; background-color: #C7D2FE; color: #3730A3; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600;">${newStatus}</span>
        </div>

        <div style="text-align: center; margin: 28px 0;">
            <a href="${taskUrl}" target="_blank" style="background-color: #4F46E5; color: #FFFFFF; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; text-decoration: none; display: inline-block;">
                View Task
            </a>
        </div>
    `;
    return renderBaseTemplate({
        title: "Task Status Updated",
        preheader: `Task "${taskTitle}" status changed to ${newStatus}`,
        content,
    });
};

/**
 * Comment Mention Email Template
 */
export const renderCommentMentionEmail = (
    mentionerName: string,
    commentPreview: string,
    contextDescription: string,
    viewUrl: string,
): string => {
    const content = `
        <p style="font-size: 16px; color: #334155; margin-top: 0;">Hello,</p>
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">
            <strong>${mentionerName}</strong> mentioned you in a comment ${contextDescription}:
        </p>

        <div style="background-color: #F1F5F9; border-left: 4px solid #6366F1; padding: 16px; border-radius: 0 10px 10px 0; margin: 24px 0; font-style: italic; color: #334155; font-size: 14px; line-height: 1.6;">
            "${commentPreview}"
        </div>

        <div style="text-align: center; margin: 28px 0;">
            <a href="${viewUrl}" target="_blank" style="background-color: #4F46E5; color: #FFFFFF; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; text-decoration: none; display: inline-block;">
                View Discussion
            </a>
        </div>
    `;
    return renderBaseTemplate({
        title: "New Discussion Mention",
        preheader: `${mentionerName} mentioned you in a comment`,
        content,
    });
};

/**
 * Sprint Deadline Warning Email Template
 */
export const renderSprintDeadlineEmail = (
    sprintTitle: string,
    endDate: string,
    projectTitle: string,
    orgName: string,
    sprintUrl: string,
): string => {
    const content = `
        <p style="font-size: 16px; color: #334155; margin-top: 0;">Hello,</p>
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">
            Reminder: Sprint <strong>"${sprintTitle}"</strong> in project <strong>"${projectTitle}"</strong> (${orgName}) is ending tomorrow.
        </p>

        <div style="background-color: #FFFBEB; border-left: 4px solid #F59E0B; padding: 16px; border-radius: 0 10px 10px 0; margin: 24px 0;">
            <p style="margin: 0; font-size: 14px; color: #B45309;">
                <strong>End Date:</strong> ${endDate}<br>
                Please ensure all assigned tasks are updated and closed before sprint completion.
            </p>
        </div>

        <div style="text-align: center; margin: 28px 0;">
            <a href="${sprintUrl}" target="_blank" style="background-color: #F59E0B; color: #FFFFFF; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; text-decoration: none; display: inline-block;">
                View Sprint Board
            </a>
        </div>
    `;
    return renderBaseTemplate({
        title: "Sprint Ending Tomorrow",
        preheader: `Sprint "${sprintTitle}" ends tomorrow (${endDate})`,
        content,
    });
};

/**
 * Subscription Payment Receipt Email Template
 */
export const renderPaymentReceiptEmail = (
    orgName: string,
    amountFormatted: string,
    paymentId: string,
    billingUrl: string,
): string => {
    const content = `
        <p style="font-size: 16px; color: #334155; margin-top: 0;">Hello,</p>
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">Thank you for your payment! Your subscription for <strong>"${orgName}"</strong> has been successfully updated.</p>

        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                    <td style="font-size: 14px; color: #64748B; padding-bottom: 8px;">Organization:</td>
                    <td style="font-size: 14px; font-weight: 600; color: #1E293B; text-align: right; padding-bottom: 8px;">${orgName}</td>
                </tr>
                <tr>
                    <td style="font-size: 14px; color: #64748B; padding-bottom: 8px;">Amount Paid:</td>
                    <td style="font-size: 14px; font-weight: 700; color: #059669; text-align: right; padding-bottom: 8px;">${amountFormatted}</td>
                </tr>
                <tr>
                    <td style="font-size: 14px; color: #64748B;">Payment ID:</td>
                    <td style="font-size: 14px; font-family: monospace; color: #1E293B; text-align: right;">${paymentId}</td>
                </tr>
            </table>
        </div>

        <div style="text-align: center; margin: 28px 0;">
            <a href="${billingUrl}" target="_blank" style="background-color: #059669; color: #FFFFFF; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; text-decoration: none; display: inline-block;">
                View Billing Details
            </a>
        </div>
    `;
    return renderBaseTemplate({
        title: "Payment Receipt",
        preheader: `Payment receipt of ${amountFormatted} for ${orgName}`,
        content,
    });
};

/**
 * Subscription Expiry Email Template
 */
export const renderSubscriptionExpiryEmail = (
    orgName: string,
    expiryDate: string,
    renewUrl: string,
): string => {
    const content = `
        <p style="font-size: 16px; color: #334155; margin-top: 0;">Hello,</p>
        <p style="font-size: 15px; color: #475569; line-height: 1.6;">Your subscription for organization <strong>"${orgName}"</strong> is scheduled to expire on <strong>${expiryDate}</strong>.</p>

        <div style="background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 16px; border-radius: 0 10px 10px 0; margin: 24px 0;">
            <p style="margin: 0; font-size: 14px; color: #991B1B;">
                To avoid service disruption and preserve your active organization limits, please renew your subscription before ${expiryDate}.
            </p>
        </div>

        <div style="text-align: center; margin: 28px 0;">
            <a href="${renewUrl}" target="_blank" style="background-color: #DC2626; color: #FFFFFF; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; text-decoration: none; display: inline-block;">
                Renew Subscription
            </a>
        </div>
    `;
    return renderBaseTemplate({
        title: "Subscription Expiry Warning",
        preheader: `Subscription for ${orgName} expires on ${expiryDate}`,
        content,
    });
};
