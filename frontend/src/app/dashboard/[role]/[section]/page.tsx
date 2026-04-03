import { notFound, redirect } from "next/navigation";
import DashboardShell from "../../../../components/dashboard/DashboardShell";
import { getDashboardHref, isRole, isValidSection } from "../../../../constants/navigation";

type DashboardSectionPageProps = {
  params: Promise<{
    role: string;
    section: string;
  }>;
};

export default async function DashboardSectionPage({ params }: DashboardSectionPageProps) {
  const { role, section } = await params;

  if (!isRole(role)) {
    notFound();
  }

  if (!isValidSection(role, section)) {
    redirect(getDashboardHref(role));
  }

  return <DashboardShell role={role} section={section} />;
}
