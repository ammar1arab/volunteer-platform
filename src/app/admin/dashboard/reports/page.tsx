import { ReportsPage } from "@/presentation/pages";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "التقارير والإحصائيات",
};

export default function Page() {
  return <ReportsPage />;
}
