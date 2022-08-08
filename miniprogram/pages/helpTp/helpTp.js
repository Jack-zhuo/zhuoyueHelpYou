const db = wx.cloud.database();
Page({
  data: {
    array: ['菜鸟驿站', '自提柜', '顺丰'],
    index: 0,
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
    placeholderCon: '请输入取件码...',
    price: 3,
    address: {
      name: '',
      phone: '',
      detail: ''
    },
    openid: '',
    code: ''
  },
  onLoad() {
    this.getAddress();
    this.getOpenid();
  },
  onShow() {
    this.onLoad();
  },
  getOpenid() {
    const openid = wx.getStorageSync('openid');
    this.setData({
      openid
    })
  },
  addAddress(){
    wx.navigateTo({
      url: '../addAddress/addAddress',
    })
  },
  getUserProfile(){
    wx.showLoading({ title:'加载中' });
    wx.getUserProfile({
      desc: 'desc',
      success: (result) => {
        
        this.setData({
          info: result
        })
        wx.setStorageSync('info', result);
        wx.cloud.callFunction({
          name: 'login',
          success: (res) => {
            //  获取openid
            console.log(res.result.openid);
            const openid = res.result.openid;
            wx.setStorageSync('openid', openid);
            this.setData({
              openid
            })
            this.getAddress();
          }
        })
      },
      complete:()=>{
        wx.hideLoading();
      }
    })
    
  },
  async getAddress() {
    const address = await db.collection('address').where({
      default: true,
      _openid: wx.getStorageSync('openid')
    }).get();
    console.log(address.data[0]);
    this.setData({
      address: address.data[0]
    })
  },
  cleanHolder() {
    this.setData({
      placeholderCon: ''
    })
  },
  addHolder() {
    this.setData({
      placeholderCon: '请输入取件码...'
    })
  },
  gotoAddress() {
    wx.navigateTo({
      url: '../address/address',
    })
  },
  bindPickerChange(e) {
    console.log(e.detail.value);
    this.setData({
      index: e.detail.value
    })
  },
  selectTab(e) {
    console.log(e);
    const size = e.currentTarget.dataset.tip
    wx.showToast({
      title: size.tips,
      icon: 'none'
    })
    this.setData({
      isName: size.name,
      price: size.price
    })
  },
 async goPay() {
   wx.showLoading();
    if ( !this.data.openid ){
      wx.showToast({
        title: '请先登录',
        icon:'none'
      })
      return
    }
    if ( !this.data.address.phone ){
      wx.showToast({
        title: '请先添加地址',
        icon:'none'
      })
      return
    }
    if ( !this.data.code ){
      wx.showToast({
        title: '请输入取件码',
        icon:'none'
      })
      return
    }
    const order = {
       name:'代取快递',
       address:this.data.address,
       merchant:this.data.array[this.data.index],
       size:this.data.size.name,
       price:this.data.price,
       date:new Date(),
       status:0
    }
    // 添加订单到数据库
   const res = await db.collection('orders').add({
      data:order
    });
    console.log("添加订单到数据库",res);
    const id = res._id;
    wx.cloud.callFunction({
      name: 'toPay',
      data: {
        goodName: '代取快递',
        totalFee: this.data.price
      },
      success: res => {
        wx.hideLoading();
        const payment = res.result.payment
        wx.requestPayment({
          ...payment,
          success(res) {
            console.log('pay success', res);
            db.collection('orders').doc(id).update({
              data:{
                status:1
              },
              success:(res)=>{
                 wx.navigateTo({
                   url: '../order/order',
                 })
              }
            });
          },
          fail(err) {
            console.log(err);
            wx.showToast({
              title:'付款失败',
              icon:'none'
            })
          }
        })
      },
      fail: console.error,
    })
  }
})