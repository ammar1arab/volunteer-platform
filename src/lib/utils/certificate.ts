export async function downloadCertificateAsPng(apiEndpoint: string, name: string): Promise<void> {
  // 1. Fetch the presigned URL from our API (needs auth credentials)
  const apiRes = await fetch(apiEndpoint, { credentials: "include" });
  if (!apiRes.ok) throw new Error("Failed to get download URL");
  
  const { url } = await apiRes.json();

  // 2. Fetch the actual file from Cloudflare R2 (NO credentials needed)
  const fileRes = await fetch(url); 
  if (!fileRes.ok) throw new Error("Download failed from storage");
  
  const blob = await fileRes.blob();
  const a    = document.createElement("a");
  a.href     = URL.createObjectURL(blob);
  a.download = `${name}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

export async function downloadCertificateAsPdf(apiEndpoint: string, name: string): Promise<void> {
  // 1. Fetch the presigned URL from our API (needs auth credentials)
  const apiRes = await fetch(apiEndpoint, { credentials: "include" });
  if (!apiRes.ok) throw new Error("Failed to get download URL");
  
  const { url } = await apiRes.json();

  // 2. Fetch the actual file from Cloudflare R2 (NO credentials needed)
  const fileRes = await fetch(url);
  if (!fileRes.ok) throw new Error("Download failed from storage");
  
  const blob   = await fileRes.blob();
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