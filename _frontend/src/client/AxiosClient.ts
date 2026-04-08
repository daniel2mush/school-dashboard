"use server";
import axios from "axios";
import { cookies } from "next/headers";

/**
 * Server-Side Axios Client
 * Designed specifically for Next.js Route Handlers and Server Actions.
 */
export const axiosClient = axios.create({
  baseURL: "http://localhost:3001/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(async (config) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

/**
 * Response Interceptor: Token Rotation
 * Catches 401 Unauthorized errors, attempts to refresh the access token
 * using the stored refresh token, updates cookies, and retries the request.
 */
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. Guard against non-401 errors, network timeouts, and infinite retry loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.info("Getting new token");

        const cookieStore = await cookies();
        const refreshToken = cookieStore.get("refreshToken")?.value;

        // Abort token rotation if no refresh token exists
        if (!refreshToken) {
          return Promise.reject(error);
        }

        // 2. Request new tokens from the backend
        // Note: Using a fresh `axios.post` instance prevents infinite loops
        // if the refresh endpoint itself returns a 401 Unauthorized.
        const response = await axios.post(
          "http://localhost:3001/api/auth/refresh-token",
          {},
          {
            headers: {
              Cookie: `refreshToken=${refreshToken}`, // Manually attach server-side cookie
            },
          },
        );

        const { accessToken } = response.data.data;

        // 3. Update the Access Token in the Next.js cookie store
        cookieStore.set("accessToken", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        });

        // 4. Extract and update the Refresh Token from the backend's response headers
        const setCookieHeaders = response.headers["set-cookie"];

        if (setCookieHeaders) {
          const refreshTokenCookie = setCookieHeaders.find((cookie) =>
            cookie.startsWith("refreshToken="),
          );

          if (refreshTokenCookie) {
            // Parse token value (e.g., "refreshToken=abc123xyz; Path=/;" -> "abc123xyz")
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

        // 5. Update the original request's Authorization header and retry it
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

        console.info("New Token Succesfully set");

        return axiosClient(originalRequest);
      } catch (refreshError) {
        console.error("Token rotation failed:", refreshError);
        return Promise.reject(error);
      }
    }

    // Return any standard or non-401 errors
    return Promise.reject(error);
  },
);
