import { ResPage, User } from "@/api/interface/index";
import http from "@/api";

/**
 * @name 用户管理模块
 */
// 获取用户列表
export const getUserList = (params: User.ReqUserParams) => {
  return http.post<ResPage<User.ResUserList>>(`/user/findAll`, params);
};

// 新增用户
export const addUser = (params: User.ReqUserParams) => {
  return http.post(`/user/add`, params);
};

// 编辑用户
export const editUser = (params: User.ReqUserParams) => {
  return http.post(`/user/update`, params);
};

// 删除用户
export const delUser = (params: { ids: number[] }) => {
  return http.deleteBody(`/user/delete`, params);
};
