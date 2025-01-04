import { create } from "zustand";
import { axiosInstance } from "../utils/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:8080" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIng: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  isUpdatingFullname: false,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data.data });
      get().connectSocket();
    } catch (error) {
      if (error.response?.status === 401) {
        console.warn("Access token expired, attempting refresh...");
        await useAuthStore.getState().refreshToken();
      } else {
        console.error("Auth check failed:", error);
        set({ authUser: null });
      }
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  refreshToken: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.post("/auth/refresh");
      set({ authUser: res.data.data });
    } catch (error) {
      console.error("Refresh token failed:", error);
      set({ authUser: null });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data.data });
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  logout: async () => {
    try {
      const res = await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success(res.data.message);
    } catch (error) {
      console.error(error.response.data.message);
      toast.error(error.response.data.message);
    }
  },

  login: async (data) => {
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data.data });
      toast.success(res.data.message);
    } catch (error) {
      console.error(error.response.data.message);
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const userId = useAuthStore.getState().authUser._id;
      const res = await axiosInstance.put(
        `/auth/update-profile/${userId}`,
        data
      );
      set({ authUser: res.data.data });
      toast.success(res.data.message);
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  updateFullname: async (data) => {
    set({ isUpdatingFullname: true });
    try {
      const userId = useAuthStore.getState().authUser._id;
      const res = await axiosInstance.put(
        `/auth/update-fullname/${userId}`,
        data
      );
      set({ authUser: res.data.data });
      toast.success(res.data.message);
    } catch (error) {
      console.log("error in update fullname:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingFullname: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
