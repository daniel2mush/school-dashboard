"use client";

import styles from "./AdminYearGroups.module.scss"; // Reusing styles for consistency
import { useGetSubjects } from "@/query/AdminQuery";
import { Badge } from "@/components/ui";
import {
  CreateSubjectModal,
  EditSubjectModal,
  DeleteSubjectModal,
} from "./AdminCurriculumModals";
import { BookText, Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminCurriculum() {
  const { data: subjects, isLoading } = useGetSubjects();

  const [createOpen, setCreateOpen] = useState(false);
  const [editSubjectId, setEditSubjectId] = useState<number | null>(null);
  const [deleteSubjectId, setDeleteSubjectId] = useState<number | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

  useEffect(() => {
    if (menuOpenId === null) return;
    const close = () => setMenuOpenId(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [menuOpenId]);

  const editingSubject =
    editSubjectId != null && subjects
      ? subjects.find((s) => s.id === editSubjectId)
      : undefined;
  const deletingSubject =
    deleteSubjectId != null && subjects
      ? subjects.find((s) => s.id === deleteSubjectId)
      : undefined;

  if (isLoading || !subjects) {
    return <div className={styles.view}>Loading curriculum…</div>;
  }

  return (
    <section className={styles.view}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}>Management</div>
            <h1 className={styles.title}>Curriculum</h1>
            <p className={styles.copy}>
              Define and manage the subjects offered at your school. Link them
              to year groups and timetables to build your academic structure.
            </p>
            <div className={styles.heroStats}>
              <span className={styles.heroStat}>
                <BookText size={14} strokeWidth={2} aria-hidden />
                {subjects.length} subject
                {subjects.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>
          <button
            type="button"
            className={`btn btn-primary ${styles.heroCta}`}
            onClick={() => setCreateOpen(true)}
          >
            <Plus size={18} strokeWidth={2} />
            New subject
          </button>
        </div>
      </header>

      {subjects.length === 0 ? (
        <div className={styles.emptyBoard}>
          <div className={styles.emptyIcon}>
            <BookText size={32} strokeWidth={1.5} />
          </div>
          <h2 className={styles.emptyTitle}>No subjects defined yet</h2>
          <p className={styles.emptyText}>
            Start by creating your first subject. You can then link it to year
            groups and timetables.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setCreateOpen(true)}
          >
            Create subject
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {subjects.map((subject) => (
            <article key={subject.id} className={styles.card}>
              <div className={styles.cardTopBar} aria-hidden />
              <div className={styles.cardHeader}>
                <div className={styles.cardTitleBlock}>
                  <div className={styles.cardIcon}>
                    <BookText size={22} strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className={styles.name}>{subject.name}</h2>
                    <div className={styles.levelRow}>
                      <Badge variant="blue">Active</Badge>
                    </div>
                  </div>
                </div>

                <div
                  className={styles.menuWrap}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className={styles.menuTrigger}
                    aria-label="Subject actions"
                    aria-expanded={menuOpenId === subject.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId((v) =>
                        v === subject.id ? null : subject.id,
                      );
                    }}
                  >
                    <MoreHorizontal size={18} strokeWidth={2} />
                  </button>
                  {menuOpenId === subject.id ? (
                    <div
                      className={styles.dropdown}
                      role="menu"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        role="menuitem"
                        className={styles.dropdownItem}
                        onClick={() => {
                          setEditSubjectId(subject.id);
                          setMenuOpenId(null);
                        }}
                      >
                        <Edit size={15} strokeWidth={2} />
                        Edit subject
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className={styles.dropdownItem}
                        onClick={() => {
                          setDeleteSubjectId(subject.id);
                          setMenuOpenId(null);
                        }}
                      >
                        <Trash2 size={15} strokeWidth={2} />
                        Delete subject
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className={styles.descriptionBlock}>
                {subject.description ? (
                  <p>{subject.description}</p>
                ) : (
                  <p className={styles.muted}>No description provided.</p>
                )}
              </div>

              <div className={styles.statsRow}>
                <div className={styles.statBlock}>
                  <BookText
                    className={styles.statIconSvg}
                    size={16}
                    strokeWidth={2}
                  />
                  <div>
                    <div className={styles.statValue}>
                      {subject._count.yearGroups}
                    </div>
                    <div className={styles.statLabel}>Year Groups</div>
                  </div>
                </div>
                <div className={styles.statBlock}>
                  <BookText
                    className={styles.statIconSvg}
                    size={16}
                    strokeWidth={2}
                  />
                  <div>
                    <div className={styles.statValue}>
                      {subject._count.grades}
                    </div>
                    <div className={styles.statLabel}>Grades</div>
                  </div>
                </div>
                <div className={styles.statBlock}>
                  <BookText
                    className={styles.statIconSvg}
                    size={16}
                    strokeWidth={2}
                  />
                  <div>
                    <div className={styles.statValue}>
                      {subject._count.timetable}
                    </div>
                    <div className={styles.statLabel}>Timetable Slots</div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {createOpen ? (
        <CreateSubjectModal onClose={() => setCreateOpen(false)} />
      ) : null}
      {editingSubject ? (
        <EditSubjectModal
          key={editingSubject.id}
          subject={editingSubject}
          onClose={() => setEditSubjectId(null)}
        />
      ) : null}
      {deletingSubject ? (
        <DeleteSubjectModal
          key={deletingSubject.id}
          subject={deletingSubject}
          onClose={() => setDeleteSubjectId(null)}
          onConfirm={() => setDeleteSubjectId(null)} // onClose handles the actual deletion
        />
      ) : null}
    </section>
  );
}
