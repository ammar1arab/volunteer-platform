import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MB = 5;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

const safeExt = (mime: string) => {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return null;
};

export async function POST(req: Request) {
  let form: FormData;

  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: "File is required" }, { status: 400 });
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ success: false, error: "Unsupported file type" }, { status: 400 });
  }

  const ext = safeExt(file.type);
  if (!ext) {
    return NextResponse.json({ success: false, error: "Unsupported file type" }, { status: 400 });
  }

  const sizeMb = file.size / (1024 * 1024);
  if (sizeMb > MAX_MB) {
    return NextResponse.json({ success: false, error: `Max file size is ${MAX_MB}MB` }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  const fileName = `${crypto.randomUUID()}.${ext}`;
  const relDir = "/uploads/featured-posts";
  const relPath = `${relDir}/${fileName}`;
  const absDir = path.join(process.cwd(), "public", "uploads", "featured-posts");
  const absPath = path.join(absDir, fileName);

  await fs.mkdir(absDir, { recursive: true });
  await fs.writeFile(absPath, bytes);

  return NextResponse.json({ success: true, imageUrl: relPath }, { status: 201 });
}
