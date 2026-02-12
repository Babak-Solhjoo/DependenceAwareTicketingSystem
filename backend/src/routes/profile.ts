import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth";
import {
	getProfile,
	updateProfile,
	updateProfilePhoto,
	getProfilePhotoUrlEndpoint
} from "../controllers/profileController";

const router = Router();
const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 5 * 1024 * 1024 }
});

router.use(requireAuth);

router.get("/", getProfile);
router.get("/photo-url", getProfilePhotoUrlEndpoint);
router.put("/", updateProfile);
router.post("/photo", upload.single("photo"), updateProfilePhoto);

export default router;
