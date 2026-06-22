import nodemailer from "nodemailer";
import { Resend } from "resend";
import { logger } from "../utils/logger";

// ── Transport (Resend for production, Nodemailer/SMTP for dev fallback) ───────

const RESEND_API_KEY = process.env["RESEND_API_KEY"];
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const transporter = !resend
  ? nodemailer.createTransport({
      host:   process.env["SMTP_HOST"]     ?? "smtp.ethereal.email",
      port:   Number(process.env["SMTP_PORT"]   ?? 587),
      secure: process.env["SMTP_SECURE"]   === "true",
      auth: {
        user: process.env["SMTP_USER"]  ?? "",
        pass: process.env["SMTP_PASS"]  ?? "",
      },
    })
  : null;

const FROM = process.env["EMAIL_FROM"] ?? "AXIOM <noreply@axiom.dev>";

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
  
  if (resend) {
    const { error } = await resend.emails.send({
      from: FROM,
      to: [opts.to],
      subject,
      html,
    });
    if (error) {
      logger.error("Failed to send email via Resend", error);
      throw error;
    }
    logger.info(`Email sent via Resend to ${opts.to} [Template: ${opts.template}]`);
  } else if (transporter) {
    await transporter.sendMail({ from: FROM, to: opts.to, subject, html });
    logger.info(`Email sent via Nodemailer fallback to ${opts.to} [Template: ${opts.template}]`);
  } else {
    logger.warn(`No email provider configured. Skip sending email to ${opts.to}`);
  }
}
