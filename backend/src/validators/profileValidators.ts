import { z } from "zod";

const optionalTrimmed = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value;
    }
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  },
  z.string().max(100).optional()
);

const optionalPhoto = z.preprocess(
  (value) => {
    if (value === null || value === undefined) {
      return value;
    }
    if (typeof value !== "string") {
      return value;
    }
    return value.trim() === "" ? undefined : value;
  },
  z.string().max(5000000).optional().nullable()
);

export const updateProfileSchema = z.object({
  firstName: optionalTrimmed,
  lastName: optionalTrimmed,
  photo: optionalPhoto
});
