import { ResPage, Role } from "@/api/interface/index";
import http from "@/api";

/**
 * @name 角色模块
 */
export const getRoleList = (params: Role.ReqRoleParams) => {
  return http.post<ResPage<Role.ResRoleList>>(`/role/findAll`, params);
};

export const addRole = (params: Role.ReqRoleParams) => {
  return http.post<ResPage<Role.ResRoleList>>(`/role/add`, params);
};

export const editRole = (params: Role.ReqRoleParams) => {
  return http.put<ResPage<Role.ResRoleList>>(`/role/update`, params);
};

export const delRole = (params: { ids: number[] }) => {
  return http.deleteBody(`/role/delete`, params);
};

export const findRoleList = () => {
  return http.post<ResPage<Role.ResRoleList>>(`/role/findRoleList`, {}, { loading: false });
};
