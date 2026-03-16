export function buildCertificateEmail(
  volunteerName: string,
  activityTitle: string,
  pngUrl: string,
  pdfUrl: string
): string {
  const green = "#15803d";

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>شهادتك التطوعية</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,sans-serif;direction:rtl;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#ffffff;border:1px solid #dddddd;">

          <!-- Green top bar -->
          <tr>
            <td style="background-color:${green};height:4px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td align="center" style="padding:32px 32px 24px;">
              <p style="margin:0 0 4px;font-size:12px;color:#999999;font-weight:700;">مبادرة بصمات شبابية</p>
              <p style="margin:0;font-size:22px;font-weight:800;color:#111111;">شهادتك التطوعية جاهزة</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="border-top:1px solid #eeeeee;font-size:0;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 32px;text-align:right;">
              <p style="margin:0 0 12px;font-size:16px;color:#111111;">مرحباً <strong>${volunteerName}</strong>،</p>
              <p style="margin:0 0 20px;font-size:14px;color:#555555;line-height:1.8;">شكراً لمشاركتك في نشاط:</p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#f0fdf4;border-right:4px solid ${green};padding:12px 16px;">
                    <p style="margin:0;font-size:16px;font-weight:700;color:${green};">${activityTitle}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Certificate image -->
          <tr>
            <td style="padding:0 32px 28px;">
              <img src="${pngUrl}" alt="الشهادة" width="496" style="width:100%;height:auto;display:block;border:1px solid #dddddd;" />
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="border-top:1px solid #eeeeee;font-size:0;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>

          <!-- Buttons -->
          <tr>
            <td style="padding:24px 32px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom:12px;">
                    <a href="${pdfUrl}" target="_blank" style="display:block;background-color:${green};color:#ffffff;text-align:center;padding:14px;font-size:15px;font-weight:700;text-decoration:none;">
                      تحميل PDF
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>
                    <a href="${pngUrl}" target="_blank" style="display:block;background-color:#ffffff;color:${green};border:2px solid ${green};text-align:center;padding:12px;font-size:15px;font-weight:700;text-decoration:none;">
                      حفظ PNG
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:20px 32px;background-color:#f9f9f9;border-top:1px solid #eeeeee;">
              <p style="margin:0;font-size:12px;color:#aaaaaa;">
                <a href="mailto:support@youthprints.online" style="color:${green};text-decoration:none;">support@youthprints.online</a>
                &nbsp;·&nbsp;
                <a href="https://youthprints.online" target="_blank" style="color:${green};text-decoration:none;">youthprints.online</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}