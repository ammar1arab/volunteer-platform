import { redirect } from "next/navigation";
import { ROUTES } from "@/presentation/constants";

export default function Page() {
  redirect(ROUTES.ADMIN.ANALYTICS);
}
