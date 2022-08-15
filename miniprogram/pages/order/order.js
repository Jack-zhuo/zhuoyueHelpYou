const db = wx.cloud.database();
import {
  getDateDiff
} from '../../utils/getDateDiff';
Page({
  data: {
    tabList: ['已付款', '已接单', '已完成'],
    tabNow: 0,
    orders: [],
    orders_paid: [],
    orders_taked: [],
    orders_completed: []
  },
  onLoad() {
    this.getorders_paid();
  },
  onShow() {
    this.onLoad();
  },
  onPullDownRefresh() {
    this.onLoad()
    //隐藏loading 提示框
    wx.hideLoading();
    //隐藏导航条加载动画
    wx.hideNavigationBarLoading();
    //停止下拉刷新
    wx.stopPullDownRefresh();
  },

  // 已付款
  async getorders_paid() {

    wx.showLoading({
      title: '数据加载中',
      mask: true
    })

    const res = await db.collection('orders').orderBy('date', 'desc').skip(this.data.orders_paid.length).limit(5).where({
      status: 1
    }).get();

    console.log(res);
    if (res.data.length === 0) {
      wx.hideLoading()
      wx.showToast({
        title: '已加载完全部数据',
        icon: 'none'
      })
      return
    }


    // 格式化时间
    res.data.forEach(item => {
      const date = getDateDiff(item.date)
      item.date = date;
    })

    this.setData({
      // tailCount_paid:res.data.length,
      orders_paid: this.data.orders_paid.concat(res.data)
    })
    wx.hideLoading()
  },

  // 已接单
  async getorders_taked() {
    
    wx.showLoading({
      title: '数据加载中',
      mask: true
    })

    const res = await db.collection('orders').orderBy('date', 'desc').skip(this.data.orders_taked.length).limit(5).where({
      status: 2
    }).get();
    
     if(res.data.length === 0){
        wx.hideLoading()
        wx.showToast({
          title: '已加载完全部数据',
          icon: 'none'
        })
        return
     }

    // 格式化时间
    res.data.forEach(item => {
      const date = getDateDiff(item.date)
      item.date = date;
    })

    this.setData({
      orders_taked: this.data.orders_taked.concat(res.data)
    })
    wx.hideLoading()
  },

  // 已完成
  async getorders_completed() {

    wx.showLoading({
      title: '数据加载中',
      mask: true
    })

    const i = this.data.orders_completed.length
    const res = await db.collection('orders').orderBy('date', 'desc').skip(i).limit(5).where({
      status: 3
    }).get();

    // 单次请求的条数
    console.log(res.data.length)
    if (res.data.length === 0) {
      wx.hideLoading()
      wx.showToast({
        title: '已加载完全部数据',
        icon: 'none'
      })
      return
    }

    // 格式化时间
    res.data.forEach(item => {
      const date = getDateDiff(item.date)
      item.date = date;
    })

    this.setData({
      orders_completed: this.data.orders_completed.concat(res.data)
    })
    wx.hideLoading()
  },
  // 切换tab栏
  selectTab(e) {
    const tabNow = e.currentTarget.dataset.index;
    this.setData({
      tabNow
    })
    if (tabNow === 0) this.getorders_paid();
    if (tabNow === 1) this.getorders_taked();
    if (tabNow === 2) this.getorders_completed();
  },
  onReachBottom() {
    const tabNow = this.data.tabNow
    if (tabNow === 0) {
      this.getorders_paid();
    }
    if (tabNow === 1) {
      this.getorders_taked();
    }
    if (tabNow === 2) {
      this.getorders_completed()
    }

  }
})