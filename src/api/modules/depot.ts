import { ResPage, Depot } from "@/api/interface/index";
import { PORT4 } from "@/api/config/servicePort";
import http from "@/api";

/**
 * @name 仓库模块
 */
export const getDepotList = (params: Depot.ReqDepotParams) => {
  return http.post<ResPage<Depot.ResDepotList>>(PORT4 + `/depot/findAll`, params);
};

export const addDepot = (params: Depot.ReqDepotParams) => {
  return http.post<ResPage<Depot.ResDepotList>>(PORT4 + `/depot/add`, params);
};

export const editDepot = (params: Depot.ReqDepotParams) => {
  return http.put<ResPage<Depot.ResDepotList>>(PORT4 + `/depot/update`, params);
};

export const delDepot = (params: { ids: number[] }) => {
  return http.deleteBody(PORT4 + `/depot/delete`, params);
};

export const findDepotList = () => {
  return http.post<ResPage<Depot.ResDepotList>>(PORT4 + `/depot/findDepotList`, {}, { loading: false });
};
