import { CERTIFICATE_LOGO } from "./certificateImageBase64";

export interface CertificateTemplateProps {
  volunteerName: string;
  activityTitle: string;
  activityDate: string;
  durationHours: number;
  issueDate: string;
  certificateId: string;
  gender: "MALE" | "FEMALE" | null;
}

export function buildCertificateHtml(
  props: CertificateTemplateProps,
  regularFontB64: string,
  boldFontB64: string
): string {
  const { volunteerName, activityTitle, activityDate, durationHours, issueDate, certificateId, gender } = props;

  const vol = gender === "FEMALE" ? "المتطوعة" : "المتطوع";
  const part = gender === "FEMALE" ? "لمشاركتها" : "لمشاركته";
  const certId = certificateId.slice(0, 10).toUpperCase();

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <style>
    @font-face {
      font-family: 'Cairo';
      src: url('data:font/truetype;base64,${regularFontB64}') format('truetype');
      font-weight: 400;
    }
    @font-face {
      font-family: 'Cairo';
      src: url('data:font/truetype;base64,${boldFontB64}') format('truetype');
      font-weight: 700;
    }
    @font-face {
      font-family: 'Cairo';
      src: url('data:font/truetype;base64,${boldFontB64}') format('truetype');
      font-weight: 800;
    }
    @font-face {
      font-family: 'Cairo';
      src: url('data:font/truetype;base64,${boldFontB64}') format('truetype');
      font-weight: 900;
    }

    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      width: 1050px;
      height: 750px;
      overflow: hidden;
      background: #ffffff;
      font-family: 'Cairo', sans-serif;
      direction: rtl;
    }

    .cert {
      position: relative;
      width: 1050px;
      height: 750px;
      background: #ffffff;
      overflow: hidden;
    }

    /* ── Borders ── */
    .b-outer { position: absolute; inset: 0;    border: 12px solid #15803d; pointer-events: none; }
    .b-mid   { position: absolute; inset: 12px; border: 3px  solid #c9a84c; pointer-events: none; }
    .b-inner { position: absolute; inset: 25px; border: 1px  solid #c9a84c; pointer-events: none; }

    /* ── Corners ── */
    .corner { position: absolute; width: 60px; height: 60px; }
    .c-tl { top: 15px;    left: 15px;  border-top:    8px solid #c9a84c; border-left:   8px solid #c9a84c; }
    .c-tr { top: 15px;    right: 15px; border-top:    8px solid #c9a84c; border-right:  8px solid #c9a84c; }
    .c-bl { bottom: 15px; left: 15px;  border-bottom: 8px solid #c9a84c; border-left:   8px solid #c9a84c; }
    .c-br { bottom: 15px; right: 15px; border-bottom: 8px solid #c9a84c; border-right:  8px solid #c9a84c; }

    /* ── Content ── */
    .content {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
padding: 50px 80px 60px;
      height: 100%;
    }

    /* ── Logo ── */
    .logo-wrap { display: flex; flex-direction: column; align-items: center; margin-bottom: 8px; }
    .logo-circle {
      width: 90px; height: 90px;
      border-radius: 50%;
      border: 2px solid #c9a84c;
      display: flex; align-items: center; justify-content: center;
      background: #fff;
      overflow: hidden;
    }
    .logo-circle img { width: 72px; height: 72px; object-fit: contain; }
    .org-ar { font-size: 17px; font-weight: 700; color: #15803d; margin-top: 8px; text-align: center; }
    .org-en { font-size: 9px; color: #c9a84c; letter-spacing: 2px; font-weight: 700; direction: ltr; margin-top: 2px; }

    /* ── Title row ── */
    .title-row { display: flex; align-items: center; width: 100%; margin-bottom: 10px; }
    .title-line { flex: 1; height: 2px; }
    .line-r { background: linear-gradient(to right, transparent, #c9a84c); }
    .line-l { background: linear-gradient(to left,  transparent, #c9a84c); }
    .title-text { font-size: 42px; font-weight: 900; color: #15803d; margin: 0 26px; white-space: nowrap; }

    /* ── Body ── */
    .text-c { font-size: 15px; color: #4b5563; text-align: center; }

    .vol-name {
      font-size: 46px; font-weight: 800; color: #15803d;
      text-align: center;
      border-bottom: 2px solid #f0e4c0;
      padding-bottom: 4px;
      margin: 8px 0;
    }

    .activity-box {
      padding: 9px 46px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      margin-top: 8px;
      margin-bottom: 12px;
    }
    .activity-title { font-size: 26px; font-weight: 700; color: #111827; text-align: center; }

    /* ── Stats ── */
    .stats { display: flex; align-items: center; gap: 36px; margin-bottom: 12px; }
    .stat  { display: flex; flex-direction: column; align-items: center; }
    .stat-label { font-size: 10px; color: #a07800; font-weight: 700; }
    .stat-val   { font-size: 14px; font-weight: 700; color: #1a1a1a; }
    .stat-id    { font-size: 12px; font-weight: 700; color: #15803d; direction: ltr; }
    .vdiv { width: 1px; height: 36px; background: #e5e7eb; }

    /* ── Quote ── */
    .quote { font-size: 11px; color: #6b7280; text-align: center; }

    /* ── Footer ── */
    .footer { margin-top: auto; width: 100%; display: flex; justify-content: space-between; align-items: flex-end; }
    .f-l { display: flex; flex-direction: column; align-items: flex-start; }
    .f-c { display: flex; flex-direction: column; align-items: center; }
    .f-r { display: flex; flex-direction: column; align-items: flex-end; }

    .f-label { font-size: 9px;  color: #9ca3af; }
    .f-val   { font-size: 10px; font-weight: 700; color: #374151; }
    .f-email { font-size: 8px;  color: #c9a84c; margin-top: 4px; direction: ltr; }

    .sig-line  { width: 140px; height: 1px; background: rgba(21,128,61,0.3); margin-bottom: 8px; }
    .sig-name  { font-size: 26px; font-weight: 800; color: #15803d; text-align: center; }
    .sig-title { font-size: 11px; color: #6b7280; text-align: center; }

    .verify-phone   { font-size: 9px; color: #6b7280; direction: ltr; }
    .verify-digital { font-size: 9px; color: #ef4444; font-weight: 700; margin-top: 4px; }

    /* ── Deco bar ── */
    .deco-bar { position: absolute; bottom: 20px; left: 100px; right: 100px; height: 5px; display: flex; }
    .d-green { flex: 1; background: #15803d; }
    .d-gold  { flex: 1; background: #c9a84c; }
    .d-red   { flex: 1; background: #ef4444; }
  </style>
</head>
<body>
  <div class="cert">

    <div class="b-outer"></div>
    <div class="b-mid"></div>
    <div class="b-inner"></div>
    <div class="corner c-tl"></div>
    <div class="corner c-tr"></div>
    <div class="corner c-bl"></div>
    <div class="corner c-br"></div>

    <div class="content">

      <div class="logo-wrap">
        <div class="logo-circle">
          <img src="${CERTIFICATE_LOGO}" alt="" />
        </div>
        <div class="org-ar">مبادرة بصمات شبابية</div>
        <div class="org-en">YOUTHPRINTS INITIATIVE</div>
      </div>

      <div class="title-row">
        <div class="title-line line-r"></div>
        <div class="title-text">شهادة تطوعية</div>
        <div class="title-line line-l"></div>
      </div>

      <div class="text-c">تُقدِّم مبادرة بصمات الشبابية بكل فخر واعتزاز هذه الشهادة تقديراً لجهود ${vol}:</div>

      <div class="vol-name">${volunteerName}</div>

      <div class="text-c">${part} المتميزة والفاعلة في فرصة التطوع:</div>

      <div class="activity-box">
        <div class="activity-title">${activityTitle}</div>
      </div>

      <div class="stats">
        <div class="stat">
          <div class="stat-label">تاريخ النشاط</div>
          <div class="stat-val">${activityDate}</div>
        </div>
        <div class="vdiv"></div>
        <div class="stat">
          <div class="stat-label">ساعات التطوع</div>
          <div class="stat-val">${durationHours} ساعة</div>
        </div>
        <div class="vdiv"></div>
        <div class="stat">
          <div class="stat-label">رقم الشهادة</div>
          <div class="stat-id">${certId}</div>
        </div>
      </div>

      <div class="quote">كان لحضورك وجهدك بصمة واضحة صنعت الفرق، وأسهمت في نجاح هذه تجربة بكل تميّز وإخلاص.</div>

      <div class="footer">
        <div class="f-l">
          <div class="f-label">تاريخ الإصدار</div>
          <div class="f-val">${issueDate}</div>
          <div class="f-email">support@youthprints.online</div>
        </div>
        <div class="f-c">
          <div class="sig-line"></div>
          <div class="sig-name">خالد الدويك</div>
          <div class="sig-title">مسؤول المبادرة</div>
        </div>
        <div class="f-r">
          <div class="f-label">للتحقق من الشهادة</div>
          <div class="verify-phone">+962 7 9869 6165</div>
          <div class="verify-digital">صدرت إلكترونياً</div>
        </div>
      </div>

    </div>

    <div class="deco-bar">
      <div class="d-green"></div>
      <div class="d-gold"></div>
      <div class="d-red"></div>
    </div>

  </div>
</body>
</html>`;
}