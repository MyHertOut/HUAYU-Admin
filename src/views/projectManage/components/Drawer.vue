<template>
  <el-drawer v-model="drawerVisible" :destroy-on-close="true" size="450px" :title="`${drawerProps.title}标识卡`">
    <el-form
      ref="ruleFormRef"
      label-width="100px"
      label-suffix=" :"
      :rules="rules"
      :disabled="drawerProps.isView"
      :model="drawerProps.row"
      :hide-required-asterisk="drawerProps.isView"
    >
      <el-form-item label="件号" prop="partNo">
        <el-select
          v-model="drawerProps.row!.partNo"
          filterable
          allow-create
          default-first-option
          :reserve-keyword="false"
          placeholder="输入查询，未找到的亦可创建"
          clearable
        >
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="项目名称" prop="materialProject">
        <el-input
          v-model="drawerProps.row!.materialProject"
          :placeholder="isPartNoHave ? '项目名称由【件号】查出' : '请输入项目名称'"
          clearable
          :disabled="isPartNoHave"
        ></el-input>
      </el-form-item>
      <el-form-item label="零件名称" prop="materialName">
        <el-input
          v-model="drawerProps.row!.materialName"
          :placeholder="isPartNoHave ? '零件名称由【件号】查出' : '请输入零件名称'"
          clearable
          :disabled="isPartNoHave"
        ></el-input>
      </el-form-item>
      <el-form-item label="生产日期" prop="produceDate">
        <el-input v-model="drawerProps.row!.produceDate" placeholder="默认当天" clearable disabled></el-input>
      </el-form-item>
      <el-form-item label="批次" prop="batchNo">
        <el-input v-model="drawerProps.row!.batchNo" placeholder="请输入批次号" clearable></el-input>
      </el-form-item>
      <el-form-item label="数量" prop="materialNum">
        <el-input-number style="width: 100%" v-model="drawerProps.row!.materialNum" placeholder="请输入数量" clearable />
      </el-form-item>
      <el-form-item label="班次" prop="shift">
        <el-select v-model="drawerProps.row!.shift" placeholder="请选择班次" clearable>
          <el-option label="A" value="A" />
          <el-option label="B" value="B" />
        </el-select>
      </el-form-item>
      <el-form-item label="检验员" prop="checker">
        <el-input v-model="drawerProps.row!.checker" placeholder="请输入检验员" clearable></el-input>
      </el-form-item>
      <el-form-item label="检验日期" prop="checkDate">
        <el-input v-model="drawerProps.row!.checkDate" placeholder="默认当天" clearable disabled></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">取消</el-button>
      <el-button v-show="!drawerProps.isView" type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts" name="UserDrawer">
import { ref, reactive, computed } from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { Project } from "@/api/interface";
import moment from "moment";

const options = [
  {
    value: "500109-00257-34",
    label: "500109-00257-34"
  },
  {
    value: "500109-00257-32",
    label: "500109-00257-32"
  },
  {
    value: "500109-00257-36",
    label: "500109-00257-36"
  }
];
const isPartNoHave = computed(() => {
  let partNo = drawerProps.value.row.partNo;
  if (!partNo) {
    return true;
  } else {
    let index = options.findIndex(e => e.label === partNo);
    return index !== -1 ? true : false;
  }
});

const rules = reactive({
  partNo: [{ required: true, message: "请选择或创建件号" }],
  materialProject: [{ required: true, message: "请输入项目名称" }],
  materialName: [{ required: true, message: "请输入零件名称" }],
  batchNo: [{ required: true, message: "请输入批次号" }],
  materialNum: [{ required: true, message: "请输入数量" }],
  shift: [{ required: true, message: "请选择班次" }],
  checker: [{ required: true, message: "请输入检验员" }]
});

interface DrawerProps {
  title: string;
  isView: boolean;
  row: Partial<Project.ResProjectList>;
  api?: (params: any) => Promise<any>;
  getTableList?: () => void;
}

const drawerVisible = ref(false);
const drawerProps = ref<DrawerProps>({
  isView: false,
  title: "",
  row: {}
});

// 接收父组件传过来的参数
const acceptParams = (params: DrawerProps) => {
  drawerProps.value = params;
  if (drawerProps.value.title === "新增") {
    drawerProps.value.row.produceDate = moment(new Date()).format("M/D/YYYY");
    drawerProps.value.row.checkDate = moment(new Date()).format("M/D/YYYY");
  } else if (drawerProps.value.title === "编辑") {
    drawerProps.value.row.produceDate = moment(drawerProps.value.row.produceDate).format("M/D/YYYY");
    drawerProps.value.row.checkDate = moment(drawerProps.value.row.checkDate).format("M/D/YYYY");
  }
  drawerVisible.value = true;
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<FormInstance>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      await drawerProps.value.api!(drawerProps.value.row);
      ElMessage.success({ message: `${drawerProps.value.title}标识卡成功！` });
      drawerProps.value.getTableList!();
      drawerVisible.value = false;
    } catch (error) {
      console.log(error);
    }
  });
};

defineExpose({
  acceptParams
});
</script>
