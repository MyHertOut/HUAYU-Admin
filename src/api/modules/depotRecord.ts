import { PORT4 } from "@/api/config/servicePort";
import http from "@/api";

/**
 * @name 产品模块
 */
export const getDepotRecordList = (params: any) => {
  return http.post(PORT4 + `/depotRecord/findAll`, params);
};

export const addDepotRecord = (params: any) => {
  return http.post(PORT4 + `/depotRecord/add`, params);
};

export const editDepotRecord = (params: any) => {
  return http.put(PORT4 + `/depotRecord/update`, params);
};

export const delDepotRecord = (params: { ids: number[] }) => {
  return http.deleteBody(PORT4 + `/depotRecord/delete`, params);
};

export const depotStatistics = (params: any) => {
  return http.post(PORT4 + `/depotRecord/depotStatistics`, params);
};

export const depotStorageStatistics = () => {
  return http.get(PORT4 + `/depotRecord/depotStorageStatistics`, {}, { loading: false });
};

export const exportDepotRecord = params => {
  return http.download(PORT4 + `/depotRecord/exportDepotRecord`, params);
};
