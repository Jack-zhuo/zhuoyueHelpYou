const db = wx.cloud.database();
Page({
  data: {
    price: '',
    address: {
      name: '',
      phone: '',
      detail: ''
    },
    fileID: '',
    fileName: '',
    pageNum: 0,
    count: 0,
    note: '',
    array: ['单面', '双面'],
    index: 0,
    totalPrice: 2
  },
  onLoad() {

  },
  setCount(e) {
    this.setData({
      count: Number(e.detail.value),
      totalPrice: (Number(2) + (Number(this.data.pageNum) * 0.3 * Number(e.detail.value)) / (Number(this.data.index) + 1)).toFixed(2)
    })
  },
  setPageNum(e) {
    this.setData({
      pageNum: Number(e.detail.value),
      totalPrice: (Number(2) + (Number(e.detail.value) * 0.3 * Number(this.data.count)) / (Number(this.data.index) + 1)).toFixed(2)
    })
  },
  bindPickerChange(e) {
    this.setData({
      index: e.detail.value,
      totalPrice: (Number(2) + (Number(this.data.pageNum) * 0.3 * Number(this.data.count)) / (Number(e.detail.value) + 1)).toFixed(2)
    })
  },
  async upFile() {
    wx.showLoading({
      title: '正在上传中',
    })
    try {
      const res = await wx.chooseMessageFile({
        count: 1,
        type: 'file',
      })
      const filepath = res.tempFiles[0].path
      const fileName = res.tempFiles[0].name

      const res2 = await wx.cloud.uploadFile({
        cloudPath: `print/${fileName}`,
        filePath: filepath
      })
      const fileID = res2.fileID;
      this.setData({
        fileID,
        fileName
      })
      wx.hideLoading();
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: '你取消了上传',
        icon: 'none'
      })
    }

  },
  async onLoad(e) {
    if (!this.data.address.phone) await this.getAddress();
    const address = wx.getStorageSync('address');
    if (address.phone) {
      this.setData({
        address
      })
    }

  },
  async submit() {
    if (this.data.fileName === '') {
      wx.showToast({
        title: '必须上传文件',
        icon: 'none'
      })
      return
    }
    if (!this.data.pageNum) {
      wx.showToast({
        title: '必须输入页数',
        icon: 'none'
      })
      return
    }
    if (!this.data.count) {
      wx.showToast({
        title: '必须输入份数',
        icon: 'none'
      })
      return
    }


    wx.showLoading({
      title: '准备付款中',
    })

    const order = {
      name: '打印服务',
      fileID: this.data.fileID,
      note: this.data.note,
      pageNum: this.data.pageNum,
      count: this.data.count,
      bothPrint: this.data.array[this.data.index],
      fileName:this.data.fileName,

      // 订单公共部分
      userinfo: wx.getStorageSync('user').info,
      address: this.data.address,
      price: this.data.totalPrice,
      date: new Date(),
      takeOrderer: {},
      takeGoodsCode: Math.floor(Math.random() * (900)) + 100,
      status: 1,
    }

    const price = Math.round(this.data.totalPrice * 100)
    console.log(price)

    // 付款
    const res = await wx.cloud.callFunction({
      name: 'toPay',
      data: {
        goodName: `打印服务-${this.data.address.name}`,
        totalFee: price
      }
    })
    console.log(res)
    const payment = res.result.payment;
    console.log(payment)
    wx.hideLoading()
    try {
      const res2 = await wx.requestPayment({
        ...payment
      })
      wx.showToast({
        title: '付款成功',
        icon: 'none'
      })
      // 添加订单到数据库
      db.collection('orders').add({
        data: order,
        success: (res) => {
          wx.switchTab({
            url: '../order/order'
          })
        }
      });
    } catch (err) {
      console.log(err);
      wx.showToast({
        title: '付款失败',
        icon: 'none'
      })
    }

  },
  async getAddress() {
    const address = await db.collection('address').where({
      default: true,
      _openid: wx.getStorageSync('openid')
    }).get();
    this.setData({
      address: address.data[0]
    })
  },
  gotoAddress() {
    wx.setStorageSync('urlNow', 'print')
    wx.navigateTo({
      url: '../address/address',
    })
  },
  copyWeChat(){
    wx.setClipboardData({
      data: 'zyjava2020',
    })
  }
})