import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import {
  User,
  YearGroup,
  Subject,
  Fee,
  Timetable,
  Announcement,
} from "@/types/Types";
import { toast } from "sonner";

export type AdminAnalyticsRes = {
  data: AdminAnalyticsData;
};

export type AdminAnalyticsData = {
  students: number;
  teachers: number;
  yearGroups: number;
  subjects: number;
  totalExpectedRevenue: number;
  totalCollectedRevenue: number;
  /** % present among P/A/T records; null when there is no attendance data */
  attendancePresentPct: number | null;
  /** Active students in year groups that still have under-paid fee records */
  studentsWithOutstandingFees: number;
};

export type AdminDirectoryUser = User & {
  enrolledYearGroupId: number | null;
  enrolledYearGroup: { id: number; name: string } | null;
  specialization: string | null;
};

export type AdminCreateTeacherPayload = {
  role: "TEACHER";
  email: string;
  password: string;
  name: string;
  gender?: "Male" | "Female" | "Other";
  phoneNumber?: string;
  specialization?: string;
};

export type AdminCreateStudentPayload = {
  role: "STUDENT";
  email: string;
  password: string;
  name: string;
  gender?: "Male" | "Female" | "Other";
  phoneNumber?: string;
  enrolledYearGroupId: number;
};

export type CredentialsPayload = {
  email: string;
  temporaryPassword: string;
};

export const useGetAdminAnalytics = () => {
  return useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics");
      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(
          responseData.message ||
            responseData.error ||
            "Failed to fetch analytics",
        );
      }

      const analytics = responseData.data as AdminAnalyticsRes;

      return analytics.data as AdminAnalyticsData;
    },
  });
};

export const useGetAllUsers = () => {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(
          responseData.message || responseData.error || "Failed to fetch users",
        );
      }

      return responseData.data as AdminDirectoryUser[];
    },
  });
};

export type YearGroupTeacherBrief = {
  id: number;
  name: string;
  email: string;
  specialization: string | null;
};

export type AdminYearGroupStructure = YearGroup & {
  subjects: Subject[];
  fees: Fee[];
  timetables: Timetable[];
  teachers: YearGroupTeacherBrief[];
  _count: { students: number; teachers: number };
};

export const useGetSchoolStructure = () => {
  return useQuery({
    queryKey: ["admin", "structure"],
    queryFn: async () => {
      const res = await fetch("/api/admin/structure");
      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(
          responseData.message ||
            responseData.error ||
            "Failed to fetch structure",
        );
      }

      return responseData.data as AdminYearGroupStructure[];
    },
  });
};

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Announcement>) => {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const responseData = await res.json();
      if (!res.ok) {
        throw new Error(
          responseData.message || "Failed to create announcement",
        );
      }
      return responseData.data;
    },
    onSuccess: () => {
      toast.success("Announcement broadcasted successfully");
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

const invalidateYearGroupRelated = (qc: QueryClient) => {
  qc.invalidateQueries({ queryKey: ["admin", "structure"] });
  qc.invalidateQueries({ queryKey: ["admin", "users"] });
  qc.invalidateQueries({ queryKey: ["admin", "analytics"] });
};

export const useCreateYearGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      level: string;
      roomNumber?: string;
    }) => {
      const res = await fetch("/api/admin/year-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const responseData = await res.json();
      if (!res.ok) {
        throw new Error(
          responseData.message || responseData.error || "Could not create cohort",
        );
      }
      return responseData.data;
    },
    onSuccess: () => {
      toast.success("Year group created");
      invalidateYearGroupRelated(qc);
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useAssignTeacherToYearGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { yearGroupId: number; teacherId: number }) => {
      const res = await fetch("/api/admin/year-groups/assign-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const responseData = await res.json();
      if (!res.ok) {
        throw new Error(
          responseData.message || responseData.error || "Could not assign teacher",
        );
      }
      return responseData.data;
    },
    onSuccess: () => {
      toast.success("Teacher assigned");
      invalidateYearGroupRelated(qc);
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useUnassignTeacherFromYearGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { yearGroupId: number; teacherId: number }) => {
      const res = await fetch("/api/admin/year-groups/unassign-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const responseData = await res.json();
      if (!res.ok) {
        throw new Error(
          responseData.message || responseData.error || "Could not remove teacher",
        );
      }
      return responseData.data;
    },
    onSuccess: () => {
      toast.success("Teacher removed from cohort");
      invalidateYearGroupRelated(qc);
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useMoveStudentYearGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { studentId: number; yearGroupId: number }) => {
      const res = await fetch("/api/admin/year-groups/move-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const responseData = await res.json();
      if (!res.ok) {
        throw new Error(
          responseData.message || responseData.error || "Could not move student",
        );
      }
      return responseData.data;
    },
    onSuccess: () => {
      toast.success("Student moved");
      invalidateYearGroupRelated(qc);
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

const invalidateAdminDirectory = (qc: QueryClient) => {
  qc.invalidateQueries({ queryKey: ["admin", "users"] });
  qc.invalidateQueries({ queryKey: ["admin", "analytics"] });
  qc.invalidateQueries({ queryKey: ["admin", "structure"] });
};

export const useCreateAdminUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      payload: AdminCreateTeacherPayload | AdminCreateStudentPayload,
    ) => {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const responseData = await res.json();
      if (!res.ok) {
        throw new Error(
          responseData.message ||
            responseData.error ||
            "Could not create account",
        );
      }
      return responseData.data as {
        user: AdminDirectoryUser;
        temporaryPassword: string;
      };
    },
    onSuccess: () => {
      invalidateAdminDirectory(qc);
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useUpdateUserStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      userId: number;
      status: "Active" | "Inactive" | "Suspended";
    }) => {
      const res = await fetch(`/api/admin/users/${payload.userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: payload.status }),
      });
      const responseData = await res.json();
      if (!res.ok) {
        throw new Error(
          responseData.message ||
            responseData.error ||
            "Could not update access",
        );
      }
      return responseData.data as AdminDirectoryUser;
    },
    onSuccess: (_, v) => {
      invalidateAdminDirectory(qc);
      toast.success(
        v.status === "Active"
          ? "Access restored"
          : "Access restricted for this account",
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteAdminUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: number) => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      const responseData = await res.json();
      if (!res.ok) {
        throw new Error(
          responseData.message ||
            responseData.error ||
            "Could not remove user",
        );
      }
      return responseData.data;
    },
    onSuccess: () => {
      invalidateAdminDirectory(qc);
      toast.success("User removed from the directory");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useResetUserPassword = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: number) => {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: "POST",
      });
      const responseData = await res.json();
      if (!res.ok) {
        throw new Error(
          responseData.message ||
            responseData.error ||
            "Could not reset password",
        );
      }
      return responseData.data as CredentialsPayload;
    },
    onSuccess: () => {
      invalidateAdminDirectory(qc);
    },
    onError: (e: Error) => toast.error(e.message),
  });
};
