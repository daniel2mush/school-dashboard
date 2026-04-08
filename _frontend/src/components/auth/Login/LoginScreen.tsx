"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Input, Button } from "../../ui";
import styles from "./LoginScreen.module.scss";
import { useForm } from "react-hook-form";
import { LoginFormData, loginSchema } from "@/validation/authValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginUser } from "@/query/AuthQuery";

export default function LoginScreen() {
  const router = useRouter();
  const { mutateAsync: loginUser, isPending: loading, error } = useLoginUser();

  const handleLoginSubmit = (data: LoginFormData) => {
    loginUser(data);
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.logo}>SA</div>
          <div className={styles.title}>
            <h1>Sunridge Academy</h1>
            <p>School Dashboard</p>
          </div>
        </div>
        <form
          onSubmit={handleSubmit(handleLoginSubmit)}
          className={styles.form}
        >
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            fullWidth
            {...register("email")}
            error={errors.email?.message}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            fullWidth
            {...register("password")}
            error={errors.password?.message}
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
