import { buildEmailFooter } from "./emailFooter";

export function buildCertificateEmail(
  volunteerName: string,
  activityTitle: string,
  pngUrl: string,
): string {
  const green = "#16a34a";

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>شهادتك التطوعية</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;direction:rtl;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f5;padding:32px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;background:#fff;border-radius:12px;overflow:hidden;">

      <!-- Header -->
      <tr>
        <td align="center" style="background:${green};padding:32px 32px 28px;">
          <p style="margin:0 0 6px;font-size:11px;color:rgba(255,255,255,0.75);font-weight:700;letter-spacing:1.5px;">YOUTHPRINTS · بصمات شبابية</p>
          <p style="margin:0;font-size:24px;font-weight:800;color:#ffffff;">شهادتك التطوعية جاهزة</p>
        </td>
      </tr>

      <!-- Greeting -->
      <tr>
        <td style="padding:32px 32px 0;">
          <p style="margin:0 0 8px;font-size:16px;color:#111;font-weight:700;">مرحباً ${volunteerName}،</p>
          <p style="margin:0;font-size:14px;color:#555;line-height:1.9;">
            يسعدنا إخبارك بأن شهادة مشاركتك في النشاط التالي أصبحت جاهزة:
          </p>
        </td>
      </tr>

      <!-- Activity Title -->
      <tr>
        <td style="padding:16px 32px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="background:#f0fdf4;padding:14px 16px;">
                <p style="margin:0;font-size:15px;font-weight:700;color:${green};">${activityTitle}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Certificate Image -->
      <tr>
        <td style="padding:0 32px 28px;">
          <img src="${pngUrl}" alt="شهادة ${volunteerName}" width="516" style="width:100%;height:auto;display:block;border:1px solid #e5e7eb;" />
        </td>
      </tr>

      <!-- Divider -->
      <tr><td style="padding:0 32px;"><table width="100%"><tr><td style="border-top:1px solid #e5e7eb;font-size:0;">&nbsp;</td></tr></table></td></tr>

      <!-- Download Buttons -->
      <tr>
        <td style="padding:24px 32px 8px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td width="48%">
                <a href="${pngUrl}" target="_blank" style="display:block;background:#f4f4f5;color:${green};text-align:center;padding:13px;font-size:12px;font-weight:700;text-decoration:none;border-radius:8px;border:1.5px solid ${green};">
                 تحميل الشهادة
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      ${buildEmailFooter({ showPhone: true })}

    </table>
  </td></tr>
</table>
</body>
</html>`;
}