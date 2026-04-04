import { LoginResponse } from "@/types/Types";
import { LoginFormData } from "@/validation/authValidation";
import axios, { AxiosError, isAxiosError } from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Extract the data from the incoming Next.js Request
    const data: LoginFormData = await req.json();

    if (!data) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    // 2. Send the data to your backend
    const res = await axios.post("http://localhost:3001/api/auth/login", data);
    const newdata = res.data as LoginResponse;

    const cookieStore = await cookies();

    // 3. Set the access token (which comes from the response body)
    cookieStore.set("accessToken", newdata.data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Better practice!
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    // 4. Extract the refresh token from Axios's "set-cookie" header array
    const setCookieHeaders = res.headers["set-cookie"];

    if (setCookieHeaders) {
      // Find the specific string that starts with your token name
      const refreshTokenCookie = setCookieHeaders.find((cookie) =>
        cookie.startsWith("refreshToken="),
      );

      if (refreshTokenCookie) {
        // Extract just the value (e.g., pulling "abc123xyz" out of "refreshToken=abc123xyz; Path=/; HttpOnly")
        const tokenValue = refreshTokenCookie.split(";")[0].split("=")[1];

        cookieStore.set("refreshToken", tokenValue, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        });
      }
    }

    return NextResponse.json(newdata, { status: 200 });
  } catch (error) {
    console.error("Login Error:", error);

    if (isAxiosError(error)) {
      return NextResponse.json(error.response?.data, { status: 500 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
