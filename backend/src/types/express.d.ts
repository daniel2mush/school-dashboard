import { jwtUserTypes } from "./Types.ts";

declare global {
  namespace Express {
    interface Request {
      user: jwtUserTypes;
    }
  }
}

export {};
