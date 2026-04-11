import multer from "multer";

export const uploadMiddlware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});
