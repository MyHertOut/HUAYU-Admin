import { ResPage, Role } from "@/api/interface/index";
import http from "@/api";

/**
 * @name 角色模块
 */
// 获取产品标识卡列表
export const getRoleList = (params: Role.ReqRoleParams) => {
  return http.post<ResPage<Role.ResRoleList>>(`/role/findAll`, params);
};

// 新增
export const addRole = (params: Role.ReqRoleParams) => {
  return http.post<ResPage<Role.ResRoleList>>(`/role/add`, params);
};

// 编辑
export const editRole = (params: Role.ReqRoleParams) => {
  return http.put<ResPage<Role.ResRoleList>>(`/role/update`, params);
};

// 删除
export const delRole = (params: { ids: number[] }) => {
  return http.deleteBody(`/role/delete`, params);
};
