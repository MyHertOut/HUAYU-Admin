// import { Upload } from "@/api/interface/index";
import { ResPage, Project } from "@/api/interface/index";
import { PORT4 } from "@/api/config/servicePort";
import http from "@/api";

/**
 * @name 产品模块
 */
export const getProjectList = (params: Project.ReqProjectParams) => {
  return http.post<ResPage<Project.ResProjectList>>(PORT4 + `/material/findAll`, params);
};

export const addProject = (params: Project.ReqProjectParams) => {
  return http.post<ResPage<Project.ResProjectList>>(PORT4 + `/material/add`, params);
};

export const editProject = (params: Project.ReqProjectParams) => {
  return http.put<ResPage<Project.ResProjectList>>(PORT4 + `/material/update`, params);
};

export const delProject = (params: { ids: number[] }) => {
  return http.deleteBody(PORT4 + `/material/delete`, params);
};

export const exportExcelTemplate = () => {
  return http.download(PORT4 + `/material/exportExcelTemplate`);
};

export const exportExcel = params => {
  return http.download(PORT4 + `/material/exportExcel`, params);
};

export const importExcel = (params: FormData) => {
  return http.post(PORT4 + `/material/importExcel`, params);
};

export const checkAllPrintedInDepot = (params: { id: number }) => {
  return http.get(PORT4 + `/material/checkAllPrintedInDepot?materialId=${params.id}`);
};

export const updateMaterial = (params: any) => {
  return http.put(PORT4 + `/material/updateMaterial`, params);
};
