"use client";

import styles from "./AdminUsers.module.scss";
import {
  useGetAllUsers,
  useUpdateUserStatus,
  useDeleteAdminUser,
  useResetUserPassword,
  type AdminDirectoryUser,
  type CredentialsPayload,
} from "@/query/AdminQuery";
import { Badge } from "@/components/ui";
import useUserStore from "@/store/UserStore";
import {
  AddStudentModal,
  AddTeacherModal,
  CredentialsModal,
  DeleteUserModal,
} from "./AdminUsersModals";
import {
  GraduationCap,
  Mail,
  MoreHorizontal,
  Plus,
  Shield,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function formatDate(dateStr: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function initialsFromName(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length >= 2) return (p[0][0] + p[p.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || "?";
}

function statusBadgeVariant(
  status: string,
): "green" | "gray" | "red" | "amber" {
  if (status === "Active") return "green";
  if (status === "Suspended") return "red";
  return "gray";
}

export default function AdminUsers() {
  const { user: me } = useUserStore();
  const { data: users, isLoading } = useGetAllUsers();
  const { mutate: updateStatus } = useUpdateUserStatus();
  const { mutate: removeUser } = useDeleteAdminUser();
  const { mutate: resetPassword } = useResetUserPassword();

  const [addTeacherOpen, setAddTeacherOpen] = useState(false);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [credentials, setCredentials] = useState<
    (CredentialsPayload & { title: string; subtitle?: string }) | null
  >(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminDirectoryUser | null>(
    null,
  );
  const [menuUserId, setMenuUserId] = useState<number | null>(null);

  useEffect(() => {
    if (menuUserId === null) return;
    const close = () => setMenuUserId(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [menuUserId]);

  const { teachers, students, admins } = useMemo(() => {
    if (!users) return { teachers: [], students: [], admins: [] };
    return {
      teachers: users.filter((u) => u.role === "TEACHER"),
      students: users.filter((u) => u.role === "STUDENT"),
      admins: users.filter((u) => u.role === "ADMIN"),
    };
  }, [users]);

  const openResetPassword = (u: AdminDirectoryUser) => {
    if (
      !window.confirm(
        `Generate a new temporary password for ${u.name}? They will be signed out everywhere.`,
      )
    ) {
      return;
    }
    resetPassword(u.id, {
      onSuccess: (data) => {
        toast.success("New temporary password generated");
        setCredentials({
          ...data,
          title: "New login password",
          subtitle: `${u.name} · share this password once.`,
        });
      },
    });
  };

  const toggleAccess = (u: AdminDirectoryUser) => {
    if (u.id === me?.id) {
      toast.error("You cannot change your own access from here.");
      return;
    }
    const next = u.status === "Active" ? "Suspended" : "Active";
    updateStatus({ userId: u.id, status: next });
  };

  if (isLoading || !users) {
    return <div className={styles.view}>Loading directory…</div>;
  }

  const renderRow = (u: AdminDirectoryUser, kind: "teacher" | "student") => {
    const isSelf = u.id === me?.id;
    return (
      <div key={u.id} className={styles.tableRow}>
        <div className={styles.userCell}>
          <div className={styles.avatar}>{initialsFromName(u.name)}</div>
          <div>
            <div className={styles.userName}>
              {u.name}
              {isSelf ? (
                <span className={styles.youBadge}>You</span>
              ) : null}
            </div>
            <div className={styles.userEmail}>{u.email}</div>
          </div>
        </div>
        <div className={styles.metaCell}>
          <Badge variant={statusBadgeVariant(u.status)}>{u.status}</Badge>
        </div>
        <div className={styles.metaCell}>
          {kind === "student" ? (
            <span className={styles.placement}>
              {u.enrolledYearGroup?.name ?? "—"}
            </span>
          ) : (
            <span className={styles.placement}>
              {u.specialization || "—"}
            </span>
          )}
        </div>
        <div className={styles.dateCell}>{formatDate(u.createdAt)}</div>
        <div className={styles.actionsCell}>
          <div
            className={styles.menuHost}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.iconBtn}
              aria-label="User actions"
              aria-expanded={menuUserId === u.id}
              onClick={(e) => {
                e.stopPropagation();
                setMenuUserId((v) => (v === u.id ? null : u.id));
              }}
            >
              <MoreHorizontal size={18} strokeWidth={2} />
            </button>
            {menuUserId === u.id ? (
              <div className={styles.dropdown} role="menu">
                <button
                  type="button"
                  className={styles.dropdownItem}
                  onClick={() => {
                    void navigator.clipboard.writeText(u.email);
                    toast.success("Email copied");
                    setMenuUserId(null);
                  }}
                >
                  <Mail size={15} strokeWidth={2} />
                  Copy email
                </button>
                <button
                  type="button"
                  className={styles.dropdownItem}
                  onClick={() => {
                    setMenuUserId(null);
                    openResetPassword(u);
                  }}
                >
                  <UserPlus size={15} strokeWidth={2} />
                  New temporary password
                </button>
                <button
                  type="button"
                  className={styles.dropdownItem}
                  disabled={isSelf}
                  onClick={() => {
                    setMenuUserId(null);
                    toggleAccess(u);
                  }}
                >
                  <UserMinus size={15} strokeWidth={2} />
                  {u.status === "Active" ? "Restrict login" : "Restore login"}
                </button>
                <button
                  type="button"
                  className={`${styles.dropdownItem} ${styles.dropdownDanger}`}
                  disabled={
                    isSelf ||
                    (u.role === "ADMIN" && admins.length <= 1)
                  }
                  onClick={() => {
                    setMenuUserId(null);
                    setDeleteTarget(u);
                  }}
                >
                  Delete user
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className={styles.view}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <div className={styles.eyebrow}>People</div>
            <h1 className={styles.title}>Staff &amp; students</h1>
            <p className={styles.copy}>
              Provision accounts with school email and an initial password.
              Restrict login anytime; passwords can be regenerated — they are
              never shown again after this screen unless you reset them.
            </p>
          </div>
        </div>
      </header>

      {admins.length > 0 ? (
        <div className={styles.adminStrip}>
          <div className={styles.adminStripHead}>
            <Shield size={16} strokeWidth={2} />
            <span>Administrators</span>
          </div>
          <div className={styles.adminChips}>
            {admins.map((a) => (
              <span key={a.id} className={styles.adminChip}>
                {a.name}
                {a.id === me?.id ? " (you)" : ""}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className={styles.twoCards}>
        <article className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.cardTitleRow}>
              <div className={styles.cardIcon}>
                <GraduationCap size={20} strokeWidth={2} />
              </div>
              <div>
                <h2 className={styles.cardTitle}>Teaching staff</h2>
                <p className={styles.cardSub}>
                  {teachers.length} teacher{teachers.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <button
              type="button"
              className={`btn btn-primary ${styles.cardCta}`}
              onClick={() => setAddTeacherOpen(true)}
            >
              <Plus size={17} strokeWidth={2} />
              Add teacher
            </button>
          </div>
          <div className={styles.table}>
            <div className={styles.tableHead}>
              <div>Person</div>
              <div>Access</div>
              <div>Focus</div>
              <div>Joined</div>
              <div />
            </div>
            {teachers.length === 0 ? (
              <div className={styles.empty}>No teachers yet.</div>
            ) : (
              teachers.map((u) => renderRow(u, "teacher"))
            )}
          </div>
        </article>

        <article className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.cardTitleRow}>
              <div className={styles.cardIconAlt}>
                <Users size={20} strokeWidth={2} />
              </div>
              <div>
                <h2 className={styles.cardTitle}>Students</h2>
                <p className={styles.cardSub}>
                  {students.length} enrolled learner
                  {students.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <button
              type="button"
              className={`btn btn-primary ${styles.cardCta}`}
              onClick={() => setAddStudentOpen(true)}
            >
              <Plus size={17} strokeWidth={2} />
              Add student
            </button>
          </div>
          <div className={styles.table}>
            <div className={styles.tableHead}>
              <div>Person</div>
              <div>Access</div>
              <div>Cohort</div>
              <div>Joined</div>
              <div />
            </div>
            {students.length === 0 ? (
              <div className={styles.empty}>No students yet.</div>
            ) : (
              students.map((u) => renderRow(u, "student"))
            )}
          </div>
        </article>
      </div>

      {addTeacherOpen ? (
        <AddTeacherModal
          onClose={() => setAddTeacherOpen(false)}
          onCredentials={(c) =>
            setCredentials({
              ...c,
              title: "Teacher login details",
              subtitle: "Share securely. They can change this password after sign-in.",
            })
          }
        />
      ) : null}
      {addStudentOpen ? (
        <AddStudentModal
          onClose={() => setAddStudentOpen(false)}
          onCredentials={(c) =>
            setCredentials({
              ...c,
              title: "Student login details",
              subtitle: "Share with the student or guardian.",
            })
          }
        />
      ) : null}
      {credentials ? (
        <CredentialsModal
          credentials={credentials}
          title={credentials.title}
          subtitle={credentials.subtitle}
          onClose={() => setCredentials(null)}
        />
      ) : null}
      {deleteTarget ? (
        <DeleteUserModal
          user={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() =>
            removeUser(deleteTarget.id, {
              onSuccess: () => setDeleteTarget(null),
            })
          }
        />
      ) : null}
    </section>
  );
}
