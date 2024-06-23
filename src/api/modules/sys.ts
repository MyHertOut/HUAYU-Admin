import { ResPage, Role, Project } from "@/api/interface/index";
import http from "@/api";
import boxType from "@/assets/json/boxType.json";
/**
 * @name 系统模块
 */

export const getBoxTypeList = (params: Project.ReqProjectParams) => {
  return boxType;
  return http.post<ResPage<Project.ResProjectList>>(`/material/findAll`, params);
};

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
