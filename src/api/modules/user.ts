import { ResPage, User } from "@/api/interface/index";
import http from "@/api";

/**
 * @name 用户管理模块
 */
export const getUserList = (params: User.ReqUserParams) => {
  return http.post<ResPage<User.ResUserList>>(`/user/findAll`, params);
};

export const addUser = (params: User.ReqUserParams) => {
  return http.post(`/user/add`, params);
};

export const editUser = (params: User.ReqUserParams) => {
  return http.put(`/user/update`, params);
};

export const delUser = (params: { ids: number[] }) => {
  return http.deleteBody(`/user/delete`, params);
};

export const findUserList = () => {
  return http.post<ResPage<User.ResUserList>>(`/user/findUserList`, {}, { loading: false });
};
