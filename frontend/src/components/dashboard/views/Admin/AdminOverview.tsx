"use client";

import { Card, CardHeader, ProgressBar, Badge } from "@/components/ui";
import styles from "./AdminOverview.module.scss";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  useGetAdminAnalytics,
  useGetSchoolStructure,
} from "@/query/AdminQuery";
import { useGetAnnouncements } from "@/query/AuthQuery";
import type { Announcement } from "@/types/Types";
import { useRouter } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Banknote,
  BookOpen,
  BookText,
  CalendarDays,
  GraduationCap,
  Layers,
  Megaphone,
  School,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";

const YG_ACCENTS = [
  {
    top: "linear-gradient(180deg, #0f766e, #14b8a6)",
    surface: "rgba(20, 184, 166, 0.12)",
    text: "#0f766e",
  },
  {
    top: "linear-gradient(180deg, #b45309, #f59e0b)",
    surface: "rgba(245, 158, 11, 0.14)",
    text: "#b45309",
  },
  {
    top: "linear-gradient(180deg, #7c3aed, #a78bfa)",
    surface: "rgba(167, 139, 250, 0.16)",
    text: "#6d28d9",
  },
  {
    top: "linear-gradient(180deg, #be123c, #fb7185)",
    surface: "rgba(251, 113, 133, 0.14)",
    text: "#be123c",
  },
  {
    top: "linear-gradient(180deg, #1d4ed8, #60a5fa)",
    surface: "rgba(96, 165, 250, 0.16)",
    text: "#1d4ed8",
  },
  {
    top: "linear-gradient(180deg, #166534, #4ade80)",
    surface: "rgba(74, 222, 128, 0.14)",
    text: "#166534",
  },
];

function formatCFA(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(amount).replace("F CFA", "CFA").replace("FCFA", "CFA");
}

function targetLabel(ann: Announcement) {
  if (ann.targetType === "ALL") return "Everyone";
  if (ann.targetType === "TEACHERS_ONLY") return "Teachers";
  return "Year group";
}

function priorityDotClass(priority: Announcement["priority"]) {
  if (priority === "Urgent") return "var(--red)";
  if (priority === "Important") return "var(--amber)";
  return "var(--green)";
}

function StatTile({
  icon: Icon,
  iconClass,
  label,
  value,
  sub,
  valueColor,
}: {
  icon: LucideIcon;
  iconClass: string;
  label: string;
  value: ReactNode;
  sub?: string;
  valueColor?: string;
}) {
  return (
    <div className={styles.statTile}>
      <div className={`${styles.statIcon} ${iconClass}`}>
        <Icon size={18} strokeWidth={2} />
      </div>
      <div className={styles.statBody}>
        <div className={styles.statLabel}>{label}</div>
        <div
          className={styles.statValue}
          style={valueColor ? { color: valueColor } : undefined}
        >
          {value}
        </div>
        {sub ? <div className={styles.statSub}>{sub}</div> : null}
      </div>
    </div>
  );
}

