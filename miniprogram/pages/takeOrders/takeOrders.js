const db = wx.cloud.database()
import {
  formatDate
} from '../../utils/formatDate'
Page({
  data: {
    orders_notake: [],
    orders_taked: [],
    orders_completed: [],
    tabList: ['正在悬赏', '正在帮助', '我帮助的'],
    tabNow: 0,
    user: {}
  },
  onLoad(options) {
    this.getOrders_notake();
  },
  // 获取正在悬赏的数据
  async getOrders_notake(e) {
    wx.showLoading({
      title: '数据加载中',
      mask: true
    })
    const res = await wx.cloud.callFunction({
      name: 'getOrders',
      data: {
        status: 1
      }
    })
    console.log(res.result.data);
    const orders_notake = res.result.data
    orders_notake.forEach(item => {
      item.date = formatDate(item.date);
    });
    this.setData({
      orders_notake
    })
    wx.hideLoading();
  },
  // 获取正在帮助的数据
  async getOrders_taked(e) {
    wx.showLoading({
      title: '数据加载中',
      mask: true
    })
    const res = await wx.cloud.callFunction({
      name: 'getOrders_taked',
      data: {
        status: 2,
        id: wx.getStorageSync('user')._id
      }
    })
    console.log(res.result.data);
    const orders_taked = res.result.data
    orders_taked.forEach(item => {
      item.date = formatDate(item.date);
    });
    this.setData({
      orders_taked
    })
    wx.hideLoading();
  },
  // 获取已完成的数据
  async getOrders_completed(e) {
    wx.showLoading({
      title: '数据加载中',
      mask: true
    })
    const res = await wx.cloud.callFunction({
      name: 'getOrders_taked',
      data: {
        status: 3,
        id: wx.getStorageSync('user')._id
      }
    })
    console.log(res.result.data);
    const orders_completed = res.result.data
    orders_completed.forEach(item => {
      item.date = formatDate(item.date);
    });
    const db_user = await db.collection('user').get();
    console.log("查询user表：", db_user)
    const user = db_user.data[0]
    this.setData({
      orders_completed,
      user
    })
    wx.hideLoading();
  },
  // 切换tab栏
  tabChange(e) {
    const component = this.selectComponent('.tab')
    const tabNow = component.data.tabNow
    this.setData({
      tabNow
    })
    if (tabNow === 0) this.getOrders_notake();
    if (tabNow === 1) this.getOrders_taked();
    if (tabNow === 2) this.getOrders_completed();
  },
  call(e) {
    const phoneNumber = e.detail.phone;
    wx.makePhoneCall({
      phoneNumber
    })
  },
  // 点击接单后执行的函数
  async take(e) {
    const id = e.detail.id
    // 调用云函数更新此订单的状态为2，并添加接单人
    const res = await wx.cloud.callFunction({
      name: 'updateOrderbyId',
      data: {
        id,
        status: 2,
        takeOrderer: wx.getStorageSync('user')
      }
    });
    if (res.result.stats.updated === 1) {
      wx.showToast({
        title: '接单成功',
        icon: 'success'
      })
      this.getOrders_notake();
    } else {
      wx.showToast({
        title: '出错了，请重试！',
        icon: 'error'
      })
    }
  },
  refresh(e) {
    console.log("eeeeeeeeee", e)
    this.getOrders_taked();
  },
  onPullDownRefresh() {
    this.onLoad()
    //隐藏loading 提示框
    wx.hideLoading();
    //隐藏导航条加载动画
    wx.hideNavigationBarLoading();
    //停止下拉刷新
    wx.stopPullDownRefresh();
  }
})