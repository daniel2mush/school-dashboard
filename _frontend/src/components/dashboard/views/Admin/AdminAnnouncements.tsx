import { useState, useMemo } from "react";
import styles from "./AdminAnnouncements.module.scss";
import { useGetAnnouncements } from "@/query/AuthQuery";
import { useCreateAnnouncement, useGetSchoolStructure } from "@/query/AdminQuery";
import { Badge } from "@/components/ui";
import { 
  Megaphone, 
  Users, 
  UserRound, 
  AlertCircle, 
  Info, 
  Bell, 
  Plus, 
  Filter,
  ArrowRight,
  Clock,
  Send
} from "lucide-react";

type TabType = "ALL" | "TEACHERS" | "STUDENTS";

export default function AdminAnnouncements() {
  const { data: announcements, isLoading } = useGetAnnouncements();
  const { data: structure } = useGetSchoolStructure();
  const { mutate: createAnnouncement, isPending } = useCreateAnnouncement();

  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetType, setTargetType] = useState("ALL");
  const [priority, setPriority] = useState("Normal");
  const [targetYearGroupId, setTargetYearGroupId] = useState("");

  const filteredAnnouncements = useMemo(() => {
    if (!announcements) return [];
    if (activeTab === "ALL") return announcements;
    if (activeTab === "TEACHERS") return announcements.filter(a => a.targetType === "TEACHERS_ONLY");
    if (activeTab === "STUDENTS") return announcements.filter(a => a.targetType === "ALL" || a.targetType === "YEAR_GROUP");
    return announcements;
  }, [announcements, activeTab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    createAnnouncement({ 
      title, 
      content, 
      targetType: targetType as any,
      priority: priority as any,
      targetYearGroupId: targetYearGroupId ? Number(targetYearGroupId) : null
    }, {
      onSuccess: () => {
        setTitle("");
        setContent("");
        setTargetType("ALL");
        setPriority("Normal");
        setTargetYearGroupId("");
        setShowCreateForm(false);
      }
    });
  };

  const getPriorityIcon = (p: string) => {
    switch (p) {
      case "Urgent": return <AlertCircle size={16} className={styles.urgentIcon} />;
      case "Important": return <Bell size={16} className={styles.importantIcon} />;
      default: return <Info size={16} className={styles.normalIcon} />;
    }
  };

  if (isLoading || !announcements) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner}></div>
        <p>Syncing broadcast systems...</p>
      </div>
    );
  }

  return (
    <section className={styles.view}>
      <header className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.eyebrow}>
            <Megaphone size={14} />
            Institutional Communication
          </div>
          <h1 className={styles.title}>School Announcements</h1>
          <p className={styles.subtitle}>
             Manage global broadcasts, teacher-specific directives, and year-group updates from a centralized hub.
          </p>
        </div>
        <button 
          className={styles.createTrigger} 
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? "Discard Message" : (
            <>
              <Plus size={18} />
              Create Announcement
            </>
          )}
        </button>
      </header>

      {showCreateForm && (
        <div className={styles.formOverlay}>
          <form className={styles.formCard} onSubmit={handleSubmit}>
            <div className={styles.formHeader}>
              <h3>Broadcast New Message</h3>
              <p>Your message will be instantly visible to the selected audience.</p>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label>Announcement Title</label>
                <div className={styles.inputWrapper}>
                  <input 
                    placeholder="e.g. Annual Sports Day 2024" 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label>Priority Level</label>
                  <select value={priority} onChange={e => setPriority(e.target.value)}>
                    <option value="Normal">Normal</option>
                    <option value="Important">Important</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label>Target Audience</label>
                  <select value={targetType} onChange={e => {
                    setTargetType(e.target.value);
                    if (e.target.value !== "YEAR_GROUP") setTargetYearGroupId("");
                  }}>
                    <option value="ALL">Everyone (Public)</option>
                    <option value="TEACHERS_ONLY">Teachers Only</option>
                    <option value="YEAR_GROUP">Specific Year Group</option>
                  </select>
                </div>

                {targetType === "YEAR_GROUP" && (
                  <div className={styles.inputGroup}>
                    <label>Select Year Group</label>
                    <select 
                      value={targetYearGroupId} 
                      onChange={e => setTargetYearGroupId(e.target.value)}
                      required
                    >
                      <option value="">Choose cohort...</option>
                      {structure?.map(yg => (
                        <option key={yg.id} value={yg.id}>{yg.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label>Message Content</label>
                <textarea 
                  rows={4} 
                  placeholder="Draft your detailed announcement here..." 
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.formFooter}>
              <button 
                type="button" 
                className={styles.cancelBtn}
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className={styles.submitBtn} 
                disabled={isPending || !title || !content}
              >
                {isPending ? "Broadcasting..." : (
                  <>
                    <Send size={16} />
                    Send Broadcast
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <nav className={styles.tabsNav}>
        <div className={styles.tabsList}>
          <button 
            className={`${styles.tabTrigger} ${activeTab === "ALL" ? styles.active : ""}`}
            onClick={() => setActiveTab("ALL")}
          >
            <Users size={16} />
            All Broadcasts
          </button>
          <button 
            className={`${styles.tabTrigger} ${activeTab === "TEACHERS" ? styles.active : ""}`}
            onClick={() => setActiveTab("TEACHERS")}
          >
            <UserRound size={16} />
            Teachers Only
          </button>
          <button 
            className={`${styles.tabTrigger} ${activeTab === "STUDENTS" ? styles.active : ""}`}
            onClick={() => setActiveTab("STUDENTS")}
          >
            <Filter size={16} />
            Student Updates
          </button>
        </div>
        <div className={styles.statsCount}>
          {filteredAnnouncements.length} messages found
        </div>
      </nav>

      <div className={styles.announcementGrid}>
        {filteredAnnouncements.length === 0 ? (
          <div className={styles.emptyState}>
            <Bell size={48} />
            <h3>No announcements in this category</h3>
            <p>Important updates and news for this group will appear here once published.</p>
          </div>
        ) : (
          filteredAnnouncements.map(ann => (
            <article key={ann.id} className={`${styles.noticeCard} ${styles[ann.priority.toLowerCase()]}`}>
              <div className={styles.noticeHeader}>
                <div className={styles.noticeTitleGroup}>
                  <div className={styles.priorityBadge}>
                    {getPriorityIcon(ann.priority)}
                    {ann.priority}
                  </div>
                  <h3 className={styles.noticeTitle}>{ann.title}</h3>
                </div>
                <Badge 
                  variant={
                    ann.targetType === "ALL" ? "blue" : 
                    ann.targetType === "TEACHERS_ONLY" ? "purple" : "green"
                  }
                  className={styles.targetBadge}
                >
                  {ann.targetType === "YEAR_GROUP" ? "Cohorts" : ann.targetType.replace("_", " ")}
                </Badge>
              </div>

              <div className={styles.noticeBody}>
                <p className={styles.noticeContent}>{ann.content}</p>
              </div>

              <footer className={styles.noticeFooter}>
                <div className={styles.authorInfo}>
                  <div className={styles.avatar}>
                    {ann.author?.name?.charAt(0) || "A"}
                  </div>
                  <div className={styles.metaText}>
                    <span className={styles.authorName}>{ann.author?.name}</span>
                    <span className={styles.authorRole}>{ann.author?.role}</span>
                  </div>
                </div>
                <div className={styles.timestamp}>
                  <Clock size={12} />
                  {new Date(ann.createdAt).toLocaleDateString(undefined, { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </footer>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
