import { useRouter } from "next/navigation";
import { ROUTES } from "@/presentation/constants";
import { certificateApi } from "@/presentation/services";
import { downloadCertificateAsPng, downloadCertificateAsPdf } from "@/lib/utils";
import type { CertificateDto } from "@/core/application/dtos";

export function useCertificateCard(certificate: CertificateDto) {
  const router = useRouter();
  const verifyUrl = ROUTES.VERIFY(certificate.id);
  const name = certificate.activityTitle;

  const shareText = `شهادة مشاركتي في نشاط "${name}" — بصمات شبابية\n${
    typeof window !== "undefined" ? window.location.origin : ""
  }${verifyUrl}`;

  const goToVerify = () => router.push(verifyUrl);

  const handleDownloadPng = async () => {
    if (!certificate.pngUrl) return;
    const url = certificateApi.getDownloadUrl(certificate.pngUrl);
    if (!url) return;
    await downloadCertificateAsPng(url, name);
  };

  const handleDownloadPdf = async () => {
    if (!certificate.pngUrl) return;
    const url = certificateApi.getDownloadUrl(certificate.pngUrl);
    if (!url) return;
    await downloadCertificateAsPdf(url, name);
  };

  return { verifyUrl, name, shareText, goToVerify, handleDownloadPng, handleDownloadPdf };
}
