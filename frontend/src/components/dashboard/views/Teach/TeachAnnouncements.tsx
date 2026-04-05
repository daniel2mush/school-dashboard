import styles from "../Admin/AdminAnnouncements.module.scss"; // Reuse admin styles for consistency
import { useGetAnnouncements } from "@/query/AuthQuery";
import { Badge } from "@/components/ui";

export default function TeachAnnouncements() {
  const { data: announcements, isLoading } = useGetAnnouncements();

  if (isLoading || !announcements) {
    return <div className={styles.view}>Loading teacher briefings...</div>;
  }

  return (
    <section className={styles.view}>
      <div className={styles.panel}>
        <div className={styles.eyebrow}>Faculty Communication</div>
        <h2 className={styles.title}>Teacher Briefings</h2>
        <p style={{ color: "var(--text-secondary)", marginTop: 8 }}>
           Official updates for faculty and staff. Check here for meeting notes and whole-school notices.
        </p>
      </div>

      <div className={styles.announcementList}>
        {announcements.map(ann => (
          <article key={ann.id} className={styles.noticeCard}>
            <div className={styles.noticeHeader}>
               <h3 className={styles.noticeTitle}>{ann.title}</h3>
               <Badge variant={ann.targetType === "TEACHERS_ONLY" ? "purple" : "blue"}>
                 {ann.targetType === "TEACHERS_ONLY" ? "Staff Only" : "Public"}
               </Badge>
            </div>
            <p className={styles.noticeContent}>{ann.content}</p>
            <div className={styles.noticeMeta}>
               From {ann.author?.name} · {new Date(ann.createdAt).toLocaleDateString()}
            </div>
          </article>
        ))}
        {announcements.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-tertiary)" }}>
             No active briefings at this time.
          </div>
        )}
      </div>
    </section>
  );
}
