export interface User {
  id: string;
  fullName: string;
  email: string;
  role: "principal" | "teacher" | "student";
  classId?: string;
  class?: {
    id: string;
    name: string;
    level: string;
  };
}

//LoginResponse

// {
//   "success": true,
//   "message": "User login successful",
//   "data": {
//     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJTVFVERU5UIiwiZW1haWwiOiJhZG1pbkBnbWFpbC5jb20iLCJuYW1lIjoiQWRtaW4iLCJpYXQiOjE3NzUyOTA5MzcsImV4cCI6MTc3NTI5MTgzN30.fMuTOHPIULwN7KJ5yHD8OT2h-h3JyMX12YZPm9ihXSs",
//     "user": {
//       "id": 1,
//       "role": "STUDENT",
//       "email": "admin@gmail.com",
//       "name": "Admin"
//     }
//   }
// }

export interface LoginResponse {
  success: boolean;
  message: string;
  data: LoginResponseData;
}

export interface LoginResponseData {
  accessToken: string;
  user: User;
}
