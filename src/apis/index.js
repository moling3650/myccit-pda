import axios from 'axios'
import { Message } from 'element-ui'

axios.defaults.headers['Content-Type'] = 'application/json;charset=UTF-8'

if (!window.serverIP) {
  console.error('必须设置服务器的IP和端口')
}
const url = `http://${window.serverIP}/WebServicePDA.ashx`
const request = axios.create({
  timeout: 60000
})

// function executeSQL (sql, params) {
//   return request.post(url, {
//     query: sql,
//     queryParams: params,
//     isProcedure: false
//   }).then(res => res.data)
// }
request.interceptors.response.use(({data}) => {
  // 对响应数据做点什么
  if (!data.Result) {
    Message.error({ message: data.ExtMessage || data, center: true, duration: 3000 })
    return Promise.reject(data)
  }
  return data
}, error => {
  // 对响应错误做点什么
  Message.error({ message: error.message, center: true, duration: 3000 })
  return Promise.reject(error)
})

export default {
  fetchIP () {
    return request.post(`${url}?methodType=PDA_Main&method=GETIP`)
      .then(({obj: ip}) => ip)
  },
  login (userInfo) {
    return request.post(`${url}?methodType=PDA_Main&method=LOGIN`, userInfo)
      .then(({ExtMessage: username}) => username)
  },
  fetchStationsByEmpCode (EmpCode) {
    return request.post(`${url}?methodType=PDA_Main&method=FETCH_STATIONS_BY_EMPCODE`, {
      EmpCode
    }).then(({obj: data}) => {
      const stations = data.ds
      const options = []

      stations.map(item => {
        let ptr = options
        const values = Object.values(item)
        for (var i = 0; i < values.length; i += 2) {
          const index = ptr.findIndex(p => p.value === values[i])
          if (~index) {
            ptr = ptr[index].children
          } else {
            const node = {
              value: values[i],
              label: values[i + 1]
            }
            ptr.push(node)
            if (i + 2 < values.length) {
              node.children = []
              ptr = ptr[ptr.length - 1].children
            }
          }
        }
      })

      return options
    })
  },
  checkMainWorkOrder (workOrder, pCode) {
    return request.post(`${url}?methodType=PDA_Main&method=CHECK_MAINORDER_BY_PROCESSCODE`, {
      OrderNo: workOrder,
      ProcessCode: pCode
    }).then(({obj: data}) => data.ds.pop())
  },
  fetchStepsByFlowAndProcess (fCode, pCode) {
    return request.post(`${url}?methodType=PDA_Main&method=FETCH_STEPS_BY_FLOW_AND_PROCESS`, {
      FlowCode: fCode,
      ProcessCode: pCode
    }).then(({obj: data}) => data.ds)
  },
  checkStepValue ({step_type: type, step_id: StepId, step_name: StepName}, Val) {
    const method = (type === 'B_PreStep') ? 'CHECK_PRESTEP_BY_VAL' : 'CHECK_PROCESSSTEP_BY_VAL'
    return request.post(`${url}?methodType=PDA_Main&method=${method}`, {
      StepId,
      StepName,
      Val
    })
  },
  saveSteps (payload) {
    return request.post(`${url}?methodType=PDA_Main&method=SAVE_JOBSUBMIT`, payload)
  },
  fetchMaterialsByOrderAndStation (order, sCode) {
    return request.post(`${url}?methodType=PDA_Material&method=FETCH_MATERIALS_BY_ORDER_AND_STATION`, {
      OrderNo: order,
      StationCode: sCode
    }).then(({obj: data}) => data.ds)
  },
  checkLotNo (order, sCode, lotNo) {
    return request.post(`${url}?methodType=PDA_Material&method=CHECK_LOTNO`, {
      OrderNo: order,
      StationCode: sCode,
      LotNO: lotNo
    })
  },
  checkLotQty (order, sCode, lotNo, qty) {
    return request.post(`${url}?methodType=PDA_Material&method=CHECK_LOT_QTY`, {
      OrderNo: order,
      StationCode: sCode,
      LotNO: lotNo,
      Qty: qty
    }).then(_ => qty)
  },
  addMaterialBatch (order, pCode, sCode, eCode, lotNo, qty) {
    return request.post(`${url}?methodType=PDA_Material&method=ADD_MATERIAL_BATCH`, {
      OrderNo: order,
      ProcessCode: pCode,
      StationCode: sCode,
      EmpCode: eCode,
      LotNO: lotNo,
      Qty: qty
    })
  },
  cleaningMaterial (ids, eCode) {
    return request.post(`${url}?methodType=PDA_Material&method=DEL_MAT_WIP_SEED`, {
      IDList: ids,
      EmpCode: eCode
    })
  },
  unloadMaterial (materialId, qty, eCode) {
    return request.post(`${url}?methodType=PDA_Material&method=UP_MAT_WIP_SEED`, {
      id: materialId,
      LotQty: qty,
      EmpCode: eCode
    }).then(_ => parseFloat(qty))
  }
}
