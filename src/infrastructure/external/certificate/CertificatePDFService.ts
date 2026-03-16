import { PDFDocument } from "pdf-lib";

class CertificatePDFService {
  async generatePDF(pngBuffer: Buffer): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([1123, 794]);
    const pngImage = await pdfDoc.embedPng(pngBuffer);
    page.drawImage(pngImage, { x: 0, y: 0, width: 1123, height: 794 });
    return Buffer.from(await pdfDoc.save());
  }
}

export default CertificatePDFService;