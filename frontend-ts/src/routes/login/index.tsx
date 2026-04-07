import { createFileRoute } from '@tanstack/react-router'
import styles from './LoginScreen.module.scss'
import {
  
  loginSchema
} from '#/components/validation/authValidation'
import type {LoginFormData} from '#/components/validation/authValidation';
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '#/components/ui/Input/Input'
import { Button } from '#/components/ui/Button/Button'
import AuthImage from '#/components/AuthImage/AuthImage'
import { useLoginUser } from '#/components/query/AuthQuery'

export const Route = createFileRoute('/login/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { mutateAsync: loginUser, isPending: loading } = useLoginUser()

  const handleLoginSubmit = (data: LoginFormData) => {
    loginUser(data)
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema as any),
    defaultValues: {
      email: '',
      password: '',
    },
  })
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div>
          <AuthImage />
        </div>
        <div className={styles.loginContent}>
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
              {...register('email')}
              error={errors.email?.message}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              fullWidth
              {...register('password')}
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
    </div>
  )
}

// "use client";

// import { useEffect, useState } from "react";
// import { useNavigate } from "@tanstack/react-router";
// import { Avatar, Input, Button } from "../../ui";
// import { useLoginUser } from "@/query/AuthQuery";

// export default function LoginScreen() {

//   return (
//     <div className={styles.container}>
//       <div className={styles.content}>
//         <div className={styles.header}>
//           <div className={styles.logo}>SA</div>
//           <div className={styles.title}>
//             <h1>Sunridge Academy</h1>
//             <p>School Dashboard</p>
//           </div>
//         </div>
//         <form
//           onSubmit={handleSubmit(handleLoginSubmit)}
//           className={styles.form}
//         >
//           <Input
//             label="Email"
//             type="email"
//             placeholder="Enter your email"
//             fullWidth
//             {...register("email")}
//             error={errors.email?.message}
//           />
//           <Input
//             label="Password"
//             type="password"
//             placeholder="Enter your password"
//             fullWidth
//             {...register("password")}
//             error={errors.password?.message}
//           />
//           <Button
//             type="submit"
//             fullWidth
//             variant="primary"
//             loading={loading}
//             className={styles.submitBtn}
//           >
//             Sign In
//           </Button>
//         </form>
//       </div>
//     </div>
//   );
// }
