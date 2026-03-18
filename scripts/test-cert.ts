import { config } from "dotenv";
config({ path: ".env" });
 
import fs from "fs";
import CertificateGeneratorService from "../src/infrastructure/external/certificate/CertificateGeneratorService";
 
async function main() {
  const generator = new CertificateGeneratorService();
 
  const data = {
    volunteerName: "عمار محمد يوسف العرب",
    activityTitle: "فرصة توزيع لحوم الشونة الجنوبية التطوعية",
    activityDate: "2026 / 2 / 14",
    durationHours: 5,
    issueDate: "2026 / 3 / 15",
    certificateId: "test-cert-id-12345678",
    gender: "MALE" as const,
  };
 
  console.log("Generating PNG...");
  const png = await generator.generatePNG(data);
  fs.writeFileSync("test-output.png", png);
  console.log("✅ test-output.png saved");
 
}
 
main().catch(console.error);