const db = wx.cloud.database();
Component({
  properties: {

    address: {
      type: Object,
      value: {
        name: '卓越',
        phone: '111111111111111',
        detail: '地方多'
      }
    }
  },
  data: {
    // tab栏
    tabList: ['代取快递', '万能跑腿', '打印服务'],
    tabNow: 0,
    // 快递商家
    array: ['菜鸟驿站', '自提柜', '顺丰'],
    index: 0,
    // 尺寸大小
    size: [{
      name: '小件',
      tips: '小于书本，3元',
      price: 3
    }, {
      name: '中件',
      tips: '小于鞋盒，6元',
      price: 6
    }, {
      name: '大件',
      tips: '小于泡面箱，9元',
      price: 9
    }, {
      name: '超大件',
      tips: '大于泡面箱，18元',
      price: 18
    }, ],
    isName: '小件',
    // 取件码
    placeholderCon: '请输入取件码...',
    // 价格
    price: 3,
    // 地址
    address: {
      name: '',
      phone: '',
      detail: ''
    },
    // 取件码
    takeMsg: '',
    // 备注
    note: '',
  },
  methods: {
    
  }
})