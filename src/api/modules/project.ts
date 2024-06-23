import { ResPage, Project } from "@/api/interface/index";
import http from "@/api";

/**
 * @name 产品模块
 */
// 获取产品标识卡列表
export const getProjectList = (params: Project.ReqProjectParams) => {
  return http.post<ResPage<Project.ResProjectList>>(`/material/findAll`, params);
};

// 新增
export const addProject = (params: Project.ReqProjectParams) => {
  return http.post<ResPage<Project.ResProjectList>>(`/material/add`, params);
};

// 编辑
export const editProject = (params: Project.ReqProjectParams) => {
  return http.put<ResPage<Project.ResProjectList>>(`/material/update`, params);
};

// 删除
export const delProject = (params: { ids: number[] }) => {
  return http.deleteBody(`/material/delete`, params);
};
