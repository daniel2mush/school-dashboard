"use client";

import {
  useCreateSubject,
  useUpdateSubject,
  useDeleteSubject,
  type CreateSubjectPayload,
  type UpdateSubjectPayload,
  type Subject,
} from "@/query/AdminQuery";
import {
  useId,
  useState,
  type FormEvent,
  type ReactNode,
  useEffect,
} from "react";
import styles from "./AdminYearGroups.module.scss"; // Reusing styles from AdminYearGroups

// Reusing BaseModal from AdminYearGroupsModals for consistency
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

export function CreateSubjectModal({ onClose }: { onClose: () => void }) {
  const { mutate, isPending } = useCreateSubject();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const payload: CreateSubjectPayload = {
      name: name.trim(),
      description: description.trim() || undefined,
    };
    mutate(payload, { onSuccess: onClose });
  };

  return (
    <BaseModal
      title="New subject"
      subtitle="Define a new subject for your school's curriculum."
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
            form="create-subject-form"
            className="btn btn-primary"
            disabled={isPending || !name.trim()}
          >
            {isPending ? "Creating…" : "Create subject"}
          </button>
        </div>
      }
    >
      <form
        id="create-subject-form"
        className={styles.modalForm}
        onSubmit={submit}
      >
        <label className={styles.field}>
          <span>Subject name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mathematics"
            autoFocus
            required
          />
        </label>
        <label className={styles.field}>
          <span>Description (optional)</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Core mathematics for junior secondary students."
            rows={3}
          />
        </label>
      </form>
    </BaseModal>
  );
}

export function EditSubjectModal({
  subject,
  onClose,
}: {
  subject: Subject;
  onClose: () => void;
}) {
  const { mutate, isPending } = useUpdateSubject();
  const [name, setName] = useState(subject.name);
  const [description, setDescription] = useState(subject.description || "");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const payload: UpdateSubjectPayload = {
      id: subject.id,
      name: name.trim(),
      description: description.trim() || undefined,
    };
    mutate(payload, { onSuccess: onClose });
  };

  return (
    <BaseModal
      title={`Edit ${subject.name}`}
      subtitle="Update the details for this subject."
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
            form="edit-subject-form"
            className="btn btn-primary"
            disabled={isPending || !name.trim()}
          >
            {isPending ? "Saving…" : "Save changes"}
          </button>
        </div>
      }
    >
      <form
        id="edit-subject-form"
        className={styles.modalForm}
        onSubmit={submit}
      >
        <label className={styles.field}>
          <span>Subject name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mathematics"
            autoFocus
            required
          />
        </label>
        <label className={styles.field}>
          <span>Description (optional)</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Core mathematics for junior secondary students."
            rows={3}
          />
        </label>
      </form>
    </BaseModal>
  );
}

export function DeleteSubjectModal({
  subject,
  onClose,
  onConfirm,
}: {
  subject: Subject;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { mutate, isPending } = useDeleteSubject();

  const handleDelete = () => {
    mutate(subject.id, { onSuccess: onClose });
  };

  return (
    <BaseModal
      title="Remove subject?"
      subtitle={`Are you sure you want to remove "${subject.name}"?`}
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
            type="button"
            className={`btn ${styles.dangerBtn}`}
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "Removing…" : "Remove subject"}
          </button>
        </div>
      }
    >
      <p className={styles.modalLead}>
        This action cannot be undone. All associated records (grades,
        timetables) might be affected.
      </p>
    </BaseModal>
  );
}
