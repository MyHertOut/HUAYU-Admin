import { ResPage, User } from "@/api/interface/index";
import { PORT4 } from "@/api/config/servicePort";
import http from "@/api";

/**
 * @name 用户管理模块
 */
export const getUserList = (params: User.ReqUserParams) => {
  return http.post<ResPage<User.ResUserList>>(PORT4 + `/user/findAll`, params);
};

export const addUser = (params: User.ReqUserParams) => {
  return http.post(PORT4 + `/user/add`, params);
};

export const editUser = (params: User.ReqUserParams) => {
  return http.put(PORT4 + `/user/update`, params);
};

export const delUser = (params: { ids: number[] }) => {
  return http.deleteBody(PORT4 + `/user/delete`, params);
};

export const findUserList = () => {
  return http.post<ResPage<User.ResUserList>>(PORT4 + `/user/findUserList`, {}, { loading: false });
};

export const updatePassword = params => {
  return http.post(PORT4 + `/user/updatePassword`, params);
};
