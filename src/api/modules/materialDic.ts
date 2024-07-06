import { ResPage, MaterialDic } from "@/api/interface/index";
import { PORT4 } from "@/api/config/servicePort";
import http from "@/api";

/**
 * @name 主数据模块
 */
export const getMaterialDicList = (params: MaterialDic.ReqMaterialDicParams) => {
  return http.post<ResPage<MaterialDic.ResMaterialDicList>>(PORT4 + `/materialDictionary/findAll`, params);
};

export const addMaterialDic = (params: MaterialDic.ReqMaterialDicParams) => {
  return http.post<ResPage<MaterialDic.ResMaterialDicList>>(PORT4 + `/materialDictionary/add`, params);
};

export const editMaterialDic = (params: MaterialDic.ReqMaterialDicParams) => {
  return http.put<ResPage<MaterialDic.ResMaterialDicList>>(PORT4 + `/materialDictionary/update`, params);
};

export const delMaterialDic = (params: { ids: number[] }) => {
  return http.deleteBody(PORT4 + `/materialDictionary/delete`, params);
};

export const findMaterialDictionaryList = () => {
  return http.post<ResPage<MaterialDic.ResMaterialDicList>>(
    PORT4 + `/materialDictionary/findMaterialDictionaryList`,
    {},
    { loading: false }
  );
};
