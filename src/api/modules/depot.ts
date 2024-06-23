import { ResPage, Depot } from "@/api/interface/index";
import http from "@/api";

/**
 * @name 仓库模块
 */
// 获取产品标识卡列表
export const getDepotList = (params: Depot.ReqDepotParams) => {
  return http.post<ResPage<Depot.ResDepotList>>(`/depot/findAll`, params);
};

// 新增
export const addDepot = (params: Depot.ReqDepotParams) => {
  return http.post<ResPage<Depot.ResDepotList>>(`/depot/add`, params);
};

// 编辑
export const editDepot = (params: Depot.ReqDepotParams) => {
  return http.put<ResPage<Depot.ResDepotList>>(`/depot/update`, params);
};

// 删除
export const delDepot = (params: { ids: number[] }) => {
  return http.deleteBody(`/depot/delete`, params);
};
