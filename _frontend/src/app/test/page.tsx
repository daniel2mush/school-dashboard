// import { axiosClient } from "@/client/AxiosClient";
// import axios from "axios";
// import { cookies } from "next/headers";

// export default async function Test() {
//   await getCookies();

//   return <div> Hello</div>;
// }

// async function getCookies() {
//   "use server";
//   const cookieStore = await cookies();

//   // 1. Get the cookie object
//   const refreshTokenObj = await cookieStore.get("refreshToken");

//   // 2. Extract the actual string value
//   const refreshToken = refreshTokenObj?.value;

//   if (!refreshToken) {
//     console.error("No refresh token found in Next.js cookie store");
//     return;
//   }

//   try {
//     const response = await axios.post(
//       "http://localhost:3001/api/auth/refresh-token",
//       {},
//       {
//         headers: {
//           // 3. Pass only the string value
//           Cookie: `refreshToken=${refreshToken}`,
//         },
//       },
//     );

//     console.info("Success! Status:", response.data);
//     return response.data;
//   } catch (err) {
//     console.error(
//       "Status 401 - Error:",
//       err.response?.data?.message || err.message,
//     );
//   }
// }
