import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import type { LoginFormData } from '../validation/authValidation'
import { getDashboardHref } from '../constants/navigation'
import type {
  LoginResponse,
  UserResponse,
  Announcement,
  Material,
  User,
} from '#/types/Types'
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

export const useGetStudentMaterials = () => {
  return useQuery({
    queryKey: ['student', 'materials'],
    queryFn: async () => {
      const res = await fetch('/api/user/materials')
      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(
          responseData.message ||
            responseData.error ||
            'Failed to fetch class content',
        )
      }
      return responseData.data as Material[]
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

export const useGetUserProfile = (userId: number) => {
  return useQuery({
    queryKey: ['auth', 'user', userId],
    queryFn: async () => {
      const res = await fetch(`/api/user/${userId}`)
      const responseData = await res.json()
      if (!res.ok) {
        throw new Error(
          responseData.message ||
            responseData.error ||
            'Failed to fetch profile',
        )
      }

      return responseData.data as User
    },
    enabled: !!userId,
  })
}

export const useLogout = () => {
  const navigate = useNavigate()
  const { clearUser } = useUserStore()

  return useMutation({
    mutationKey: ['logout'],
    mutationFn: async () => {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      const responseData = await res.json()

      if (!res.ok) {
        throw new Error(responseData.message || 'Logout unsuccessful')
      }

      return responseData.data
    },
    onSuccess: () => {
      clearUser()
      navigate({ to: '/login', replace: true })
      toast.success('Logout successful')
    },
    onError: (error: any) => {
      // Even if the server-side logout fails, we should probably clear the local state
      // so the user isn't stuck. But let's report the error.
      console.error('Logout error:', error)
      clearUser()
      navigate({ to: '/login', replace: true })
      toast.error(error.message || 'Logout failed, but session cleared locally')
    },
  })
}
