import { describe, it, expect } from "vitest";
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
} from "../src/shared/utils/email-templates.js";
import {
    sendEmailOtp,
    sendWelcomeEmail,
    sendPasswordChangedEmail,
    sendOrgInviteEmail,
    sendTaskAssignmentEmail,
    sendTaskUpdateEmail,
    sendCommentMentionEmail,
    sendSprintDeadlineEmail,
    sendPaymentReceiptEmail,
    sendSubscriptionExpiryEmail,
} from "../src/shared/utils/email.js";

describe("Email Templates & Utility Tests", () => {
    it("should render OTP email HTML correctly", () => {
        const html = renderOtpEmail("654321");
        expect(html).toContain("654321");
        expect(html).toContain("Verification Code");
        expect(html).toContain("UNIFIED");
    });

    it("should render Welcome email HTML correctly", () => {
        const html = renderWelcomeEmail("JohnDoe");
        expect(html).toContain("JohnDoe");
        expect(html).toContain("Welcome to Unified PM!");
    });

    it("should render Password Security email HTML correctly", () => {
        const html = renderPasswordChangedEmail("JohnDoe");
        expect(html).toContain("JohnDoe");
        expect(html).toContain("Password Security Notice");
    });

    it("should render Org Invite email HTML correctly", () => {
        const html = renderOrgInviteEmail("Alice", "Acme Corp", "Admin");
        expect(html).toContain("Alice");
        expect(html).toContain("Acme Corp");
        expect(html).toContain("Admin");
    });

    it("should render Task Assignment email HTML correctly", () => {
        const html = renderTaskAssignmentEmail(
            "Fix Bug #101",
            "Sprint 1",
            "Mobile App",
            "Acme Corp",
        );
        expect(html).toContain("Fix Bug #101");
        expect(html).toContain("Sprint 1");
        expect(html).toContain("Mobile App");
    });

    it("should render Task Update email HTML correctly", () => {
        const html = renderTaskUpdateEmail(
            "Fix Bug #101",
            "todo",
            "in_progress",
            "Mobile App",
            "Acme Corp",
        );
        expect(html).toContain("Fix Bug #101");
        expect(html).toContain("todo");
        expect(html).toContain("in_progress");
    });

    it("should render Comment Mention email HTML correctly", () => {
        const html = renderCommentMentionEmail(
            "Bob",
            "Please review this PR",
            'on task "Fix Bug"',
        );
        expect(html).toContain("Bob");
        expect(html).toContain("Please review this PR");
    });

    it("should render Sprint Deadline email HTML correctly", () => {
        const html = renderSprintDeadlineEmail(
            "Sprint 1",
            "2026-08-10",
            "Mobile App",
            "Acme Corp",
        );
        expect(html).toContain("Sprint 1");
        expect(html).toContain("2026-08-10");
    });

    it("should render Payment Receipt email HTML correctly", () => {
        const html = renderPaymentReceiptEmail(
            "Acme Corp",
            "₹1000",
            "pay_12345",
        );
        expect(html).toContain("Acme Corp");
        expect(html).toContain("₹1000");
        expect(html).toContain("pay_12345");
    });

    it("should render Subscription Expiry email HTML correctly", () => {
        const html = renderSubscriptionExpiryEmail("Acme Corp", "2026-08-15");
        expect(html).toContain("Acme Corp");
        expect(html).toContain("2026-08-15");
    });

    it("should execute send email functions without crashing when unconfigured", async () => {
        const res1 = await sendEmailOtp("test@example.com", "123456");
        expect(res1).toBeDefined();

        const res2 = await sendWelcomeEmail("test@example.com", "TestUser");
        expect(res2).toBeDefined();

        const res3 = await sendPasswordChangedEmail(
            "test@example.com",
            "TestUser",
        );
        expect(res3).toBeDefined();

        const res4 = await sendOrgInviteEmail(
            "test@example.com",
            "Admin",
            "TestOrg",
            "Member",
        );
        expect(res4).toBeDefined();

        const res5 = await sendTaskAssignmentEmail(
            "test@example.com",
            "Task 1",
            "Sprint 1",
            "Proj 1",
            "Org 1",
        );
        expect(res5).toBeDefined();

        const res6 = await sendTaskUpdateEmail(
            "test@example.com",
            "Task 1",
            "todo",
            "done",
            "Proj 1",
            "Org 1",
        );
        expect(res6).toBeDefined();

        const res7 = await sendCommentMentionEmail(
            "test@example.com",
            "UserA",
            "hello",
            "on task",
        );
        expect(res7).toBeDefined();

        const res8 = await sendSprintDeadlineEmail(
            "test@example.com",
            "Sprint 1",
            "2026-08-10",
            "Proj 1",
            "Org 1",
        );
        expect(res8).toBeDefined();

        const res9 = await sendPaymentReceiptEmail(
            "test@example.com",
            "Org 1",
            "₹500",
            "pay_99",
        );
        expect(res9).toBeDefined();

        const res10 = await sendSubscriptionExpiryEmail(
            "test@example.com",
            "Org 1",
            "2026-08-10",
        );
        expect(res10).toBeDefined();
    });
});
