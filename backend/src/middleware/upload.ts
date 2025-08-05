// import multer from "multer";
import { Request } from "express";
import multer, {StorageEngine, Options, FileFilterCallback} from "multer";
import * as path from "node:path";
import fs from "fs";
import type Express from "express"; // Import Express to fix the undeclared variable error

import HttpExeption from "../utils/HttpExeption";

// Создаем папку uploads если её нет
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
type FilenameCallback = (error: Error | null, filename: string) => void;

const storage: StorageEngine = multer.diskStorage({
    destination: path.resolve("temp"),
    filename: (req: Request, file: Express.Multer.File, callback: FilenameCallback): void => {
        const uniquePrefix: string = `${Date.now()}_${Math.round(Math.random() * 1E9)}`;
        const filename: string = `${uniquePrefix}_${file.originalname}`;
        callback(null, filename);
    }
});

const limits: Options["limits"]  = {
    fileSize: 1024 * 1024 * 10
};

const fileFilter = (req: Request, file: Express.Multer.File, callback: FileFilterCallback)=> {
    const extension = file.originalname.split(".").pop() as string;
    if(extension === "exe") {
        return callback(HttpExeption(400, ".exe file not allow"));
    }
    callback(null, true);
}

// Настройка multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB максимум
    files: 4, // Максимум 4 файла
  },
});

export default upload;
