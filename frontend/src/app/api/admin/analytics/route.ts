import { axiosClient } from "@/client/AxiosClient";
import { isAxiosError } from "axios";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await axiosClient.get("/admin/analytics", {
      withCredentials: true,
    });

    return NextResponse.json({ data: res.data }, { status: 200 });
  } catch (error) {
    console.error("Fetch Anaylytics Error:", error);

    if (isAxiosError(error)) {
      // 3. Forward the exact status code from your backend (e.g., 404, 403),
      // falling back to 500 only if the status is missing.
      const statusCode = error.response?.status || 500;

      return NextResponse.json(
        error.response?.data || { error: "Failed to fetch user" },
        { status: statusCode },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
