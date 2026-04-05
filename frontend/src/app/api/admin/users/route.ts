import { axiosClient } from "@/client/AxiosClient";
import { isAxiosError } from "axios";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await axiosClient.get("/admin/users");
    return NextResponse.json(res.data, { status: 200 });
  } catch (error) {
    console.error("Fetch admin users error:", error);
    if (isAxiosError(error)) {
      const statusCode = error.response?.status || 500;
      return NextResponse.json(
        error.response?.data || { error: "Failed to fetch users" },
        { status: statusCode },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await axiosClient.post("/admin/users", body);
    return NextResponse.json(res.data, { status: res.status });
  } catch (error) {
    console.error("Create admin user error:", error);
    if (isAxiosError(error)) {
      const statusCode = error.response?.status || 500;
      return NextResponse.json(
        error.response?.data || { error: "Failed to create user" },
        { status: statusCode },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
