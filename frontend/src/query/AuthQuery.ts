import useUserStore from "@/store/UserStore";
import { LoginResponse, User, UserResponse } from "@/types/Types";
import { LoginFormData } from "@/validation/authValidation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useLoginUser = () => {
  const { setUser } = useUserStore();
  return useMutation({
    mutationKey: ["auth", "login"],
    mutationFn: async (data: LoginFormData) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(
          responseData.message || responseData.error || "Login failed",
        );
      }

      return responseData as LoginResponse;
    },
    onSuccess: async (data) => {
      toast.success("Login successful, Setting up your profile");

      const userId = data.data.user.id;
      const res = await fetch(`/api/user/${userId}`);
      const responseData = await res.json();
      if (!res.ok) {
        throw new Error(
          responseData.message || responseData.error || "Login failed",
        );
      }

      const { data: userData } = responseData as UserResponse;

      setUser(userData);
    },

    onError: (data) => {
      toast.error(data.message);
    },
  });
};

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
