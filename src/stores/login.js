import { defineStore } from "pinia";

export const useLoginStore = defineStore("loginStore", {
  state: () => ({
    userId: "",
    isLoggedIn: false,
  }),

  actions: {
    login(userId) {
      this.userId = userId;
      this.isLoggedIn = true;
    },
    logout() {
      this.userId = "";
      this.isLoggedIn = false;
    },
  },

  persist: true,
});
