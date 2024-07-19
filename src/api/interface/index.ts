// 请求响应参数（不包含data）
export interface Result {
  code: string;
  msg: string;
}

// 请求响应参数（包含data）
export interface ResultData<T = any> extends Result {
  data: T;
}

// 分页响应参数
export interface ResPage<T> {
  list: T[];
  pageNo: number;
  pageSize: number;
  total: number;
}

// 分页请求参数
export interface ReqPage {
  pageNo: number;
  pageSize: number;
}

// 文件上传模块
export namespace Upload {
  export interface ResFileUrl {
    fileUrl: string;
  }
}

// 登录模块
export namespace Login {
  export interface ReqLoginForm {
    username: string;
    password: string;
  }
  export interface ResLogin {
    token: string;
    userInfo: any;
  }
  export interface ResAuthButtons {
    [key: string]: string[];
  }
}

// 用户管理模块
export namespace User {
  export interface ReqUserParams extends ReqPage {
    username: string;
    gender: number;
    idCard: string;
    email: string;
    address: string;
    createTime: string[];
    userStatus: number;
  }
  export interface ResUserList {
    id: string;
    headerImage: string;
    username: string;
    loginName: string;
    phoneNum: any;
    department: string;
    password: string;
    position: string;
    roles: object[];
    userStatus: number;
    createTime: string;
    updateTime: string;
  }
  export interface ResStatus {
    userLabel: string;
    userValue: number;
  }
  export interface ResGender {
    genderLabel: string;
    genderValue: number;
  }
  export interface ResDepartment {
    id: string;
    name: string;
    children?: ResDepartment[];
  }
  export interface ResRole {
    id: string;
    name: string;
    children?: ResDepartment[];
  }
}

// 产品管理模块
export namespace Project {
  export interface ReqProjectParams extends ReqPage {}
  export interface ResProjectList {
    id: number;
    materialProject: string; // 项目名册
    materialName: string; // 零件名称
    partNo: string; // 件号
    produceDate: string; // 生产日期
    batchNo: string; // 批次
    materialNum: number; // 数量
    shift: string; // 班次
    checker: string; // 检验员名称
    checkDate: string; // 检验日期
    categoryName: string;
    weight: string;
    categoryId: number; // 物品类型ID
    storage: number;
    createTime: string;
    updateTime: string;
    remark: string;
    deleteFlag: number;
    qrBatchQty: any;
    qrBatchNo: any;
    materialBelongTo: string;
  }
}

// 仓库管理模块
export namespace Depot {
  export interface ReqDepotParams extends ReqPage {}
  export interface ResDepotList {
    id: number;
    depotName: string;
    depotNo: string;
    depotTypeName: string;
    depotAddress: string;
    depotArea: string;
    depotOwner: any;
    remark: string;
    createTime: string;
    updateTime: string;
    deleteFlag: number;
  }
}

// 角色模块
export namespace Role {
  export interface ReqRoleParams extends ReqPage {}
  export interface ResRoleList {
    id: number;
    roleName: string;
    roleStatus: number;
    roleType: number;
    menuIds: any;
    createTime: string;
    updateTime: string;
    deleteFlag: number;
  }
}

// 主数据管理模块
export namespace MaterialDic {
  export interface ReqMaterialDicParams extends ReqPage {}
  export interface ResMaterialDicList {
    id: number;
    partNo: string;
    projectName: string;
    materialName: string;
    reservedAttr1: string;
    reservedAttr2: string;
    reservedAttr3: string;
    createTime: string;
    updateTime: string;
    deleteFlag: number;
  }
}
