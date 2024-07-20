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

export const getDepotLocation = (params: any) => {
  return http.post(PORT4 + `/depotLocation/findAll`, params);
};

export const findDepotLocationList = (params: any) => {
  return http.post(PORT4 + `/depotLocation/findDepotLocationList`, params, { loading: false });
};

export const delDepotLocation = (params: { ids: number[] }) => {
  return http.deleteBody(PORT4 + `/depotLocation/delete`, params);
};

export const findDepotStorages = (params: any) => {
  return http.post(PORT4 + `/depotStorage/findDepotStorages`, params);
};

export const exportDepotStorage = params => {
  return http.download(PORT4 + `/depotStorage/exportDepotStorage`, params);
};

export const updateMaterialLocation = (params: any) => {
  return http.put(PORT4 + `/depotStorage/updateMaterialLocation`, params);
};
