import nodemailer from "nodemailer";
import { logger } from "../utils/logger";

// ── SES SMTP transport ────────────────────────────────────────────────────────
// Credentials: IAM user axiom-ses-smtp (ses:SendRawEmail only).
// SMTP password is the SES-derived v4 password, NOT the raw IAM secret key.
// Set SES_SMTP_USER and SES_SMTP_PASS in AWS Secrets Manager (axiom/prod).

const transporter = nodemailer.createTransport({
  host:   "email-smtp.us-east-1.amazonaws.com",
  port:   587,
  secure: false,
  auth: {
    user: process.env["SES_SMTP_USER"] ?? "",
    pass: process.env["SES_SMTP_PASS"] ?? "",
  },
});

const FROM = process.env["EMAIL_FROM"] ?? "AXIOM <noreply@saswat.app>";

// ── Templates ─────────────────────────────────────────────────────────────────

type TemplateData = Record<string, string | number | undefined>;

const TEMPLATES: Record<string, (d: TemplateData) => { subject: string; html: string }> = {

  welcome: (d) => ({
    subject: `Welcome to AXIOM, ${d["name"]}!`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px">
        <h1 style="color:#7c3aed">Welcome aboard, ${d["name"]}! 🎉</h1>
        <p>Your account is ready. Start by uploading your resume and let AI power your job search.</p>
        <a href="${d["url"]}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#7c3aed;color:#fff;border-radius:8px;text-decoration:none">
          Go to Dashboard
        </a>
        <p style="margin-top:24px;color:#6b7280;font-size:13px">
          If you didn't create this account, please ignore this email.
        </p>
      </div>`,
  }),

  "verify-email": (d) => ({
    subject: "Verify your AXIOM email address",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px">
        <h2 style="color:#7c3aed">Verify your email</h2>
        <p>Hi ${d["name"]}, click below to verify your email address.</p>
        <a href="${d["url"]}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#7c3aed;color:#fff;border-radius:8px;text-decoration:none">
          Verify Email
        </a>
        <p style="margin-top:16px;color:#6b7280;font-size:13px">Link expires in 24 hours.</p>
      </div>`,
  }),

  "reset-password": (d) => ({
    subject: "Reset your AXIOM password",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px">
        <h2 style="color:#7c3aed">Password Reset</h2>
        <p>Hi ${d["name"]}, we received a request to reset your password.</p>
        <a href="${d["url"]}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#7c3aed;color:#fff;border-radius:8px;text-decoration:none">
          Reset Password
        </a>
        <p style="margin-top:16px;color:#6b7280;font-size:13px">
          Link expires in 1 hour. If you didn't request this, you can safely ignore this email.
        </p>
      </div>`,
  }),

  "job-alert": (d) => ({
    subject: `${d["count"]} new jobs match your alert "${d["alertName"]}"`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px">
        <h2 style="color:#7c3aed">New Job Matches</h2>
        <p>Hi ${d["name"]}, we found <strong>${d["count"]} new jobs</strong> matching your alert <em>${d["alertName"]}</em>.</p>
        <a href="${d["url"]}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#7c3aed;color:#fff;border-radius:8px;text-decoration:none">
          View Jobs
        </a>
        <p style="margin-top:24px;color:#6b7280;font-size:12px">
          <a href="${d["unsubscribeUrl"]}" style="color:#6b7280">Unsubscribe from this alert</a>
        </p>
      </div>`,
  }),

  "otp-verify": (d) => ({
    subject: "Verify your AXIOM email address",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px">
        <h2 style="color:#7c3aed">Verify your email</h2>
        <p style="color:#374151">Hi ${d["name"]}, use the code below to verify your email address.</p>
        <div style="text-align:center;margin:24px 0;padding:16px;background:#f5f3ff;border-radius:12px;border:1px solid #e0e7ff">
          <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#7c3aed">${d["otp"]}</span>
        </div>
        <p style="color:#6b7280;font-size:13px">Code expires in 15 minutes. If you didn't create an account, please ignore this email.</p>
      </div>`,
  }),

  "otp-reset": (d) => ({
    subject: "Reset your AXIOM password",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px">
        <h2 style="color:#7c3aed">Password Reset</h2>
        <p style="color:#374151">Hi ${d["name"]}, use the code below to reset your password.</p>
        <div style="text-align:center;margin:24px 0;padding:16px;background:#f5f3ff;border-radius:12px;border:1px solid #e0e7ff">
          <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#7c3aed">${d["otp"]}</span>
        </div>
        <p style="color:#6b7280;font-size:13px">Code expires in 15 minutes. If you didn't request this, please ignore this email.</p>
      </div>`,
  }),

  "weekly-digest": (d) => ({
    subject: `Your AXIOM weekly digest — ${d["week"]}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px">
        <h2 style="color:#7c3aed">Your Week in Review 📊</h2>
        <p>Hi ${d["name"]}, here's what happened this week:</p>
        <ul style="padding-left:20px;color:#374151">
          <li>${d["applications"]} applications submitted</li>
          <li>${d["interviews"]} interviews scheduled</li>
          <li>${d["newJobs"]} new matching jobs found</li>
        </ul>
        <a href="${d["url"]}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#7c3aed;color:#fff;border-radius:8px;text-decoration:none">
          View Full Dashboard
        </a>
        <p style="margin-top:24px;color:#6b7280;font-size:12px">
          <a href="${d["unsubscribeUrl"]}" style="color:#6b7280">Unsubscribe from weekly digest</a>
        </p>
      </div>`,
  }),
};

// ── Public API ────────────────────────────────────────────────────────────────

export function renderTemplate(name: string, data: TemplateData) {
  const tmpl = TEMPLATES[name];
  if (!tmpl) throw new Error(`Unknown email template: ${name}`);
  return tmpl(data);
}

export async function sendEmail(opts: {
  to:       string;
  template: string;
  data:     TemplateData;
}): Promise<void> {
  const { subject, html } = renderTemplate(opts.template, opts.data);

  if (!process.env["SES_SMTP_USER"] || !process.env["SES_SMTP_PASS"]) {
    logger.warn(`SES credentials not configured. Skipping email to ${opts.to} [${opts.template}]`);
    return;
  }

  await transporter.sendMail({ from: FROM, to: opts.to, subject, html });
  logger.info(`Email sent via SES SMTP to ${opts.to} [Template: ${opts.template}]`);
}
