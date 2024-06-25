import { ResPage, ProjectCategory } from "@/api/interface/index";
import http from "@/api";

/**
 * @name 箱型模块
 */
// 获取产品标识卡列表
export const getProjectCategoryList = (params: ProjectCategory.ReqProjectCategoryParams) => {
  return http.post<ResPage<ProjectCategory.ResProjectCategoryList>>(`/materialCategory/findAll`, params);
};

// 新增
export const addProjectCategory = (params: ProjectCategory.ReqProjectCategoryParams) => {
  return http.post<ResPage<ProjectCategory.ResProjectCategoryList>>(`/materialCategory/add`, params);
};

// 编辑
export const editProjectCategory = (params: ProjectCategory.ReqProjectCategoryParams) => {
  return http.put<ResPage<ProjectCategory.ResProjectCategoryList>>(`/materialCategory/update`, params);
};

// 删除
export const delProjectCategory = (params: { ids: number[] }) => {
  return http.deleteBody(`/materialCategory/delete`, params);
};
