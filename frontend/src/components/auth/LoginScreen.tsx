"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Avatar } from "../ui";
import {
  ROLE_LABELS,
  getDashboardHref,
  type AppRole,
} from "../../constants/navigation";
import { SCHOOL } from "../../data/mockData";
import { DEMO_PASSWORD, DEMO_USERS } from "../../lib/demoAuth";
import { useAuth } from "../../providers/AuthProvider";

const ROLE_BADGE_VARIANT: Record<AppRole, string> = {
  principal: "blue",
  teacher: "green",
  student: "amber",
};

export default function LoginScreen() {
  const router = useRouter();
  const { user, isReady, login, loginAsRole } = useAuth();
  const [email, setEmail] = useState(DEMO_USERS[0].email);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isReady && user) {
      router.replace(getDashboardHref(user.role));
    }
  }, [isReady, router, user]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const result = login(email, password);

    if ("error" in result) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    router.replace(getDashboardHref(result.user.role));
  };

  const handleQuickLogin = (role: AppRole) => {
    setError("");
    const result = loginAsRole(role);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    router.replace(getDashboardHref(result.user.role));
  };

  if (!isReady || user) {
    return (
      <div className="loading-screen">
        <div className="loading-card">
          <div
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Sunridge Academy
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, marginTop: 8 }}>
            Preparing your dashboard
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              marginTop: 8,
            }}
          >
            Restoring your demo session and sending you to the right workspace.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-screen">
      <div className="auth-grid">
        <section className="auth-hero">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 18,
              flexWrap: "wrap",
            }}
          >
            <Badge variant="blue">Route-based dashboards</Badge>
            <Badge variant="gray">Demo auth enabled</Badge>
          </div>

          <div
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.82)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {SCHOOL.name}
          </div>
          <h1
            style={{
              fontSize: "clamp(2.25rem, 4vw, 4.2rem)",
              lineHeight: 1.02,
              marginTop: 12,
              maxWidth: 560,
            }}
          >
            Each section now lives as its own dashboard route.
          </h1>
          <p
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,0.78)",
              marginTop: 18,
              maxWidth: 560,
            }}
          >
            Sign in with any seeded user to move through the principal, teacher,
            or student dashboards with real page URLs, persistent demo auth, and
            the existing school views preserved behind the new structure.
          </p>

          <div className="auth-feature-grid">
            {[
              {
                title: "Principal workspace",
                body: "School operations, finance, analytics, announcements, and platform management in separate routes.",
              },
              {
                title: "Teacher workspace",
                body: "Class dashboards for grading, attendance, content, and communication without the old role preview switch.",
              },
              {
                title: "Student workspace",
                body: "A personal dashboard with subjects, timetable, attendance, report card, and fee views split into pages.",
              },
            ].map((feature) => (
              <div key={feature.title} className="auth-feature-card">
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {feature.title}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.72)",
                    marginTop: 8,
                  }}
                >
                  {feature.body}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="auth-panel">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Demo Sign In
              </div>
              <h2 style={{ fontSize: 30, lineHeight: 1.05, marginTop: 8 }}>
                Enter the app the way your users will.
              </h2>
            </div>
            <Badge variant="green">{SCHOOL.term}</Badge>
          </div>

          <div
            style={{
              marginTop: 16,
              padding: "12px 14px",
              borderRadius: 16,
              background: "var(--accent-bg)",
              color: "var(--accent-text)",
              fontSize: 13,
            }}
          >
            Default password for all demo accounts:{" "}
            <strong>{DEMO_PASSWORD}</strong>
          </div>

          <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: 6,
              }}
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@sunridge.academy"
              className="auth-input"
            />

            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginTop: 14,
                marginBottom: 6,
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="auth-input"
            />

            {error && (
              <div
                style={{
                  marginTop: 14,
                  padding: "12px 14px",
                  borderRadius: 14,
                  background: "var(--red-bg)",
                  color: "var(--red-text)",
                  fontSize: 13,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: "100%",
                marginTop: 18,
                padding: "12px 16px",
                fontSize: 14,
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div style={{ marginTop: 24 }}>
            <div
              style={{
                fontSize: 12,
                color: "var(--text-secondary)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Seeded users
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {DEMO_USERS.map((demoUser) => (
                <div key={demoUser.id} className="demo-user-card">
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <Avatar
                      initials={demoUser.initials}
                      color={demoUser.color}
                      size={42}
                      fontSize={15}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ fontSize: 14, fontWeight: 600 }}>
                          {demoUser.name}
                        </div>
                        <Badge variant={ROLE_BADGE_VARIANT[demoUser.role]}>
                          {ROLE_LABELS[demoUser.role]}
                        </Badge>
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--text-secondary)",
                          marginTop: 2,
                        }}
                      >
                        {demoUser.email}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text-tertiary)",
                          marginTop: 4,
                        }}
                      >
                        {demoUser.subtitle}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginTop: 14,
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="button"
                      className="btn"
                      onClick={() => {
                        setEmail(demoUser.email);
                        setPassword(DEMO_PASSWORD);
                        setError("");
                      }}
                    >
                      Use details
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleQuickLogin(demoUser.role)}
                    >
                      Sign in as {ROLE_LABELS[demoUser.role]}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
