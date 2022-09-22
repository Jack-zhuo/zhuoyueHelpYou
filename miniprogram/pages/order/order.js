const db = wx.cloud.database();
import {
  getDateDiff
} from '../../utils/getDateDiff';
let startX, endX;
Page({
  data: {
    tabList: ['待接单', '已接单', '已完成'],
    tabNow: 0,
    orders: [],
    orders_paid: [],
    orders_taked: [],
    orders_completed: []
  },
  onLoad() {
    this.getorders_paid();
  },
  // 页面滑动
  touchStart(e) {
    startX = e.touches[0].pageX
    console.log(startX)
  },
  touchEnd(e) {
    endX = e.changedTouches[0].pageX
    console.log(endX)
    this.slide()
  },
  slide() {
    let tabNow = this.data.tabNow
    if (startX - endX > 50) {
      console.log('你右滑了')
      if (tabNow === 2) return
      tabNow = tabNow + 1
      this.setData({
        tabNow
      })
      if (tabNow === 0) this.getorders_paid();
      if (tabNow === 1) this.getorders_taked();
      if (tabNow === 2) this.getorders_completed();
    }
    if (endX - startX > 50) {
      console.log('你左滑了')
      if (tabNow === 0) return
      tabNow = tabNow - 1
      this.setData({
        tabNow
      })
      if (tabNow === 0) this.getorders_paid();
      if (tabNow === 1) this.getorders_taked();
      if (tabNow === 2) this.getorders_completed();
    }
  },
  // 已付款
  async getorders_paid() {

    wx.showLoading({
      title: '数据加载中',
      mask: true
    })

    const res = await db.collection('orders').orderBy('date', 'desc').where({
      status: 1
    }).get();
    console.log('测试，已付款的数据：', res);
    // 格式化时间
    res.data.forEach(item => {
      const date = getDateDiff(item.date)
      item.date = date;
    })

    this.setData({
      orders_paid: res.data
    })
    wx.hideLoading()
  },
  // 已接单
  async getorders_taked() {

    wx.showLoading({
      title: '数据加载中',
      mask: true
    })

    const res = await db.collection('orders').orderBy('date', 'desc').where({
      status: 2
    }).get();


    // 格式化时间
    res.data.forEach(item => {
      const date = getDateDiff(item.date)
      item.date = date;
    })

    this.setData({
      orders_taked: res.data
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
      console.log('tab0触底了');
    }
    if (tabNow === 1) {
      console.log('tab1触底了');
    }
    if (tabNow === 2) {
      this.getorders_completed()
    }

  },
  onPullDownRefresh() {
    const tabNow = this.data.tabNow
    if (tabNow === 0) {
      console.log('走到这里了吗')
      this.getorders_paid();
    }
    if (tabNow === 1) {
      this.getorders_taked();
    }
    if (tabNow === 2) {
      this.setData({
        orders_completed: []
      })
      this.getorders_completed()
    }
    wx.stopPullDownRefresh()
  },
})