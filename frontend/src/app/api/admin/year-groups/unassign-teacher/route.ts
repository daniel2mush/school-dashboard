import { axiosClient } from "@/client/AxiosClient";
import { isAxiosError } from "axios";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await axiosClient.post(
      "/admin/year-groups/unassign-teacher",
      body,
    );
    return NextResponse.json(res.data, { status: res.status });
  } catch (error) {
    console.error("Unassign teacher error:", error);
    if (isAxiosError(error)) {
      const statusCode = error.response?.status || 500;
      return NextResponse.json(
        error.response?.data || { error: "Failed to remove teacher" },
        { status: statusCode },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
