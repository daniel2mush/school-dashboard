import { axiosClient } from "@/client/AxiosClient";
import { isAxiosError } from "axios";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = (await params).id;
  if (!id) {
    return NextResponse.json({ message: "User id required" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const res = await axiosClient.patch(`/admin/users/${id}`, body);
    return NextResponse.json(res.data, { status: res.status });
  } catch (error) {
    console.error("Update user error:", error);
    if (isAxiosError(error)) {
      const statusCode = error.response?.status || 500;
      return NextResponse.json(
        error.response?.data || { error: "Failed to update user" },
        { status: statusCode },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = (await params).id;
  if (!id) {
    return NextResponse.json({ message: "User id required" }, { status: 400 });
  }
  try {
    const res = await axiosClient.delete(`/admin/users/${id}`);
    return NextResponse.json(res.data, { status: res.status });
  } catch (error) {
    console.error("Delete user error:", error);
    if (isAxiosError(error)) {
      const statusCode = error.response?.status || 500;
      return NextResponse.json(
        error.response?.data || { error: "Failed to delete user" },
        { status: statusCode },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
