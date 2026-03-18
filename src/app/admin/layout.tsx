import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/config";
import { redirect } from "next/navigation";
import { UserRole } from "@/core/domain/enums";
import AdminLayoutClient from "./layout.client";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/signin");
  if (session.user.role !== UserRole.ADMIN) redirect("/");

  return (
    <AdminLayoutClient
      isSuperAdmin={session.user.isSuperAdmin ?? false}
      permissions={session.user.permissions ?? []}
    >
      {children}
    </AdminLayoutClient>
  );
}