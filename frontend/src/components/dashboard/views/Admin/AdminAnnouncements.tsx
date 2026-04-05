import { useState } from "react";
import styles from "./AdminAnnouncements.module.scss";
import { useGetAnnouncements } from "@/query/AuthQuery";
import { useCreateAnnouncement } from "@/query/AdminQuery";
import { Badge } from "@/components/ui";

export default function AdminAnnouncements() {
  const { data: announcements, isLoading } = useGetAnnouncements();
  const { mutate: createAnnouncement, isPending } = useCreateAnnouncement();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetType, setTargetType] = useState("ALL");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    createAnnouncement({ title, content, targetType: targetType as any }, {
      onSuccess: () => {
        setTitle("");
        setContent("");
      }
    });
  };

  if (isLoading || !announcements) {
    return <div className={styles.view}>Loading communication portal...</div>;
  }

  return (
    <section className={styles.view}>
      <div className={styles.panel}>
        <div className={styles.eyebrow}>Institutional Communcation</div>
        <h2 className={styles.title}>Official Broadcasts</h2>
        <p style={{ color: "var(--text-secondary)", marginTop: 8 }}>
           Publish news, updates and global instructions to the entire school ecosystem.
        </p>
      </div>

      <form className={styles.formCard} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label>Broadcast Title</label>
          <input 
            placeholder="e.g. End of Term Assembly" 
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Message Content</label>
          <textarea 
            rows={4} 
            placeholder="Details of the announcement..." 
            value={content}
            onChange={e => setContent(e.target.value)}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Target Audience</label>
          <select value={targetType} onChange={e => setTargetType(e.target.value)}>
            <option value="ALL">Everyone</option>
            <option value="TEACHERS_ONLY">Teachers Only</option>
          </select>
        </div>
        <button 
           type="submit" 
           className={styles.submitBtn} 
           disabled={isPending || !title || !content}
        >
          {isPending ? "Broadcasting..." : "Publish Announcement"}
        </button>
      </form>

      <div className={styles.announcementList}>
        {announcements.map(ann => (
          <article key={ann.id} className={styles.noticeCard}>
            <div className={styles.noticeHeader}>
               <h3 className={styles.noticeTitle}>{ann.title}</h3>
               <Badge variant={ann.targetType === "ALL" ? "blue" : "purple"}>
                 {ann.targetType}
               </Badge>
            </div>
            <p className={styles.noticeContent}>{ann.content}</p>
            <div className={styles.noticeMeta}>
               Published by {ann.author?.name} on {new Date(ann.createdAt).toLocaleDateString()}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
