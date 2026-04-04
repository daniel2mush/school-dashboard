// ============================================================
// components/ui/index.jsx
// Shared atomic components used across all pages.
// ============================================================

// ── Badge ────────────────────────────────────────────────────
export function Badge({ children, variant = "blue", style, className = "" }: any) {
  return <span className={`badge badge-${variant} ${className}`.trim()} style={style}>{children}</span>;
}

// ── Avatar ───────────────────────────────────────────────────
export function Avatar({ initials, color, size = 24, fontSize = 9 }: any) {
  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize,
        background: color,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

// ── MetricCard ───────────────────────────────────────────────
export function MetricCard({ label, value, sub, valueColor, style }: any) {
  return (
    <div className="metric-card" style={style}>
      <div className="metric-label">{label}</div>
      <div className="metric-value" style={valueColor ? { color: valueColor } : {}}>
        {value}
      </div>
      {sub && <div className="metric-sub">{sub}</div>}
    </div>
  );
}

// ── ProgressBar ──────────────────────────────────────────────
export function ProgressBar({ pct, color = "var(--accent)", height = 4, style }: any) {
  return (
    <div className="prog-bar" style={{ height, ...style }}>
      <div
        className="prog-fill"
        style={{ width: `${Math.min(pct, 100)}%`, background: color, height }}
      />
    </div>
  );
}

// ── Toggle ───────────────────────────────────────────────────
export function Toggle({ on, onToggle }: any) {
  return (
    <button
      className={`toggle ${on ? "on" : "off"}`}
      onClick={onToggle}
      title={on ? "Published" : "Draft"}
    />
  );
}

// ── PageHeader ───────────────────────────────────────────────
export function PageHeader({ title, children }: any) {
  return (
    <div className="page-header">
      <h1>{title}</h1>
      {children && <div className="page-header-actions">{children}</div>}
    </div>
  );
}

// ── Card ─────────────────────────────────────────────────────
export function Card({ children, style }: any) {
  return (
    <div className="card" style={style}>
      {children}
    </div>
  );
}

export function CardHeader({ title, action, onAction, children }: any) {
  return (
    <div className="card-header">
      <span className="card-title">{title}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {children}
        {action && (
          <span className="card-action" onClick={onAction}>
            {action}
          </span>
        )}
      </div>
    </div>
  );
}

// ── GradeRing ────────────────────────────────────────────────
export function GradeRing({ letter, bg, textColor, size = 32 }: any) {
  return (
    <div
      className="grade-ring"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: bg,
        color: textColor,
      }}
    >
      {letter}
    </div>
  );
}

// ── UserRow (avatar + name inline) ───────────────────────────
export function UserRow({ initials, color, name, sub, size = 22 }: any) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Avatar initials={initials} color={color} size={size} fontSize={size * 0.4} />
      <div>
        <div style={{ fontSize: 12, color: "var(--text-primary)" }}>{name}</div>
        {sub && <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── FeeBar (coloured progress specific to fees) ───────────────
export function FeeBar({ paid, total }: any) {
  const pct = Math.round((paid / total) * 100);
  const color = pct >= 100 ? "var(--green)" : pct >= 60 ? "var(--amber)" : "var(--red)";
  return (
    <div>
      <div style={{ fontSize: 10 }}>
        GHS {paid.toLocaleString()} / {total.toLocaleString()}
      </div>
      <div className="fee-bar">
        <div className="fee-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

// ── AttBadge ─────────────────────────────────────────────────
export function AttBadge({ pct }: any) {
  const variant = pct >= 90 ? "green" : pct >= 75 ? "amber" : "red";
  return <Badge variant={variant}>{pct}%</Badge>;
}

// ── StatusBadge ──────────────────────────────────────────────
export function FeeBadge({ paid, total }: any) {
  const pct = Math.round((paid / total) * 100);
  if (pct >= 100) return <Badge variant="green">Paid</Badge>;
  if (pct >= 60)  return <Badge variant="amber">Partial</Badge>;
  return <Badge variant="red">Overdue</Badge>;
}

// ── AnnouncementItem ─────────────────────────────────────────
export function AnnouncementItem({ ann }: any) {
  return (
    <div className="ann-item">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div className="ann-title">
          {ann.title}{" "}
          {ann.urgent && <Badge variant="red">Urgent</Badge>}
        </div>
        <span style={{ fontSize: 10, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{ann.date}</span>
      </div>
      <div className="ann-meta">
        {ann.from} · <Badge variant="blue">{ann.target}</Badge>
      </div>
      <div className="ann-body">{ann.body}</div>
    </div>
  );
}

// ── SelectInput ──────────────────────────────────────────────
export function SelectInput({ options, style, value, onChange }: any) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{
        fontSize: 11,
        padding: "3px 8px",
        border: "0.5px solid var(--border-mid)",
        borderRadius: "var(--radius-md)",
        background: "var(--bg-secondary)",
        color: "var(--text-primary)",
        ...style,
      }}
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}
export * from "./Input/Input";
export * from "./Button/Button";
