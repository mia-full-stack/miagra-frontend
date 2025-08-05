import { Types } from "mongoose";

// Утилитные функции для валидации ObjectId
export const isValidObjectId = (id: any): id is string => {
  return typeof id === "string" && Types.ObjectId.isValid(id);
};

export const createObjectId = (id: string): Types.ObjectId => {
  if (!isValidObjectId(id)) {
    throw new Error(`Invalid ObjectId: ${id}`);
  }
  return new Types.ObjectId(id);
};

export const validateObjectId = (id: any, fieldName = "ID"): string => {
  if (!id) {
    throw new Error(`${fieldName} is required`);
  }

  if (typeof id !== "string") {
    throw new Error(`${fieldName} must be a string`);
  }

  if (!Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ${fieldName} format`);
  }

  return id;
};
