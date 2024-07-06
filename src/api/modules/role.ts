import { ResPage, Role } from "@/api/interface/index";
import { PORT4 } from "@/api/config/servicePort";
import http from "@/api";

/**
 * @name 角色模块
 */
export const getRoleList = (params: Role.ReqRoleParams) => {
  return http.post<ResPage<Role.ResRoleList>>(PORT4 + `/role/findAll`, params);
};

export const addRole = (params: Role.ReqRoleParams) => {
  return http.post<ResPage<Role.ResRoleList>>(PORT4 + `/role/add`, params);
};

export const editRole = (params: Role.ReqRoleParams) => {
  return http.put<ResPage<Role.ResRoleList>>(PORT4 + `/role/update`, params);
};

export const delRole = (params: { ids: number[] }) => {
  return http.deleteBody(PORT4 + `/role/delete`, params);
};

export const findRoleList = () => {
  return http.post<ResPage<Role.ResRoleList>>(PORT4 + `/role/findRoleList`, {}, { loading: false });
};
