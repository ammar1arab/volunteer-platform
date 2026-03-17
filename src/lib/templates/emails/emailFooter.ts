const green = "#16a34a";

const icons = {
  instagram: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="#aaa" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="5" stroke="#aaa" stroke-width="2" fill="none"/><circle cx="17.5" cy="6.5" r="1.5" fill="#aaa"/></svg>`,
  facebook: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" stroke="#aaa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`,
  linkedin: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" stroke="#aaa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><rect x="2" y="9" width="4" height="12" stroke="#aaa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="4" cy="4" r="2" stroke="#aaa" stroke-width="2" fill="none"/></svg>`,
};

interface FooterOptions {
  showPhone?: boolean;
}

export function buildEmailFooter({ showPhone = false }: FooterOptions): string {
  return `
  <tr>
    <td style="padding:24px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;">

      <!-- Social Icons -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
        <tr>
          <td align="center">
            <a href="https://www.instagram.com/basmatshababia/" target="_blank" style="display:inline-block;margin:0 6px;text-decoration:none;">${icons.instagram}</a>
            <a href="https://www.facebook.com/p/%D9%85%D8%A8%D8%A7%D8%AF%D8%B1%D8%A9-%D8%A8%D8%B5%D9%85%D8%A7%D8%AA-%D8%B4%D8%A8%D8%A7%D8%A8%D9%8A%D8%A9-100063497834494/" target="_blank" style="display:inline-block;margin:0 6px;text-decoration:none;">${icons.facebook}</a>
            <a href="https://www.linkedin.com/company/youthimprints/" target="_blank" style="display:inline-block;margin:0 6px;text-decoration:none;">${icons.linkedin}</a>
          </td>
        </tr>
      </table>

      <!-- Links -->
      <p style="margin:0 0 8px;text-align:center;font-size:12px;color:#aaa;">
        <a href="mailto:support@youthprints.online" style="color:${green};text-decoration:none;">support@youthprints.online</a>
        &nbsp;·&nbsp;
        <a href="https://youthprints.online" target="_blank" style="color:${green};text-decoration:none;">youthprints.online</a>
        ${showPhone ? `&nbsp;·&nbsp;<span style="color:#aaa;direction:ltr;display:inline-block;">+962 7 9869 6165</span>` : ""}
      </p>

      <!-- Bilingual tagline -->
      <p style="margin:0;text-align:center;font-size:11px;color:#ccc;">
        مبادرة بصمات شبابية · Youthprints Initiative
      </p>

    </td>
  </tr>`;
}