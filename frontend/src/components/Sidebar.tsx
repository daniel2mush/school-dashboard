import Link from "next/link";
import {
  NAV_CONFIG,
  getDashboardHref,
  type AppRole,
} from "../constants/navigation";
import { SCHOOL } from "../data/mockData";
import { Avatar } from "./ui";
import { UserStoreTypes } from "@/store/UserStore";
import { User } from "@/types/Types";

type SidebarProps = {
  currentSection: string;
  user: User;
};

export default function Sidebar({ currentSection, user }: SidebarProps) {
  const nav = NAV_CONFIG["principal"];

  return (
    <aside className="dashboard-sidebar">
      <div
        style={{
          padding: "20px 18px",
          borderBottom: "1px solid var(--border-light)",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "var(--text-secondary)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          School Dashboard
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "var(--text-primary)",
            marginTop: 8,
          }}
        >
          {SCHOOL.name}
        </div>
        <div
          style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 6 }}
        >
          {SCHOOL.term}
        </div>
      </div>

      {/* <nav style={{ flex: 1, paddingTop: 12 }}>
        {nav.map((item, i) =>
          "section" in item ? (
            <div
              key={i}
              style={{
                fontSize: 10,
                color: "var(--text-tertiary)",
                padding: "16px 18px 6px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {item.section}
            </div>
          ) : (
            <NavItem
              key={item.id}
              item={item}
              active={currentSection === item.id}
              href={getDashboardHref(user.role, item.id)}
            />
          ),
        )}
      </nav> */}

      <div
        style={{
          padding: "18px",
          borderTop: "1px solid var(--border-light)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* <Avatar
          initials={user.initials}
          color={user.color}
          size={34}
          fontSize={12}
        />
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--text-primary)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {user.name}
          </div>
          <div
            style={{
              fontSize: 10,
              color: "var(--text-secondary)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {user.subtitle}
          </div>
          <div
            style={{
              fontSize: 10,
              color: "var(--text-tertiary)",
              marginTop: 4,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {user.email}
          </div>
        </div> */}
      </div>
    </aside>
  );
}

function NavItem({ item, active, href }: any) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 18px",
        fontSize: 13,
        cursor: "pointer",
        borderLeft: `3px solid ${active ? "var(--accent)" : "transparent"}`,
        background: active ? "var(--accent-bg)" : "transparent",
        color: active ? "var(--accent)" : "var(--text-secondary)",
        fontWeight: active ? 600 : 500,
        textDecoration: "none",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = "var(--bg-secondary)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      <span style={{ width: 16, textAlign: "center", fontSize: 13 }}>
        {item.icon}
      </span>
      {item.label}
    </Link>
  );
}
