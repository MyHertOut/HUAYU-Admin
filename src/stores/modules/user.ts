import { defineStore } from "pinia";
import { UserState } from "@/stores/interface";
import piniaPersistConfig from "@/stores/helper/persist";

export const useUserStore = defineStore({
  id: "huaYu-user",
  state: (): UserState => ({
    token: "",
    userInfo: {
      id: null,
      username: "",
      loginame: "",
      password: "",
      position: "",
      department: "",
      email: "",
      phonenum: "",
      usertype: "",
      userstatus: null,
      description: "",
      remark: "",
      tenantId: null
    }
  }),
  getters: {},
  actions: {
    // Set Token
    setToken(token: string) {
      this.token = token;
    },
    // Set setUserInfo
    setUserInfo(userInfo: UserState["userInfo"]) {
      this.userInfo = userInfo;
    }
  },
  persist: piniaPersistConfig("huaYu-user")
});