export default function AdminOverview() {
  const router = useRouter();
  const { data: analytics, isLoading: analyticsLoading } =
    useGetAdminAnalytics();
  const { data: structure, isLoading: structureLoading } =
    useGetSchoolStructure();
  const { data: announcements = [], isLoading: announcementsLoading } =
    useGetAnnouncements();

  const loading = analyticsLoading || structureLoading || announcementsLoading;

  if (loading || !analytics) {
    return (
      <div className={styles.view}>
        <div className={styles.loading}>
          <div className={styles.loadingLineWide} />
          <div className={styles.loadingLineMed} />
          <div className={styles.loadingGrid}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={styles.loadingBlock} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const feeCollectionPct =
    analytics.totalExpectedRevenue > 0
      ? Math.min(
          100,
          Math.round(
            (analytics.totalCollectedRevenue / analytics.totalExpectedRevenue) *
              100,
          ),
        )
      : 0;

  const outstandingCFA = Math.max(
    0,
    analytics.totalExpectedRevenue - analytics.totalCollectedRevenue,
  );

  const studentTeacherRatio =
    analytics.teachers > 0
      ? (analytics.students / analytics.teachers).toFixed(1)
      : "—";

  const avgStudentsPerYear =
    analytics.yearGroups > 0
      ? (analytics.students / analytics.yearGroups).toFixed(1)
      : "0";

  const understaffedYears =
    structure?.filter((yg) => yg._count.teachers === 0) ?? [];

  const overdueStudentCount = analytics.studentsWithOutstandingFees;

  const largestYear =
    structure && structure.length > 0
      ? structure.reduce((a, b) =>
          b._count.students > a._count.students ? b : a,
        )
      : null;

  const totalSubjectLinks =
    structure?.reduce((sum, yg) => sum + yg.subjects.length, 0) ?? 0;

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const latestAnnouncement = announcements[0];

  // Prepare chart data
  const revenueData = [
    { name: 'Collected', value: analytics.totalCollectedRevenue, fill: '#10b981' },
    { name: 'Outstanding', value: outstandingCFA, fill: '#f59e0b' }
  ];

  const enrollmentData = structure?.map(yg => ({
    name: yg.name,
    students: yg._count.students
  })) || [];

  return (
    <section className={styles.view}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}>Sunridge Academy · Admin</div>
            <h1 className={styles.heroTitle}>Platform overview</h1>
            <p className={styles.heroLead}>
              You are supporting <strong>{analytics.students}</strong> active
              students across <strong>{analytics.yearGroups}</strong> year
              groups with <strong>{analytics.teachers}</strong> teachers and{" "}
              <strong>{analytics.subjects}</strong> subjects on record.
              {largestYear ? (
                <>
                  {" "}
                  The largest cohort is <strong>{largestYear.name}</strong> (
                  {largestYear._count.students} students).
                </>
              ) : null}
            </p>
            <div className={styles.heroMeta}>
              <span className={styles.metaChip}>
                <CalendarDays size={12} strokeWidth={2} aria-hidden />
                {today}
              </span>
              <span className={styles.metaChip}>
                <School size={12} strokeWidth={2} aria-hidden />
                Term 2 · 2026
              </span>
              {latestAnnouncement ? (
                <span className={styles.metaChip}>
                  <Megaphone size={12} strokeWidth={2} aria-hidden />
                  Latest broadcast{" "}
                  {new Date(latestAnnouncement.createdAt).toLocaleDateString(
                    "en-GB",
                    { day: "numeric", month: "short" },
                  )}
                </span>
              ) : null}
            </div>
          </div>
          <div className={styles.heroActions}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => router.push("/dashboard/announcements")}
            >
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Megaphone size={15} strokeWidth={2} />
                New announcement
              </span>
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => router.push("/dashboard/yeargroups")}
            >
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Layers size={15} strokeWidth={2} />
                Year groups
              </span>
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => router.push("/dashboard/analytics")}
            >
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Sparkles size={15} strokeWidth={2} />
                Analytics
              </span>
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => router.push("/dashboard/curriculum")}
            >
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <BookText size={15} strokeWidth={2} /> Curriculum
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className={styles.insights}>
        <article className={styles.insight}>
          <div className={styles.insightLabel}>Fee collection</div>
          <div className={styles.insightValue}>
            {feeCollectionPct}% · {formatCFA(analytics.totalCollectedRevenue)}{" "}
            received
          </div>
          <p className={styles.insightSub}>
            {analytics.totalExpectedRevenue > 0
              ? `${formatCFA(outstandingCFA)} still outstanding against expected term fees.`
              : "No fee records yet — add amounts under Fee Management."}
          </p>
          <div className={styles.insightBar}>
            <div
              className={styles.insightBarFill}
              style={{
                width: `${feeCollectionPct}%`,
                background:
                  feeCollectionPct >= 80 ? "var(--green)" : "var(--amber)",
              }}
            />
          </div>
        </article>

        <article className={styles.insight}>
          <div className={styles.insightLabel}>People balance</div>
          <div className={styles.insightValue}>
            {studentTeacherRatio === "—"
              ? "Add teachers to see ratio"
              : `${studentTeacherRatio} students per teacher`}
          </div>
          <p className={styles.insightSub}>
            Average class load ≈ {avgStudentsPerYear} students per year group
            {totalSubjectLinks > 0
              ? ` · ${totalSubjectLinks} subject–year links across the timetable`
              : ""}
            .
          </p>
        </article>

        <article className={styles.insight}>
          <div className={styles.insightLabel}>Attendance signal</div>
          <div className={styles.insightValue}>
            {analytics.attendancePresentPct === null
              ? "No marks recorded"
              : `${analytics.attendancePresentPct}% present`}
          </div>
          <p className={styles.insightSub}>
            {analytics.attendancePresentPct === null
              ? "Once teachers record P / A / T, a school-wide present rate appears here."
              : "Share of present marks among present + absent + late entries in the database."}
          </p>
        </article>
      </div>

      <div className={styles.statsGrid}>
        <StatTile
            icon={Layers}
            iconClass={styles.iconIndigo}
            label="Year groups"
            value={analytics.yearGroups}
            sub="Configured levels"
        />
        <StatTile
            icon={Users}
            iconClass={styles.iconEmerald}
            label="Students"
            value={analytics.students}
            sub="Active accounts"
        />
        <StatTile
            icon={GraduationCap}
            iconClass={styles.iconViolet}
            label="Teaching staff"
            value={analytics.teachers}
            sub="Active teachers"
        />
        <StatTile
            icon={Banknote}
            iconClass={styles.iconAmber}
            label="Fees collected"
            value={`${feeCollectionPct}%`}
            sub={`${formatCFA(analytics.totalCollectedRevenue)} of ${formatCFA(analytics.totalExpectedRevenue)}`}
            valueColor={feeCollectionPct >= 80 ? "var(--green)" : "var(--amber)"}
        />
        <StatTile
            icon={UserCheck}
            iconClass={styles.iconSky}
            label="Attendance"
            value={
              analytics.attendancePresentPct === null
                  ? "—"
                  : `${analytics.attendancePresentPct}%`
            }
            sub={
              analytics.attendancePresentPct === null
                  ? "Awaiting data"
                  : "Present ÷ (P+A+T)"
            }
            valueColor="var(--accent)"
        />
      </div>


      <div className={styles.overviewCharts}>
        <Card>
          <CardHeader title="Revenue Overview" />
          <div style={{ height: 250, padding: '1rem', minWidth: 0 }}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={revenueData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                    formatter={(value: number) => formatCFA(value)}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Enrollment by Year Group" />
          <div style={{ height: 250, padding: '1rem', minWidth: 0 }}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                />
                <Tooltip 
                  cursor={{ fill: 'var(--bg-secondary)', opacity: 0.4 }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="students" fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>



      <div className={styles.mainGrid}>
        <Card style={{ marginBottom: 0 }}>
          <CardHeader
            title="Year groups at a glance"
            action="Manage all"
            onAction={() => router.push("/dashboard/yeargroups")}
          />
          {!structure?.length ? (
            <div className={styles.emptyState}>
              No year groups yet.
              <div className={styles.emptyHint}>
                Create your first cohort to unlock enrolment, fees, and
                timetables.
              </div>
              <button
                type="button"
                className="btn btn-primary"
                style={{ marginTop: 16 }}
                onClick={() => router.push("/dashboard/yeargroups")}
              >
                Set up year groups
              </button>
            </div>
          ) : (
            <div className={styles.ygList}>
              {structure.map((yearGroup, index) => {
                const studentCount = yearGroup._count.students;
                const teacherCount = yearGroup._count.teachers;
                const accent =
                  YG_ACCENTS[(yearGroup.id + index) % YG_ACCENTS.length];
                const capacityValue = yearGroup.capacity;
                const capacityPct =
                  capacityValue && capacityValue > 0
                    ? Math.min(
                        100,
                        Math.round((studentCount / capacityValue) * 100),
                      )
                    : null;
                return (
                  <div
                    key={yearGroup.id}
                    className={styles.ygRow}
                    style={
                      {
                        "--yg-accent-bar": accent.top,
                        "--yg-accent-surface": accent.surface,
                        "--yg-accent-text": accent.text,
                      } as CSSProperties
                    }
                  >
                    <div
                      className={styles.ygAccent}
                      aria-hidden
                    />
                    <div className={styles.ygMain}>
                      <div className={styles.ygTop}>
                        <div className={styles.ygName}>{yearGroup.name}</div>
                        <span className={styles.levelBadge}>
                          {yearGroup.level.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                      </div>
                      <div className={styles.ygStats}>
                        <span className={styles.ygStat}>
                          <Users size={12} strokeWidth={2} />
                          {studentCount} students
                        </span>
                        <span className={styles.ygStat}>
                          <BookOpen size={12} strokeWidth={2} />
                          {yearGroup.subjects.length} subjects
                        </span>
                        <span className={styles.ygStat}>
                          <GraduationCap size={12} strokeWidth={2} />
                          {teacherCount} teacher
                          {teacherCount === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div className={styles.ygProgressLabel}>
                        <span>
                          {capacityValue
                            ? `Capacity vs ${capacityValue} students`
                            : "Capacity not set"}
                        </span>
                        <span>
                          {capacityPct !== null ? `${capacityPct}%` : "—"}
                        </span>
                      </div>
                      {capacityPct !== null ? (
                        <ProgressBar
                          pct={capacityPct}
                          color={accent.text}
                          height={5}
                          style={{ marginTop: 6 }}
                        />
                      ) : (
                        <div
                          style={{
                            marginTop: 6,
                            fontSize: 11,
                            color: "var(--text-tertiary)",
                          }}
                        >
                          Set a class capacity in Year Groups to track seat usage.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <div className={styles.sideStack}>
          <Card style={{ marginBottom: 0 }}>
            <CardHeader
              title="Recent announcements"
              action="Open hub"
              onAction={() => router.push("/dashboard/announcements")}
            />
            {announcements.length === 0 ? (
              <div className={styles.emptyState}>
                Nothing published yet.
                <div className={styles.emptyHint}>
                  Broadcast assembly notes, closures, or policy updates to the
                  whole school or specific audiences.
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ marginTop: 16 }}
                  onClick={() => router.push("/dashboard/announcements")}
                >
                  Write announcement
                </button>
              </div>
            ) : (
              <div className={styles.annList}>
                {announcements.slice(0, 4).map((ann) => (
                  <div key={ann.id} className={styles.annRow}>
                    <div className={styles.annTop}>
                      <span
                        className={styles.priorityDot}
                        style={{
                          background: priorityDotClass(ann.priority),
                        }}
                        title={ann.priority}
                      />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div className={styles.annTitle}>{ann.title}</div>
                        <div className={styles.annMeta}>
                          {ann.author?.name ?? "Unknown"} ·{" "}
                          {new Date(ann.createdAt).toLocaleString("en-GB", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                      {ann.priority !== "Normal" ? (
                        <Badge
                          variant={ann.priority === "Urgent" ? "red" : "amber"}
                        >
                          {ann.priority}
                        </Badge>
                      ) : null}
                    </div>
                    <p className={styles.annExcerpt}>{ann.content}</p>
                    <span className={styles.targetPill}>
                      To: {targetLabel(ann)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card style={{ marginBottom: 0 }}>
            <CardHeader title="Operational watchlist" />
            <div className={styles.watchList}>
              <div className={styles.watchRow}>
                <div className={`${styles.watchIcon} ${styles.watchWarn}`}>
                  <Banknote size={17} strokeWidth={2} />
                </div>
                <div className={styles.watchBody}>
                  <div className={styles.watchTitle}>Fees &amp; balances</div>
                  <p className={styles.watchText}>
                    {overdueStudentCount > 0
                      ? `${overdueStudentCount} active students are in year groups where at least one fee record is not fully paid. Review Fee Management.`
                      : "No year group has under-paid fee rows right now."}
                  </p>
                </div>
              </div>
              <div className={styles.watchRow}>
                <div
                  className={`${styles.watchIcon} ${
                    understaffedYears.length ? styles.watchWarn : styles.watchOk
                  }`}
                >
                  <UserCheck size={17} strokeWidth={2} />
                </div>
                <div className={styles.watchBody}>
                  <div className={styles.watchTitle}>Teacher coverage</div>
                  <p className={styles.watchText}>
                    {understaffedYears.length > 0
                      ? `${understaffedYears.map((y) => y.name).join(", ")} ${understaffedYears.length === 1 ? "has" : "have"} no assigned teachers. Link staff from Staff & Students or year group settings.`
                      : "Every year group has at least one teacher assigned."}
                  </p>
                </div>
              </div>
              <div className={styles.watchRow}>
                <div className={`${styles.watchIcon} ${styles.watchInfo}`}>
                  <BookOpen size={17} strokeWidth={2} />
                </div>
                <div className={styles.watchBody}>
                  <div className={styles.watchTitle}>Learning content</div>
                  <p className={styles.watchText}>
                    Manage your school's subjects and curriculum content from
                    the dedicated Curriculum section. Teachers can manage
                    uploads from their workspace.
                  </p>
                </div>
              </div>
            </div>
            <p className={styles.footerNote}>
              Tip: open Analytics for ratio charts, or Timetable to verify
              coverage by period.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
