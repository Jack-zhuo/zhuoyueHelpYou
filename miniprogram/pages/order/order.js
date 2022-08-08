const db = wx.cloud.database();
import '../../utils/formatDate'
Page({
  data: {
    tabList: ['全部', '待付款', '已付款', '已完成'],
    tabNow: 0,
    orders_total: {},
    avatarUrl: '',
    openid:''
  },
  onLoad() {
   const openid = wx.getStorageSync('openid');
   console.log('openid',openid)
   this.setData({
    openid
  })
   if(openid){
    
    this.getorders_total();
    this.getUserInfo();
   }else{
     this.getUserProfile();
   }
    
   
  },
  getUserInfo(){
    wx.showLoading();
    const info = wx.getStorageSync('info');
    this.setData({
      avatarUrl: info.userInfo.avatarUrl
    })
    wx.hideLoading();
  },
  async getorders_total() {
    const openid = wx.getStorageSync('openid');
    console.log(openid);
    const res = await db.collection('orders').where({
      _openid: !!openid ? openid : '15922476232'
    }).orderBy('date', 'desc').get();

    // 格式化时间
    res.data.forEach(item => {
      const date = this.getFormatIime(item.date);
      item.date = date;
    })

    this.setData({
      orders_total: res.data
    })
  },
  selectTab(e) {
    console.log(e.currentTarget.dataset.index);
    const index = e.currentTarget.dataset.index;
    this.setData({
      tabNow: index
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
            this.getUserInfo();
            this.getorders_total();
          }
        })
      },
      complete:()=>{
        wx.hideLoading();
      }
    })
    
  },
  gopay(e) {
    wx.showLoading({
      title: '正在准备付款',
    })
    const {
      order
    } = e.currentTarget.dataset;
    const id = order._id;
    wx.cloud.callFunction({
      name: 'toPay',
      data: {
        goodName: '代取快递',
        totalFee: order.price * 100
      },
      success: res => {
        const payment = res.result.payment
        wx.requestPayment({
          ...payment,
          success: (res) => {
            console.log('pay success', res);
            db.collection('orders').doc(id).update({
              data: {
                status: 1
              }
            });
            wx.hideLoading();
            wx.showToast({
              title: '付款成功~ 请耐心等待哦~~',
              icon:'none'
            })
            this.getOrders();
          },
          fail(err) {
            console.error('pay fail', err)
          }
        })
      },
      fail: console.error,
    })
  },
  call(e){
    console.log(e);
    wx.makePhoneCall({
      phoneNumber:'15922476232'
    })
  },
  getFormatIime(d) {
    const date = new Date(d)
    //获取年份
    var YY = date.getFullYear();
    //获取月份
    var MM = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    //获取日期
    var DD = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
    //获取小时
    var hh = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours());
    //获取分
    var mm = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
    ///获取秒
    var ss = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
    //返回时间格式： 2020-11-09 13:14:52
    return YY + '-' + MM + '-' + DD + ' ' + hh + ':' + mm + ':' + ss;
  }
})