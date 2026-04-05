import { axiosClient } from "@/client/AxiosClient";
import { isAxiosError } from "axios";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await axiosClient.get("/user/announcements");
    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    console.error("Fetch announcements error:", error);

    if (isAxiosError(error)) {
      const statusCode = error.response?.status || 500;
      return NextResponse.json(
        error.response?.data || { error: "Failed to fetch announcements" },
        { status: statusCode },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
