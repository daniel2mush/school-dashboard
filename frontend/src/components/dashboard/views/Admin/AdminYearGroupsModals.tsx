"use client";

import {
  useCreateYearGroup,
  useAssignTeacherToYearGroup,
  useUnassignTeacherFromYearGroup,
  useMoveStudentYearGroup,
  type AdminYearGroupStructure,
} from "@/query/AdminQuery";
import type { User } from "@/types/Types";
import { useEffect, useId, useState, type ReactNode } from "react";
import styles from "./AdminYearGroups.module.scss";

export const YEAR_LEVEL_OPTIONS = [
  { value: "Primary", label: "Primary" },
  { value: "JuniorSecondary", label: "Junior secondary" },
  { value: "SeniorSecondary", label: "Senior secondary" },
  { value: "University", label: "University" },
] as const;

function formatLevel(level: string) {
  return level.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function BaseModal({
  title,
  subtitle,
  children,
  onClose,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
}) {
  const titleId = useId();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className={styles.modalOverlay} role="presentation" onClick={onClose}>
      <div
        className={styles.modalDialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.modalHead}>
          <div>
            <h2 id={titleId} className={styles.modalTitle}>
              {title}
            </h2>
            {subtitle ? (
              <p className={styles.modalSubtitle}>{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            className={styles.modalClose}
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </header>
        <div className={styles.modalBody}>{children}</div>
        {footer ? (
          <footer className={styles.modalFooter}>{footer}</footer>
        ) : null}
      </div>
    </div>
  );
}

export function CreateYearGroupModal({ onClose }: { onClose: () => void }) {
  const { mutate, isPending } = useCreateYearGroup();
  const [name, setName] = useState("");
  const [level, setLevel] = useState<string>(YEAR_LEVEL_OPTIONS[0].value);
  const [roomNumber, setRoomNumber] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    mutate(
      {
        name: name.trim(),
        level,
        roomNumber: roomNumber.trim() || undefined,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <BaseModal
      title="New year group"
      subtitle="Create a cohort. You can assign teachers and subjects afterwards."
      onClose={onClose}
      footer={
        <div className={styles.modalFooterActions}>
          <button
            type="button"
            className="btn"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-yg-form"
            className="btn btn-primary"
            disabled={isPending || !name.trim()}
          >
            {isPending ? "Creating…" : "Create cohort"}
          </button>
        </div>
      }
    >
      <form id="create-yg-form" className={styles.modalForm} onSubmit={submit}>
        <label className={styles.field}>
          <span>Cohort name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Year 3 Gold"
            autoFocus
            required
          />
        </label>
        <label className={styles.field}>
          <span>Level</span>
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            {YEAR_LEVEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Room / base (optional)</span>
          <input
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            placeholder="e.g. Block A · Room 12"
          />
        </label>
      </form>
    </BaseModal>
  );
}

export function TeacherRosterModal({
  yearGroup,
  allUsers,
  onClose,
}: {
  yearGroup: AdminYearGroupStructure;
  allUsers: User[];
  onClose: () => void;
}) {
  const { mutate: assign, isPending: assigning } =
    useAssignTeacherToYearGroup();
  const { mutate: unassign, isPending: unassigning } =
    useUnassignTeacherFromYearGroup();
  const busy = assigning || unassigning;

  const teachers = allUsers.filter(
    (u) => u.role === "TEACHER" && u.status === "Active",
  );
  const assignedIds = new Set(yearGroup.teachers.map((t) => t.id));
  const available = teachers.filter((t) => !assignedIds.has(t.id));
  const [pickId, setPickId] = useState<string>("");

  const addTeacher = () => {
    const id = Number(pickId);
    if (!Number.isFinite(id)) return;
    assign(
      { yearGroupId: yearGroup.id, teacherId: id },
      { onSuccess: () => setPickId("") },
    );
  };

  return (
    <BaseModal
      title="Teaching staff"
      subtitle={`${yearGroup.name} · ${formatLevel(yearGroup.level)}`}
      onClose={onClose}
    >
      <div className={styles.rosterSection}>
        <div className={styles.rosterSectionTitle}>Assigned</div>
        {yearGroup.teachers.length === 0 ? (
          <p className={styles.rosterEmpty}>No teachers linked yet.</p>
        ) : (
          <ul className={styles.rosterList}>
            {yearGroup.teachers.map((t) => (
              <li key={t.id} className={styles.rosterRow}>
                <div>
                  <div className={styles.rosterName}>{t.name}</div>
                  <div className={styles.rosterMeta}>
                    {t.specialization || "Teacher"}
                    {t.email ? ` · ${t.email}` : ""}
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.rosterRemove}
                  disabled={busy}
                  onClick={() =>
                    unassign({
                      yearGroupId: yearGroup.id,
                      teacherId: t.id,
                    })
                  }
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.rosterSection}>
        <div className={styles.rosterSectionTitle}>Add teacher</div>
        <div className={styles.addRow}>
          <select
            value={pickId}
            onChange={(e) => setPickId(e.target.value)}
            disabled={busy || available.length === 0}
          >
            <option value="">
              {available.length === 0
                ? "All active teachers are assigned"
                : "Choose a teacher…"}
            </option>
            {available.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
                {t.specialization ? ` (${t.specialization})` : ""}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy || !pickId}
            onClick={addTeacher}
          >
            Assign
          </button>
        </div>
      </div>
    </BaseModal>
  );
}

export function MoveStudentModal({
  sourceYearGroup,
  allYearGroups,
  allUsers,
  onClose,
}: {
  sourceYearGroup: AdminYearGroupStructure;
  allYearGroups: AdminYearGroupStructure[];
  allUsers: User[];
  onClose: () => void;
}) {
  const { mutate, isPending } = useMoveStudentYearGroup();
  const studentsHere = allUsers.filter(
    (u) =>
      u.role === "STUDENT" &&
      u.status === "Active" &&
      u.enrolledYearGroupId === sourceYearGroup.id,
  );
  const destinations = allYearGroups.filter(
    (yg) => yg.id !== sourceYearGroup.id,
  );
  const [studentId, setStudentId] = useState("");
  const [targetYgId, setTargetYgId] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const s = Number(studentId);
    const y = Number(targetYgId);
    if (!Number.isFinite(s) || !Number.isFinite(y)) return;
    mutate({ studentId: s, yearGroupId: y }, { onSuccess: onClose });
  };

  return (
    <BaseModal
      title="Move student"
      subtitle={`From ${sourceYearGroup.name} into another cohort.`}
      onClose={onClose}
      footer={
        <div className={styles.modalFooterActions}>
          <button
            type="button"
            className="btn"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="move-student-form"
            className="btn btn-primary"
            disabled={
              isPending ||
              !studentId ||
              !targetYgId ||
              destinations.length === 0
            }
          >
            {isPending ? "Moving…" : "Move student"}
          </button>
        </div>
      }
    >
      <form
        id="move-student-form"
        className={styles.modalForm}
        onSubmit={submit}
      >
        <label className={styles.field}>
          <span>Student in this cohort</span>
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
          >
            <option value="">
              {studentsHere.length === 0
                ? "No students enrolled here"
                : "Select student…"}
            </option>
            {studentsHere.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {s.email}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Destination cohort</span>
          <select
            value={targetYgId}
            onChange={(e) => setTargetYgId(e.target.value)}
            required
          >
            <option value="">
              {destinations.length === 0
                ? "Create another year group first"
                : "Select cohort…"}
            </option>
            {destinations.map((yg) => (
              <option key={yg.id} value={yg.id}>
                {yg.name} ({formatLevel(yg.level)})
              </option>
            ))}
          </select>
        </label>
      </form>
    </BaseModal>
  );
}
