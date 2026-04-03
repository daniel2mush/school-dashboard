import { notFound, redirect } from "next/navigation";
import { getDashboardHref, isRole } from "../../../constants/navigation";

type DashboardRolePageProps = {
  params: Promise<{
    role: string;
  }>;
};

export default async function DashboardRolePage({ params }: DashboardRolePageProps) {
  const { role } = await params;

  if (!isRole(role)) {
    notFound();
  }

  redirect(getDashboardHref(role));
}
