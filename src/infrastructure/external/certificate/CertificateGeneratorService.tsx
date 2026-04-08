import fs from "fs";
import path from "path";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { buildCertificateHtml, CertificateTemplateProps } from "@/lib/templates";

class CertificateGeneratorService {
  private fontCache = new Map<string, string>();

  private getFontB64(filename: string): string {
    if (!this.fontCache.has(filename)) {
      const fontPath = path.join(process.cwd(), "public", "fonts", filename);
      if (!fs.existsSync(fontPath)) throw new Error(`Font not found: ${fontPath}`);
      this.fontCache.set(filename, fs.readFileSync(fontPath).toString("base64"));
    }
    return this.fontCache.get(filename)!;
  }

  async generatePNG(data: CertificateTemplateProps): Promise<Buffer> {
    const regularB64 = this.getFontB64("Cairo-Regular.ttf");
    const boldB64 = this.getFontB64("Cairo-Bold.ttf");

    const html = buildCertificateHtml(data, regularB64, boldB64);

    const executablePath = process.env.CHROME_EXECUTABLE_PATH ?? await chromium.executablePath("https://pub-983997e34f814b8baf6dc4b05ec7dc55.r2.dev/chromium-v143.0.4-pack.x64.tar");
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1050, height: 750, deviceScaleFactor: 2 },
      executablePath,
      headless: true,
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "load" });
      const screenshot = await page.screenshot({
        type: "png",
        clip: { x: 0, y: 0, width: 1050, height: 750 },
      });
      return Buffer.from(screenshot);
    } finally {
      await browser.close();
    }
  }
}

export default CertificateGeneratorService;