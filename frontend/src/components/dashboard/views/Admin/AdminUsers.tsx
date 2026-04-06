"use client";

import styles from "./AdminUsers.module.scss";
import {
  useGetAllUsers,
  useUpdateUserStatus,
  useDeleteAdminUser,
  useResetUserPassword,
  useUpdateAdminUser,
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
  RefreshCw,
  Save,
  Search,
  Shield,
  User,
  UserMinus,
  UserPlus,
  Users,
  X,
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
  const [selectedUser, setSelectedUser] = useState<AdminDirectoryUser | null>(
    null,
  );
  const [teacherSearch, setTeacherSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  useEffect(() => {
    if (menuUserId === null) return;
    const close = () => setMenuUserId(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [menuUserId]);

  const { teachers, students, admins } = useMemo(() => {
    if (!users) return { teachers: [], students: [], admins: [] };

    const tLower = teacherSearch.toLowerCase();
    const sLower = studentSearch.toLowerCase();

    return {
      teachers: users.filter(
        (u) =>
          u.role === "TEACHER" &&
          (u.name.toLowerCase().includes(tLower) ||
            u.email.toLowerCase().includes(tLower)),
      ),
      students: users.filter(
        (u) =>
          u.role === "STUDENT" &&
          (u.name.toLowerCase().includes(sLower) ||
            u.email.toLowerCase().includes(sLower)),
      ),
      admins: users.filter((u) => u.role === "ADMIN"),
    };
  }, [users, teacherSearch, studentSearch]);

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
      <div
        key={u.id}
        className={styles.tableRow}
        onClick={() => setSelectedUser(u)}
      >
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
        <article className={`${styles.card} ${styles.teacherCard}`}>
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
            <div className={styles.cardActions}>
              <div className={styles.searchBox}>
                <Search size={14} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={teacherSearch}
                  onChange={(e) => setTeacherSearch(e.target.value)}
                />
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

        <article className={`${styles.card} ${styles.studentCard}`}>
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
            <div className={styles.cardActions}>
              <div className={styles.searchBox}>
                <Search size={14} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
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

      {selectedUser ? (
        <UserProfileDrawer
          user={selectedUser}
          isSelf={selectedUser.id === me?.id}
          adminsCount={admins.length}
          onClose={() => setSelectedUser(null)}
          onResetPassword={(u) => {
            openResetPassword(u);
          }}
          onDelete={(u) => {
            setSelectedUser(null);
            setDeleteTarget(u);
          }}
          onToggleAccess={(u) => {
            toggleAccess(u);
            setSelectedUser({
              ...u,
              status: u.status === "Active" ? "Suspended" : "Active",
            });
          }}
        />
      ) : null}
    </section>
  );
}

function UserProfileDrawer({
  user,
  isSelf,
  adminsCount,
  onClose,
  onResetPassword,
  onDelete,
  onToggleAccess,
}: {
  user: AdminDirectoryUser;
  isSelf: boolean;
  adminsCount: number;
  onClose: () => void;
  onResetPassword: (u: AdminDirectoryUser) => void;
  onDelete: (u: AdminDirectoryUser) => void;
  onToggleAccess: (u: AdminDirectoryUser) => void;
}) {
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateAdminUser();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [gender, setGender] = useState(user.gender || "");
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || "");
  const [address, setAddress] = useState(user.address || "");
  const [dateOfBirth, setDateOfBirth] = useState(
    user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : "",
  );
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    setGender(user.gender || "");
    setPhoneNumber(user.phoneNumber || "");
    setAddress(user.address || "");
    setDateOfBirth(
      user.dateOfBirth
        ? new Date(user.dateOfBirth).toISOString().split("T")[0]
        : "",
    );
    setHasChanges(false);
  }, [user]);

  const handleSave = () => {
    const payload =
      user.role === "TEACHER"
        ? {
            userId: user.id,
            role: "TEACHER" as const,
            name,
            email,
            gender: (gender || null) as any,
            phoneNumber: phoneNumber || null,
            address: address || null,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : null,
            specialization: user.specialization,
          }
        : {
            userId: user.id,
            role: "STUDENT" as const,
            name,
            email,
            gender: (gender || null) as any,
            phoneNumber: phoneNumber || null,
            address: address || null,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : null,
            enrolledYearGroupId: user.enrolledYearGroupId,
          };

    updateProfile(payload, {
      onSuccess: () => {
        setHasChanges(false);
      },
    });
  };

  return (
    <div className={styles.drawerOverlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <header className={styles.drawerHead}>
          <h2 className={styles.drawerTitle}>User Profile</h2>
          <button className={styles.drawerClose} onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        <div className={styles.drawerBody}>
          <div className={styles.drawerProfile}>
            <div className={styles.drawerAvatar}>
              {initialsFromName(user.name)}
            </div>
            <div className={styles.drawerName}>{user.name}</div>
            <div className={styles.drawerRole}>
              {user.role} {isSelf && " (You)"}
            </div>
          </div>

          <div className={styles.drawerSection}>
            <div className={styles.drawerSectionTitle}>
              <User size={14} />
              Basic Information
            </div>
            <div className={styles.drawerForm}>
              <div className={styles.field}>
                <span>Full Name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setHasChanges(true);
                  }}
                />
              </div>
              <div className={styles.field}>
                <span>Email Address</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setHasChanges(true);
                  }}
                />
              </div>
              <div className={styles.field}>
                <span>Phone Number</span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    setHasChanges(true);
                  }}
                />
              </div>
              <div className={styles.field}>
                <span>Gender</span>
                <select
                  value={gender}
                  onChange={(e) => {
                    setGender(e.target.value);
                    setHasChanges(true);
                  }}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className={styles.field}>
                <span>Date of Birth</span>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => {
                    setDateOfBirth(e.target.value);
                    setHasChanges(true);
                  }}
                />
              </div>
              <div className={styles.field}>
                <span>Address</span>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setHasChanges(true);
                  }}
                />
              </div>
            </div>
          </div>

          <div className={styles.drawerSection}>
            <div className={styles.drawerSectionTitle}>
              <Shield size={14} />
              Account Actions
            </div>
            <div className={styles.drawerActions}>
              <button
                className={styles.drawerActionBtn}
                onClick={() => onResetPassword(user)}
              >
                <RefreshCw size={16} />
                Regenerate Password
              </button>
              <button
                className={styles.drawerActionBtn}
                disabled={isSelf}
                onClick={() => onToggleAccess(user)}
              >
                <UserMinus size={16} />
                {user.status === "Active" ? "Restrict Access" : "Restore Access"}
              </button>
              <button
                className={`${styles.drawerActionBtn} ${styles.danger}`}
                disabled={isSelf || (user.role === "ADMIN" && adminsCount <= 1)}
                onClick={() => onDelete(user)}
              >
                <UserMinus size={16} />
                Delete Account
              </button>
            </div>
          </div>
        </div>

        <footer className={styles.drawerFooter}>
          <button
            className="btn btn-primary w-full"
            disabled={!hasChanges || isUpdating}
            onClick={handleSave}
          >
            <Save size={18} />
            {isUpdating ? "Saving..." : "Save Changes"}
          </button>
        </footer>
      </div>
    </div>
  );
}
