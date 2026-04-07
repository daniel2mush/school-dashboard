import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import type { LoginFormData } from '../validation/authValidation'
import { getDashboardHref } from '../constants/navigation'
import type { LoginResponse, UserResponse, Announcement } from '#/types/Types'
import useUserStore from '../store/UserStore'

export const useLoginUser = () => {
  const navigate = useNavigate()
  const { setUser } = useUserStore()
  return useMutation({
    mutationKey: ['auth', 'login'],
    mutationFn: async (data: LoginFormData) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const responseData = await res.json()

      if (!res.ok) {
        throw new Error(
          responseData.message || responseData.error || 'Login failed',
        )
      }

      return responseData as LoginResponse
    },
    onSuccess: async (data) => {
      toast.success('Login successful, Setting up your profile')

      const userId = data.data.user.id
      const res = await fetch(`/api/user/${userId}`)
      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(
          responseData.message || responseData.error || 'Login failed',
        )
      }

      const { data: userData } = responseData as UserResponse
      const redirectPath = getDashboardHref(userData.role)

      setUser(userData)
      navigate({ to: redirectPath })
    },

    onError: (data) => {
      toast.error(data.message)
    },
  })
}

export const useGetAnnouncements = () => {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const res = await fetch('/api/user/announcements')
      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(responseData.message || 'Failed to fetch announcements')
      }
      return responseData.data as Announcement[]
    },
  })
}

// const useGetUserProfile = (userId: number) => {
//   return useQuery({
//     queryKey: ["auth", "user"],
//     queryFn: async () => {
//       const res = await fetch(`/api/auth/user/${userId}`);
//       const responseData = await res.json();
//       if (!res.ok) {
//         throw new Error(
//           responseData.message || responseData.error || "Login failed",
//         );
//       }

//       return responseData as UserResponse;
//     },
//   });
// };

export const useLogout = () => {
  const navigate = useNavigate()
  const { clearUser, user } = useUserStore()

  return useMutation({
    mutationKey: ['logout'],
    mutationFn: async () => {
      const res = await fetch(`/api/user/${user!.id}`, { method: 'DELETE' })

      const responseData = await res.json()

      if (!res.ok) return toast.error('Logout unsuccessful')

      return responseData.data
    },
    onSuccess: () => {
      clearUser()
      navigate({ to: '/login', replace: true })
      toast.success('Logout successful')
    },
  })
}
