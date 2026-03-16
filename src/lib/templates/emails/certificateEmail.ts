export function buildCertificateEmail(
  volunteerName: string,
  activityTitle: string,
  pngUrl: string,
  pdfUrl: string
): string {
  const green = "#15803d";
  const lightGreen = "#f0fdf4";

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>شهادة تطوع - مبادرة بصمات شبابية</title>
  <style type="text/css">
    /* Reset styles for better email client support */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
    
    /* Responsive styles for mobile */
    @media screen and (max-width: 600px) {
      .container { width: 100% !important; max-width: 100% !important; }
      .content-padding { padding: 20px !important; }
      /* Stack buttons on mobile */
      .button-container, .button-td { display: block !important; width: 100% !important; text-align: center !important; }
      .button-spacer { height: 15px !important; display: block !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; direction: rtl; font-family: Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="container" style="background-color: #ffffff; max-width: 600px; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
          
          <tr>
            <td style="background-color: ${green}; height: 6px; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <tr>
            <td class="content-padding" style="padding: 40px 40px 20px; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 13px; font-weight: bold; color: #6b7280; letter-spacing: 1px;">مبادرة بصمات شبابية</p>
              <h1 style="margin: 0; font-size: 26px; font-weight: bold; color: ${green};">شهادتك التطوعية جاهزة!</h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 40px;" class="content-padding">
              <table width="100%" border="0" cellpadding="0" cellspacing="0"><tr><td style="border-top: 1px solid #e5e7eb; font-size: 0;">&nbsp;</td></tr></table>
            </td>
          </tr>

          <tr>
            <td class="content-padding" style="padding: 30px 40px; text-align: right;">
              <p style="margin: 0 0 15px; font-size: 16px; color: #111827;">مرحباً <strong>${volunteerName}</strong>،</p>
              <p style="margin: 0 0 15px; font-size: 15px; color: #4b5563; line-height: 1.7;">نقدر عالياً جهودك ووقتك الذي بذلته معنا. شكراً لمشاركتك المميزة والفعالة في إنجاح نشاط:</p>
              <div style="background-color: ${lightGreen}; border-right: 4px solid ${green}; padding: 12px 16px; border-radius: 4px 0 0 4px;">
                <p style="margin: 0; font-size: 17px; font-weight: bold; color: ${green};">${activityTitle}</p>
              </div>
            </td>
          </tr>

          <tr>
            <td class="content-padding" style="padding: 0 40px 30px; text-align: center;">
              <img src="${pngUrl}" alt="شهادة التطوع" width="500" style="width: 100%; max-width: 500px; height: auto; display: block; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 4px;" />
            </td>
          </tr>

          <tr>
            <td style="padding: 0 40px;" class="content-padding">
              <table width="100%" border="0" cellpadding="0" cellspacing="0"><tr><td style="border-top: 1px solid #e5e7eb; font-size: 0;">&nbsp;</td></tr></table>
            </td>
          </tr>

          <tr>
            <td class="content-padding" style="padding: 30px 40px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr class="button-container">
                  <td align="center" width="48%" class="button-td">
                    <a href="${pdfUrl}" target="_blank" style="display: block; background-color: ${green}; color: #ffffff; text-align: center; padding: 14px 16px; font-size: 15px; font-weight: bold; text-decoration: none; border-radius: 6px;">تحميل PDF</a>
                  </td>
                  <td width="4%" class="button-spacer" style="font-size: 0; line-height: 0;">&nbsp;</td>
                  <td align="center" width="48%" class="button-td">
                    <a href="${pngUrl}" target="_blank" style="display: block; background-color: #ffffff; color: ${green}; border: 2px solid ${green}; text-align: center; padding: 12px 16px; font-size: 15px; font-weight: bold; text-decoration: none; border-radius: 6px;">تحميل PNG</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;">تم الإرسال من نظام بصمات شبابية</p>
              <p style="margin: 0; font-size: 13px; color: #9ca3af;"><a href="mailto:support@youthprints.online" style="color: ${green}; text-decoration: none;">support@youthprints.online</a> &nbsp;·&nbsp; <a href="https://youthprints.online" target="_blank" style="color: ${green}; text-decoration: none;">youthprints.online</a></p>
            </td>
          </tr>
          
        </table>
        </td>
    </tr>
  </table>
</body>
</html>`;
}
