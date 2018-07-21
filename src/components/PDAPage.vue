<template>
  <div id="PDAPage">
    <p class="ip">IP: {{ ip }}</p>
    <el-row :gutter="0" style="margin: 5px 0;">
      <el-col :span="12">
        <div><span>欢迎： </span>{{ eName }}</div>
      </el-col>
    </el-row>
    <el-row :gutter="0" style="margin: 5px 0;">
      <el-col :span="12">
        <span>{{woText || '工单：'}} </span>{{ workOrder }}
      </el-col>
      <el-col :span="8" :offset="4">
        <el-button size="mini" icon="el-icon-refresh" type="success" @click="workOrder = ''">{{btnText || '重输主工单'}}</el-button>
      </el-col>
    </el-row>
    <main>
      <el-cascader
        :options="stationOpts"
        placeholder="请先选择工站"
        size="mini"
        clearable
        filterable
        style="width: 100%; margin-bottom: 5px;"
        @change="handleStationChange"
      />
      <el-input v-show="tabName ==='first'" v-model="inputValue" @keyup.enter.native="handleEnter" :placeholder="placeholder" size="mini"/>
      <el-input v-show="tabName ==='second'" v-model="inputValue2" @keyup.enter.native="handleEnter" :placeholder="placeholder2" size="mini"/>
      <el-tabs type="border-card"  v-model="tabName" style="margin-top: 5px;">
        <el-tab-pane :label="tabPaneLabels[0] || '数据采集'" name="first">
          <el-button-group>
            <el-button size="mini" type="danger" icon="el-icon-arrow-left" @click="rollback">{{btnGroupTexts1[0] || '后退'}}</el-button>
            <el-button size="mini" type="primary" @click="saveStepsToLocal">{{btnGroupTexts1[1] || '保存'}}<i class="el-icon-upload el-icon--right"></i></el-button>
          </el-button-group>

          <el-table :data="steps" style="width: 100%" :row-class-name="tableRowClassName">
            <el-table-column prop="step_name" :label="columnLabels1[0] || '属性'"/>
            <el-table-column prop="step_value" :label="columnLabels1[1] || '值'"/>
          </el-table>
        </el-tab-pane>
        <el-tab-pane :label="tabPaneLabels[1] || '投料'" name="second">
          <el-button-group>
            <el-button size="mini" :disabled="!subOrder" type="warning" icon="el-icon-remove-outline" @click="unloadMaterial">{{btnGroupTexts2[0] || '卸料'}}</el-button>
            <el-button size="mini" :disabled="!subOrder" type="danger" @click="cleaningMaterials">{{btnGroupTexts2[1] || '清料'}}<i class="el-icon-delete el-icon--right"></i></el-button>
          </el-button-group>
          <el-table :data="materials" style="width: 100%;font-size: 12px" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="30"/>
            <el-table-column :label="columnLabels2[0] || '物料'" width="140" align="center">
              <template slot-scope="scope">
                <p>{{scope.row.mat_code}}</p>
                <p>{{scope.row.p_name}}</p>
              </template>
            </el-table-column>
            <el-table-column prop="lot_no" :label="columnLabels2[1] || '批次'" width="80"/>
            <el-table-column prop="lot_qty" :label="columnLabels2[2] || '数量'"/>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </main>
    <el-dialog title="登录"
      :visible.sync="dialogVisible"
      :fullscreen="true"
      :show-close="false"
      :close-on-press-escape="false">
      <el-form :model="form" label-position="top" >
        <el-form-item label="账号">
          <el-input v-model="form.username" placeholder="请输入账号" auto-complete="off"/>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" placeholder="请输入密码" auto-complete="off" type="password" @keyup.enter="login"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="login">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import apis from '@/apis'

