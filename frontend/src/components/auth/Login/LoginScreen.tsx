"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Input, Button } from "../../ui";
import { SCHOOL } from "../../../data/mockData";
import styles from "./LoginScreen.module.scss";

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    // Simulate login delay
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <Avatar size="lg" alt={`${SCHOOL.name} Logo`} />
          </div>
          <div className={styles.title}>
            <h1>{SCHOOL.name}</h1>
            <p>School Dashboard</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            required
            fullWidth
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            required
            fullWidth
          />
          <Button
            type="submit"
            fullWidth
            variant="primary"
            loading={loading}
            className={styles.submitBtn}
          >
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
