export function buildContactEmail(
  senderName: string,
  senderEmail: string,
  message: string
): string {
  const green = "#15803d";
  const sentAt = new Date().toLocaleString("ar-JO", {
    timeZone: "Asia/Amman",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding-bottom:12px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#999;letter-spacing:0.8px;">${label}</p>
        <p style="margin:0;font-size:15px;font-weight:700;color:#111;">${value}</p>
      </td>
    </tr>`;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl" xmlns="http://www.w3.org/1999/xhtml">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;direction:rtl;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f5;padding:32px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#fff;">

      <tr>
        <td align="center" style="padding:32px 32px 20px;">
          <p style="margin:0 0 4px;font-size:11px;color:#999;font-weight:700;letter-spacing:1px;">مبادرة بصمات شبابية</p>
          <p style="margin:0;font-size:22px;font-weight:800;color:#111;">رسالة جديدة من الموقع</p>
        </td>
      </tr>

      <tr><td style="padding:0 32px;"><table width="100%"><tr><td style="border-top:1px solid #eee;font-size:0;">&nbsp;</td></tr></table></td></tr>

      <tr>
        <td style="padding:24px 32px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            ${row("الاسم", senderName)}
            <tr>
              <td style="padding-bottom:12px;">
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#999;letter-spacing:0.8px;">البريد الإلكتروني</p>
                <a href="mailto:${senderEmail}" style="margin:0;font-size:15px;font-weight:700;color:${green};text-decoration:none;">${senderEmail}</a>
              </td>
            </tr>
            ${row("وقت الإرسال", sentAt)}
          </table>
        </td>
      </tr>

      <tr><td style="padding:20px 32px;"><table width="100%"><tr><td style="border-top:1px solid #eee;font-size:0;">&nbsp;</td></tr></table></td></tr>

      <tr>
        <td style="padding:0 32px 28px;">
          <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#999;letter-spacing:0.8px;">الرسالة</p>
          <p style="margin:0;font-size:14px;color:#333;line-height:1.9;padding:16px;background:#f9f9f9;border-right:3px solid ${green};">${message.replace(/\n/g, "<br>")}</p>
        </td>
      </tr>

      <tr>
        <td style="padding:0 32px 32px;">
          <a href="mailto:${senderEmail}" style="display:block;background:${green};color:#fff;text-align:center;padding:14px;font-size:15px;font-weight:700;text-decoration:none;">الرد على الرسالة</a>
        </td>
      </tr>

      <tr>
        <td align="center" style="padding:20px 32px;background:#f9f9f9;">
          <p style="margin:0;font-size:12px;color:#aaa;">
            <a href="mailto:support@youthprints.online" style="color:${green};text-decoration:none;">support@youthprints.online</a>
            &nbsp;·&nbsp;
            <a href="https://youthprints.online" style="color:${green};text-decoration:none;">youthprints.online</a>
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}