export default {
  name: 'PDAPage',
  computed: {
    placeholder () {
      const label = this.steps.length ? this.steps[this.stepIndex].step_name : '主工单'
      return `请输入${label}然后回车`
    },
    placeholder2 () {
      const label = this.subOrder ? '批次号' : '主工单'
      return `请输入${label}然后回车`
    },
    sfc () {
      const step = this.steps.find(s => s.step_code === 'sfc')
      return step ? (step.step_value || '') : ''
    },
    qty () {
      const step = this.steps.find(s => s.step_code === 'Qty')
      return step ? (step.step_value || '-1') : '-1'
    }
  },
  data () {
    return {
      woText: window.woText,
      btnText: window.btnText,
      tabPaneLabels: window.tabPaneLabels || [],
      btnGroupTexts1: window.btnGroupTexts1 || [],
      btnGroupTexts2: window.btnGroupTexts2 || [],
      columnLabels1: window.columnLabels1 || [],
      columnLabels2: window.columnLabels2 || [],
      dialogVisible: true,
      form: {
        username: '',
        password: ''
      },
      ip: '',
      tabName: 'first',
      inputValue: '',
      inputValue2: '',
      workOrder: '',
      subOrder: '',
      eCode: undefined,
      eName: '',
      pCode: undefined,
      sCode: undefined,
      stationOpts: [],
      steps: [],
      stepIndex: 0,
      isChecking: false,
      materials: [],
      selectedMaterials: []
    }
  },
  watch: {
    subOrder (val) {
      if (val) {
        apis.fetchMaterialsByOrderAndStation(val, this.sCode).then(materials => {
          this.materials = materials
        })
      } else {
        this.materials = []
      }
    },
    workOrder (val) {
      if (!val) {
        this.steps = []
        this.materials = []
        this.selectedMaterials = []
        this.subOrder = ''
        this.inputValue = ''
        this.inputValue2 = ''
        this.isChecking = false
      }
    }
  },
  methods: {
    cleaningMaterials () {
      if (this.selectedMaterials.length === 0) {
        return void this.$message.error({ message: '先选择物料', center: true, duration: 3000 })
      }
      this.$confirm('此操作将清除该物料, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        customClass: 'w300',
        type: 'warning'
      }).then(_ => {
        const ids = this.selectedMaterials.map(m => m.id)
        apis.cleaningMaterial(ids, this.eCode).then(_ => {
          this.materials = this.materials.filter(m => ids.find(id => id === m.id) === null)
        })
      })
    },
    unloadMaterial () {
      if (this.selectedMaterials.length !== 1) {
        return void this.$message.error({ message: '只允许卸载单个物料', center: true, duration: 3000 })
      }
      this.$prompt('', '请输入卸料数量', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^\d+(\.\d+)?$/,
        inputErrorMessage: '输入格式不正确',
        customClass: 'w300'
      }).then(({value}) => apis.unloadMaterial(this.selectedMaterials[0].id, value, this.eCode))
        .then(qty => this.$set(this.selectedMaterials[0], 'lot_qty', this.selectedMaterials[0].lot_qty - qty))
    },
    handleSelectionChange (val) {
      this.selectedMaterials = val
    },
    saveStepsToLocal () {
      if (!this.sfc) {
        return void this.$message.error({ message: '缺少条码', center: true, duration: 3000 })
      }
      localStorage.setItem(`${this.workOrder}_${this.pCode}_${this.sfc}`, JSON.stringify(this.steps))
    },
    tableRowClassName ({row, rowIndex}) {
      return rowIndex === this.stepIndex ? 'current-row' : ''
    },
    rollback () {
      this.steps[this.stepIndex].step_value = ''
      if (this.stepIndex > 0) {
        --this.stepIndex
        this.inputValue = this.steps[this.stepIndex].step_value
      }
    },
    handleEnter () {
      if (this.isChecking) {
        return void this.$message.error({ message: '正在校验中...', center: true, duration: 3000 })
      }
      const isEmpty = (this.tabName === 'first' && !this.inputValue) || (this.tabName === 'second' && !this.inputValue2)
      if (isEmpty) {
        return void this.$message.error({ message: '输入值不能为空', center: true, duration: 3000 })
      }
      if (!this.sCode) {
        return void this.$message.error({ message: '请先选择工站', center: true, duration: 3000 })
      }
      this.isChecking = true
      if (!this.workOrder) {
        // 录入主工单
        const workOrder = this.tabName === 'first' ? this.inputValue : this.inputValue2
        apis.checkMainWorkOrder(workOrder, this.pCode)
          .then(data => {
            this.workOrder = data.main_order
            this.subOrder = data.order_no
            return data.flow_code
          })
          .then(fCode => apis.fetchStepsByFlowAndProcess(fCode, this.pCode))
          .then(steps => {
            this.steps = steps
            this.stepIndex = 0
            this.inputValue = ''
            this.inputValue2 = ''
            this.isChecking = false
          })
          .catch(_ => {
            this.isChecking = false
          })
      } else if (this.tabName === 'first') {
        // 数据采集
        if (this.stepIndex === this.steps.length - 1) {
          // 提交所有的数据
          this.$set(this.steps[this.stepIndex], 'step_value', this.inputValue)
          this._submitSteps()
            .catch(_ => {
              this.isChecking = false
            })
        } else {
          // 校验正在录入的数据
          this._checkStepValue()
            .then(_ => {
              this.$set(this.steps[this.stepIndex], 'step_value', this.inputValue)
              if (this.steps[this.stepIndex].step_code === 'sfc') {
                const steps = localStorage.getItem(`${this.workOrder}_${this.pCode}_${this.sfc}`)
                if (steps) {
                  this.steps = JSON.parse(steps)
                }
              } else if (this.sfc) {
                localStorage.setItem(`${this.workOrder}_${this.pCode}_${this.sfc}`, JSON.stringify(this.steps))
              }
              this.stepIndex++
              this.inputValue = ''
            })
            .catch(_ => {
              this.isChecking = false
            })
        }
      } else {
        // 投料
        apis.checkLotNo(this.subOrder, this.sCode, this.inputValue2)
          .then(_ => this.$prompt('', '请输入投料数量', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputPattern: /^\d+(\.\d+)?$/,
            inputErrorMessage: '输入格式不正确',
            customClass: 'w300'
          }))
          .then(({ value }) => apis.checkLotQty(this.subOrder, this.sCode, this.inputValue2, value))
          .then(qty => apis.addMaterialBatch(this.subOrder, this.pCode, this.sCode, this.eCode, this.inputValue2, qty))
          .then(_ => apis.fetchMaterialsByOrderAndStation(this.subOrder, this.sCode))
          .then(materials => {
            this.materials = materials
          })
          .catch(() => {
            this.isChecking = false
            // this.$message.info({ message: '录入失败', center: true, duration: 3000 })
          })
      }
    },
    _clearSteps () {
      this.steps.map(step => {
        step.step_value = ''
      })
      this.stepIndex = 0
      this.isChecking = false
    },
    _submitSteps () {
      const payload = {
        Emp_Code: this.eCode,
        Process_Code: this.pCode,
        Station_Code: this.sCode,
        Order_No: this.workOrder,
        BarcodeNo: this.sfc,
        Material_OrderNo: '',
        MachineNo: '',
        Qty: this.qty,
        Steps: JSON.parse(JSON.stringify(this.steps))
      }
      return apis.saveSteps(payload).then(_ => {
        this.$message.success({ message: '提交成功', center: true, duration: 3000 })
        localStorage.removeItem(`${this.workOrder}_${this.pCode}_${this.sfc}`)
        this._clearSteps()
      })
    },
    _checkStepValue () {
      const step = this.steps[this.stepIndex]
      return apis.checkStepValue(step, this.inputValue).then(_ => {
        this.isChecking = false
      })
    },
    handleStationChange ([pCode, sCode]) {
      this.pCode = pCode
      this.sCode = sCode
      this.workOrder = ''
    },
    _showDetail () {
      this.eCode = this.form.username
      apis.fetchStationsByEmpCode(this.eCode).then(opts => {
        this.stationOpts = opts
        this.dialogVisible = false
      })
    },
    login () {
      apis.login({...this.form}).then(eName => {
        this.eName = eName
        this._showDetail()
      })
    }
  },
  created () {
    apis.fetchIP().then(ip => {
      this.ip = ip
    })
  }
}
</script>

<style lang="css" scoped>
.el-table .current-row {
  background: #f0f9eb;
}
.el-table p {
  margin: 1px auto;
  text-align: center;
}

.ip {
  position: fixed;
  top: -10px;
  right: 10px;
  z-index: 9999;
}
</style>
