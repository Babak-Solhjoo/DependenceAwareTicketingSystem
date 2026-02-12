import { getPrisma } from "../db/prisma";
import { HttpError } from "../utils/errors";
import { deleteProfilePhoto } from "./storageService";

type UpdateProfileInput = {
  firstName?: string;
  lastName?: string;
  photo?: string | null;
};

export const getProfileForUser = async (userId: string) => {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      photo: true
    }
  });

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  return user;
};

export const updateProfileForUser = async (userId: string, data: UpdateProfileInput) => {
  const prisma = getPrisma();
  const updateData: UpdateProfileInput = {};

  if (data.firstName !== undefined) {
    updateData.firstName = data.firstName;
  }
  if (data.lastName !== undefined) {
    updateData.lastName = data.lastName;
  }
  if (Object.prototype.hasOwnProperty.call(data, "photo")) {
    if (data.photo === null) {
      const current = await prisma.user.findUnique({
        where: { id: userId },
        select: { photo: true }
      });
      if (current?.photo) {
        await deleteProfilePhoto(current.photo);
      }
      updateData.photo = null;
    } else if (data.photo !== undefined) {
      updateData.photo = data.photo;
    }
  }

  if (Object.keys(updateData).length === 0) {
    return getProfileForUser(userId);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      photo: true
    }
  });

  return updated;
};
