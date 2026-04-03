import { Response } from "express";

interface StandardResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

export const sendJson = (
  res: Response,
  code: number,
  success: boolean,
  message?: string,
  data?: unknown,
) => {
  const payload: StandardResponse = { success };

  if (message) payload.message = message;
  if (data !== undefined) payload.data = data;

  return res.status(code).json(payload);
};
