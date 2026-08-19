import { buildEmailFooter } from "./emailFooter";
import { formatDate } from "@/lib/utils/date";

export interface RecipientVars {
  name:          string;
  city:          string | null;
  hours:         number;
  activityLink?: string;
}

export function applyVariables(text: string, vars: RecipientVars): string {
  const today = formatDate(new Date());
  return text
    .replace(/{اسم_المتطوع}/g,  vars.name)
    .replace(/{المدينة}/g,       vars.city ?? "")
    .replace(/{ساعات_التطوع}/g,  String(Math.round(vars.hours)))
    .replace(/{التاريخ}/g,       today)
    .replace(/{رابط_النشاط}/g,   vars.activityLink ?? "");
}

export function buildBulkEmail(params: {
  subject:   string;
  body:      string;
  fromAlias: string;
}): string {
  const green = "#16a34a";

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${params.subject}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;direction:rtl;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f5;padding:32px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;background:#fff;border-radius:12px;overflow:hidden;">
      <tr>
        <td align="center" style="background:${green};padding:32px 32px 28px;">
          <p style="margin:0 0 8px;font-size:11px;color:rgba(255,255,255,0.7);font-weight:700;letter-spacing:1.5px;">YOUTHPRINTS · بصمات شبابية</p>
          <p style="margin:0;font-size:22px;font-weight:800;color:#ffffff;line-height:1.4;">${params.subject}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:32px 32px 20px;">
          <div style="font-size:15px;color:#333;line-height:2.1;white-space:pre-line;">${params.body.replace(/\n/g, "<br>")}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:0 32px 32px;">
          <a href="https://youthprints.online" style="display:block;background:${green};color:#fff;text-align:center;padding:14px;font-size:15px;font-weight:700;text-decoration:none;border-radius:8px;">
            زيارة منصتنا
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