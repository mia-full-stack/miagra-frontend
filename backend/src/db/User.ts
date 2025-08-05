import {Schema, model, Document} from "mongoose";

// import { handleSaveError, setUpdateSettings } from "./hooks";

// import { emailValidation } from "../constants/users.constants";

// import { Role } from "../typescript/types";

interface User {
  fullName: string;
  email: string;
  password: string;
  token?: string;
}

export type UserDocument = User & Document;