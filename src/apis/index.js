// import axios from 'axios'

// const request = axios.create({
//   timeout: 15000
// })

export default {
  login (userInfo) {
    return Promise.resolve(userInfo.username && userInfo.password)
  },
  fetchStationsByEmpCode (empCode) {
    const stations = [
      {process_code: 'PK001', process_name: '电芯与支架组装', station_code: 'DKRK001', station_name: '电池块组装工位01'},
      {process_code: 'PK001', process_name: '电芯与支架组装', station_code: 'DKRK002', station_name: '电池块组装工位02'},
      {process_code: 'PK001', process_name: '电芯与支架组装', station_code: 'DKRK003', station_name: '电池块组装工位03'},
      {process_code: 'PK001', process_name: '电芯与支架组装', station_code: 'PK001', station_name: '自动线电池块组装工位01'}
    ]
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

    return Promise.resolve(options)
  }
}
