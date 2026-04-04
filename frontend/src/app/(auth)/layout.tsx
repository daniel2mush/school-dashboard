import React, { ReactNode } from "react";
import styles from "./Auth.module.scss";
import AuthImage from "@/components/auth/AuthImage/AuthImage";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className={styles.container}>
      <div className={styles.content}>
        <AuthImage />
        {children}
      </div>
    </section>
  );
}
