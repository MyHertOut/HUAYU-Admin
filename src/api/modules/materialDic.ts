import { ResPage, MaterialDic } from "@/api/interface/index";
import http from "@/api";

/**
 * @name 主数据模块
 */
export const getMaterialDicList = (params: MaterialDic.ReqMaterialDicParams) => {
  return http.post<ResPage<MaterialDic.ResMaterialDicList>>(`/materialDictionary/findAll`, params);
};

export const addMaterialDic = (params: MaterialDic.ReqMaterialDicParams) => {
  return http.post<ResPage<MaterialDic.ResMaterialDicList>>(`/materialDictionary/add`, params);
};

export const editMaterialDic = (params: MaterialDic.ReqMaterialDicParams) => {
  return http.put<ResPage<MaterialDic.ResMaterialDicList>>(`/materialDictionary/update`, params);
};

export const delMaterialDic = (params: { ids: number[] }) => {
  return http.deleteBody(`/materialDictionary/delete`, params);
};

export const findMaterialDictionaryList = () => {
  return http.post<ResPage<MaterialDic.ResMaterialDicList>>(
    `/materialDictionary/findMaterialDictionaryList`,
    {},
    { loading: false }
  );
};
