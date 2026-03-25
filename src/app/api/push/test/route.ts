import { getServerSession } from "next-auth";
import { authOptions }      from "@/infrastructure/auth/config";
import { sendPushToUser }   from "@/lib/webpush";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "unauthorized" }, { status: 401 });

  await sendPushToUser(session.user.id, {
    title: "اختبار الإشعارات",
    body:  "إذا وصلك هذا الإشعار فكل شيء يعمل بشكل صحيح",
    url:   "/volunteer/activities",
    tag:   "test",
  });

  return Response.json({ success: true });
}