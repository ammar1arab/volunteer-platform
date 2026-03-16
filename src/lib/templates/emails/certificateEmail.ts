export function buildCertificateEmail(
  volunteerName: string,
  activityTitle: string,
  pngUrl: string,
  pdfUrl: string
): string {
  const green = "#15803d";

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;direction:rtl;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:32px 16px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border:1px solid #e5e7eb;max-width:560px;">
      <tr><td style="background-color:${green};height:5px;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr>
        <td style="padding:40px 40px 24px;text-align:center;">
          <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:#6b7280;letter-spacing:2px;">مبادرة بصمات شبابية</p>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:26px;font-weight:800;color:${green};">شهادتك التطوعية جاهزة</p>
        </td>
      </tr>
      <tr><td style="padding:0 40px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="border-top:1px solid #e5e7eb;font-size:0;">&nbsp;</td></tr></table></td></tr>
      <tr>
        <td style="padding:28px 40px;text-align:right;">
          <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:16px;color:#111827;">مرحباً <strong>${volunteerName}</strong>،</p>
          <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;color:#4b5563;line-height:1.7;">شكراً لمشاركتك المميزة في نشاط:</p>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:17px;font-weight:700;color:${green};padding:12px 16px;background-color:#f0fdf4;border-right:4px solid ${green};">${activityTitle}</p>
        </td>
      </tr>
      <tr><td style="padding:0 40px 28px;"><img src="${pngUrl}" alt="شهادة" width="480" style="width:100%;height:auto;display:block;border:1px solid #e5e7eb;" /></td></tr>
      <tr><td style="padding:0 40px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="border-top:1px solid #e5e7eb;font-size:0;">&nbsp;</td></tr></table></td></tr>
      <tr>
        <td style="padding:24px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="49%" align="center">
                <a href="${pdfUrl}" style="display:block;background-color:${green};color:#ffffff;text-align:center;padding:13px 16px;font-family:Arial,sans-serif;font-size:15px;font-weight:700;text-decoration:none;">تحميل PDF</a>
              </td>
              <td width="2%"></td>
              <td width="49%" align="center">
                <a href="${pngUrl}" style="display:block;background-color:#ffffff;color:${green};border:2px solid ${green};text-align:center;padding:11px 16px;font-family:Arial,sans-serif;font-size:15px;font-weight:700;text-decoration:none;">حفظ PNG</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr><td style="padding:20px 40px;background-color:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;"><p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#9ca3af;">support@youthprints.online &nbsp;·&nbsp; youthprints.online</p></td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}
