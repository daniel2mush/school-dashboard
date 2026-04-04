import { axiosClient } from "@/client/AxiosClient";
import { isAxiosError } from "axios";
import { NextResponse } from "next/server";

// 1. The first parameter MUST be the standard Request object.
// 2. The params object is destructured from the second parameter.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = (await params).id;

  if (!id) {
    return NextResponse.json(
      { message: "User ID is required" },
      { status: 400 },
    );
  }

  try {
    const res = await axiosClient.get(`/user/${id}`, {
      headers: {
        Cookie: req.headers.get("Cookie"),
      },
      withCredentials: true,
    });
    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    console.error("Fetch User Error:", error);

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
