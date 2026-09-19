import { SystemLogsPage } from "@/presentation/pages";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "سجل النظام",
};

export default function Page() {
  return <SystemLogsPage />;
}
