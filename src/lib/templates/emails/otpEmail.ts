import { buildEmailFooter } from "./emailFooter";
import { OtpType } from "@prisma/client";

export function buildOtpEmail(email: string, code: string, type: OtpType): string {
  const green = "#16a34a";

  const isVerify = type === OtpType.EMAIL_VERIFY;
  const title = isVerify ? "تفعيل بريدك الإلكتروني" : "إعادة تعيين كلمة المرور";
  const subtitle = isVerify ? "أدخل الرمز التالي لتفعيل حسابك" : "أدخل الرمز التالي لإعادة تعيين كلمة مرورك";

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;direction:rtl;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f5;padding:32px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;background:#fff;border-radius:12px;overflow:hidden;">

      <tr>
        <td align="center" style="background:${green};padding:32px 32px 28px;">
          <p style="margin:0 0 6px;font-size:11px;color:rgba(255,255,255,0.75);font-weight:700;letter-spacing:1.5px;">YOUTHPRINTS · بصمات شبابية</p>
          <p style="margin:0;font-size:24px;font-weight:800;color:#ffffff;">${title}</p>
        </td>
      </tr>

      <tr>
        <td style="padding:32px 32px 8px;">
          <p style="margin:0;font-size:14px;color:#555;line-height:1.9;">${subtitle}</p>
        </td>
      </tr>

      <tr>
        <td style="padding:24px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center" style="background:#f0fdf4;padding:28px 16px;border-radius:8px;border:1.5px dashed ${green};">
                <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#999;letter-spacing:1px;">رمز التحقق</p>
                <p style="margin:0;font-size:40px;font-weight:800;color:${green};letter-spacing:12px;">${code}</p>
                <p style="margin:8px 0 0;font-size:12px;color:#999;">صالح لمدة 5 دقائق فقط</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td style="padding:0 32px 24px;">
          <p style="margin:0;font-size:13px;color:#999;line-height:1.8;">
            إذا لم تطلب هذا الرمز، يمكنك تجاهل هذه الرسالة بأمان.
            <br>
            إذا واجهت أي مشكلة يمكنك التواصل معنا عبر:
          </p>
          <p style="margin:8px 0 0;font-size:13px;">
            <a href="mailto:support@youthprints.online" style="color:${green};text-decoration:none;font-weight:700;">support@youthprints.online</a>
          </p>
        </td>
      </tr>

      ${buildEmailFooter({ showPhone: false })}

    </table>
  </td></tr>
</table>
</body>
</html>`;
}
