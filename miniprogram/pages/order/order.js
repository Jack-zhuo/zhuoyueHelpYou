const db = wx.cloud.database();
import {pay} from '../../utils/goPay' 
import {formatDate} from '../../utils/formatDate'
Page({
  data: {
    tabList: ['全部', '已付款','已接单', '已完成'],
    tabNow: 0,
    orders: {},
  },
  onLoad() {
    this.getorders();
  }, 
  onShow(){ 
    this.onLoad();
  }, 
  onPullDownRefresh(){
    this.onLoad()
     //隐藏loading 提示框
     wx.hideLoading();
     //隐藏导航条加载动画
     wx.hideNavigationBarLoading();
     //停止下拉刷新
     wx.stopPullDownRefresh();
  },
  async getorders() {
    const res = await db.collection('orders').orderBy('date', 'desc').get();

    // 格式化时间
    res.data.forEach(item => {
      const date = formatDate(item.date)
      item.date = date;
    })
    this.setData({
      orders: res.data
    })
  },
  selectTab(e) {
    console.log(e.currentTarget.dataset.index);
    const index = e.currentTarget.dataset.index;
    this.setData({
      tabNow: index
    })
  },
})