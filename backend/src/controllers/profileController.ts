import { Request, Response, NextFunction } from "express";
import { updateProfileSchema } from "../validators/profileValidators";
import { getProfileForUser, updateProfileForUser } from "../services/profileService";
import { getProfilePhotoUrl, uploadProfilePhoto } from "../services/storageService";

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await getProfileForUser(req.user!.id);
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const photoUrl = profile.photo ? await getProfilePhotoUrl(profile.photo, baseUrl) : null;
    res.json({ profile: { ...profile, photoUrl } });
  } catch (error) {
    next(error);
  }
};

export const getProfilePhotoUrlEndpoint = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await getProfileForUser(req.user!.id);
    if (!profile.photo) {
      res.json({ photoUrl: null });
      return;
    }
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const photoUrl = await getProfilePhotoUrl(profile.photo, baseUrl);
    res.json({ photoUrl });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateProfileSchema.parse(req.body);
    const profile = await updateProfileForUser(req.user!.id, data);
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const photoUrl = profile.photo ? await getProfilePhotoUrl(profile.photo, baseUrl) : null;
    res.json({ profile: { ...profile, photoUrl } });
  } catch (error) {
    next(error);
  }
};

export const updateProfilePhoto = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "Photo file is required" });
      return;
    }
    console.info("Received profile photo", {
      userId: req.user?.id,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size
    });
    const key = await uploadProfilePhoto(req.user!.id, req.file);
    const profile = await updateProfileForUser(req.user!.id, { photo: key });
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const photoUrl = profile.photo ? await getProfilePhotoUrl(profile.photo, baseUrl) : null;
    res.json({ profile: { ...profile, photoUrl } });
  } catch (error) {
    next(error);
  }
};
