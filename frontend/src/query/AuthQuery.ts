import useUserStore from "@/store/UserStore";
import { LoginResponse } from "@/types/Types";
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
    onSuccess: (data) => {
      setUser(data.data.user);
      toast.success("Login successful");
    },

    onError: (data) => {
      toast.error(data.message);
    },
  });
};
