export async function downloadCertificateAsPng(downloadUrl: string, name: string): Promise<void> {
  const res  = await fetch(downloadUrl, { credentials: "include" });
  if (!res.ok) throw new Error("Download failed");
  const blob = await res.blob();
  const a    = document.createElement("a");
  a.href     = URL.createObjectURL(blob);
  a.download = `${name}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

export async function downloadCertificateAsPdf(downloadUrl: string, name: string): Promise<void> {
  const res    = await fetch(downloadUrl, { credentials: "include" });
  if (!res.ok) throw new Error("Download failed");
  const blob   = await res.blob();

  const imgUrl = URL.createObjectURL(blob);
  const img    = new window.Image();
  img.src      = imgUrl;

  await new Promise<void>((resolve, reject) => {
    img.onload  = () => resolve();
    img.onerror = () => reject(new Error("Image load failed"));
  });

  const canvas  = document.createElement("canvas");
  canvas.width  = img.naturalWidth;
  canvas.height = img.naturalHeight;
  canvas.getContext("2d")!.drawImage(img, 0, 0);
  URL.revokeObjectURL(imgUrl);

  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    orientation: img.naturalWidth > img.naturalHeight ? "landscape" : "portrait",
    unit:        "px",
    format:      [img.naturalWidth, img.naturalHeight],
  });
  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, img.naturalWidth, img.naturalHeight);
  pdf.save(`${name}.pdf`);
}