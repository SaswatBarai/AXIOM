# Runbook: Email Deliverability Incidents

**Owner:** Platform Team  
**Last Updated:** 2026-06-21  
**Severity Levels:** P1 (>50% bounce rate), P2 (5-50%), P3 (<5%)

---

## Symptoms

| Symptom | Likely Cause |
|---------|-------------|
| Emails not arriving at all | Wrong SMTP credentials / firewall blocking port 587 |
| Landing in spam | Missing DKIM/SPF/DMARC, too-high sending rate, low domain reputation |
| Bounce rate spike | Sending to stale / invalid addresses |
| Queue growing, emails delayed | Bull worker crashed or Redis connection lost |

---

## Diagnostic Steps

### 1. Check the email queue

```bash
# Count jobs in each state
redis-cli llen bull:email:wait
redis-cli llen bull:email:active
redis-cli llen bull:email:failed
redis-cli llen bull:email:completed
```

If `failed` is large, inspect recent failures:
```bash
redis-cli lrange bull:email:failed 0 9
```

### 2. Check API logs for email errors

```bash
# In production (CloudWatch / structured logs)
grep '"level":"error"' /var/log/axiom/api.log | grep -i email | tail -50
```

### 3. Verify SMTP connectivity

```bash
# Replace with your SMTP host
nc -zv smtp.eu-west-1.amazonaws.com 587
# or for Resend
nc -zv smtp.resend.com 587
```

### 4. Verify DNS records

```bash
# SPF
dig TXT axiom.dev | grep spf
# DKIM — replace selector with your SES/Resend selector
dig TXT <selector>._domainkey.axiom.dev
# DMARC
dig TXT _dmarc.axiom.dev
```

Use [mail-tester.com](https://mail-tester.com) to get a deliverability score.

---

## Resolution Playbook

### P1 — No emails sending (total outage)

1. Check env vars: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` are set.
2. Restart Bull email worker: `pm2 restart axiom-api` (or redeploy pod).
3. If Redis is down: restore Redis, then Bull auto-reconnects.
4. Drain the failed queue after fix: jobs will not auto-retry after 3 attempts — re-enqueue manually or via admin panel.

### P2 — High spam rate

1. Pull bounce/complaint report from SES Console → Suppression List.
2. Remove complained addresses from active users (update `emailNotifications = false`).
3. Reduce sending rate: lower Bull concurrency from 10 → 2 temporarily.
4. Check email content for spam triggers using [mail-tester.com](https://mail-tester.com).
5. Verify DKIM signature: `DKIM=pass` in received headers.

### P3 — Occasional bounces

1. Normal — hard bounces <2% is acceptable.
2. Add bounced addresses to a suppression list in the DB (future: `email_suppressions` table).
3. SES automatically handles suppression for verified sending domains.

---

## Frequency Caps (anti-spam)

| Email Type | Cap |
|---|---|
| Job alert emails | Max 3 per user per day |
| Weekly digest | Max 1 per user per week (Monday 09:00) |
| Transactional (welcome, verify, reset) | No cap |

Caps are enforced by checking `JobAlert.lastSentAt` before enqueueing. To reset caps manually:
```sql
UPDATE job_alerts SET "lastSentAt" = NULL WHERE "userId" = '<user_id>';
```

---

## Unsubscribe Handling

All marketing emails include an unsubscribe link pointing to `/dashboard/settings`.  
Users can disable email notifications in `UserPreferences.emailNotifications`.  
To honour an unsubscribe immediately:
```sql
UPDATE user_preferences SET "emailNotifications" = false WHERE "userId" = '<user_id>';
```

---

## Contacts

| Role | Contact |
|---|---|
| On-call engineer | PagerDuty rotation |
| AWS SES support | AWS Support console (Business/Enterprise plan) |
| Resend support | support@resend.com |
