import { Schema, SchemaDefinition } from 'mongoose';
import { ZodArray, ZodBoolean, ZodNumber, ZodObject, ZodOptional, ZodSchema, ZodString, ZodTypeAny } from 'zod';

export const zodToMongoose = <T extends ZodSchema<any>>(schema: T): SchemaDefinition => {
  if (!(schema instanceof ZodObject)) {
    throw new Error('Only ZodObject schemas are supported.');
  }

  return Object.entries(schema.shape).reduce<SchemaDefinition>((acc, [key, value]: any) => {
    acc[key] = convertZodType(value);
    return acc;
  }, {});
};

const convertZodType = (value: ZodTypeAny): any => {
  if (value instanceof ZodObject) {
    return new Schema(zodToMongoose(value));
  }
  if (value instanceof ZodOptional) {
    return { ...convertZodType(value._def.innerType), required: false };
  }
  if (value instanceof ZodString) {
    return { type: String, required: true };
  }
  if (value instanceof ZodNumber) {
    return { type: Number, required: true };
  }
  if (value instanceof ZodBoolean) {
    return { type: Boolean, required: true };
  }
  if (value instanceof ZodArray) {
    return [{ type: convertZodType(value._def.type) }];
  }
  return { type: Object }; // Fallback for unsupported types
};
