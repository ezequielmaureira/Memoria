import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const UPLOADS_DIR = path.resolve("uploads");

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

export const localStorageDriver = {
  async saveFile(file) {
    ensureUploadsDir();
    const ext = path.extname(file.originalname) || ".jpg";
    const filename = `${crypto.randomUUID()}${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);
    fs.writeFileSync(filePath, file.buffer);
    const port = process.env.PORT || 4000;
    return { url: `http://localhost:${port}/uploads/${filename}` };
  },
};
