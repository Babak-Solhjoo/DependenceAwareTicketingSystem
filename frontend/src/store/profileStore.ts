import { create } from "zustand";
import api from "../lib/api";

export type Profile = {
  firstName: string;
  lastName: string;
  photoUrl: string | null;
};

type ProfileState = {
  profile: Profile;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  saveProfile: (payload: { firstName?: string; lastName?: string; photo?: string | null }) => Promise<void>;
  uploadPhoto: (file: File) => Promise<void>;
};

const profileFromStorage = (): Profile => ({
  firstName: localStorage.getItem("profileName") ?? "",
  lastName: localStorage.getItem("profileSurname") ?? "",
  photoUrl: localStorage.getItem("profilePhotoUrl")
});

const persistProfile = (profile: Profile) => {
  try {
    localStorage.setItem("profileName", profile.firstName);
    localStorage.setItem("profileSurname", profile.lastName);
    if (profile.photoUrl && !profile.photoUrl.startsWith("data:")) {
      localStorage.setItem("profilePhotoUrl", profile.photoUrl);
    } else {
      localStorage.removeItem("profilePhotoUrl");
    }
  } catch {
    // Ignore storage quota errors and rely on in-memory state.
  }
};

export const profileStore = create<ProfileState>((set) => ({
  profile: profileFromStorage(),
  loading: false,
  error: null,
  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/api/profile");
      const profile = {
        firstName: res.data.profile.firstName ?? "",
        lastName: res.data.profile.lastName ?? "",
        photoUrl: res.data.profile.photoUrl ?? null
      };
      persistProfile(profile);
      set({ profile, loading: false });
    } catch (error) {
      set({ loading: false, error: "Failed to load profile" });
    }
  },
  saveProfile: async (payload) => {
    set({ loading: true, error: null });
    try {
      const res = await api.put("/api/profile", payload);
      const profile = {
        firstName: res.data.profile.firstName ?? "",
        lastName: res.data.profile.lastName ?? "",
        photoUrl: res.data.profile.photoUrl ?? null
      };
      persistProfile(profile);
      set({ profile, loading: false });
    } catch (error) {
      set({ loading: false, error: "Failed to save profile" });
    }
  },
  uploadPhoto: async (file) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const res = await api.post("/api/profile/photo", formData);
      const profile = {
        firstName: res.data.profile.firstName ?? "",
        lastName: res.data.profile.lastName ?? "",
        photoUrl: res.data.profile.photoUrl ?? null
      };
      persistProfile(profile);
      set({ profile, loading: false });
    } catch (error) {
      set({ loading: false, error: "Failed to upload photo" });
    }
  }
}));
