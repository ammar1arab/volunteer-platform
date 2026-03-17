import { buildEmailFooter } from "./emailFooter";

export function buildContactEmail(senderName: string, senderEmail: string, message: string): string {
  const green = "#16a34a";
  const sentAt = new Date()
    .toLocaleString("en-GB", {
      timeZone: "Asia/Amman",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    })
    .replace(/(\d+)\/(\d+)\/(\d+),?/, "$3/$2/$1");

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding-bottom:16px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#999;letter-spacing:0.8px;">${label}</p>
        <p style="margin:0;font-size:15px;font-weight:700;color:#111;">${value}</p>
      </td>
    </tr>`;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>رسالة جديدة</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;direction:rtl;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f5;padding:32px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;background:#fff;border-radius:12px;overflow:hidden;">

      <!-- Header -->
      <tr>
        <td align="center" style="background:${green};padding:32px 32px 28px;">
          <p style="margin:0 0 6px;font-size:11px;color:rgba(255,255,255,0.75);font-weight:700;letter-spacing:1.5px;">YOUTHPRINTS · بصمات شبابية</p>
          <p style="margin:0;font-size:24px;font-weight:800;color:#ffffff;">رسالة جديدة من الموقع الإلكتروني</p>
        </td>
      </tr>

      <!-- Sender Info -->
      <tr>
        <td style="padding:28px 32px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            ${row("الاسم", senderName)}
            <tr>
              <td style="padding-bottom:16px;">
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#999;letter-spacing:0.8px;">البريد الإلكتروني</p>
                <a href="mailto:${senderEmail}" style="font-size:15px;font-weight:700;color:${green};text-decoration:none;">${senderEmail}</a>
              </td>
            </tr>
            ${row("وقت الإرسال", sentAt)}
          </table>
        </td>
      </tr>

      <!-- Divider -->
      <tr><td style="padding:4px 32px 20px;"><table width="100%"><tr><td style="border-top:1px solid #e5e7eb;font-size:0;">&nbsp;</td></tr></table></td></tr>

      <!-- Message -->
      <tr>
        <td style="padding:0 32px 28px;">
          <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#999;letter-spacing:0.8px;">الرسالة</p>
          <p style="margin:0;font-size:14px;color:#333;line-height:1.9;padding:16px;background:#f9fafb;">${message.replace(/\n/g, "<br>")}</p>
        </td>
      </tr>

      <!-- Reply Button -->
      <tr>
        <td style="padding:0 32px 32px;">
          <a href="mailto:${senderEmail}" style="display:block;background:${green};color:#fff;text-align:center;padding:14px;font-size:15px;font-weight:700;text-decoration:none;border-radius:8px;">
            الرد على الرسالة
          </a>
        </td>
      </tr>

      ${buildEmailFooter({ showPhone: false })}

    </table>
  </td></tr>
</table>
</body>
</html>`;
}
