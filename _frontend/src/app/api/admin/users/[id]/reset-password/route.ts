import { axiosClient } from "@/client/AxiosClient";
import { isAxiosError } from "axios";
import { NextResponse } from "next/server";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = (await params).id;
  if (!id) {
    return NextResponse.json({ message: "User id required" }, { status: 400 });
  }
  try {
    const res = await axiosClient.post(`/admin/users/${id}/reset-password`);
    return NextResponse.json(res.data, { status: res.status });
  } catch (error) {
    console.error("Reset password error:", error);
    if (isAxiosError(error)) {
      const statusCode = error.response?.status || 500;
      return NextResponse.json(
        error.response?.data || { error: "Failed to reset password" },
        { status: statusCode },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
