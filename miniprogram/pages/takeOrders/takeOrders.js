const db = wx.cloud.database()
import {
  getUser
} from '../../utils/getUser'
import {
  getDateDiff
} from '../../utils/getDateDiff'
Page({
  data: {
    orders_notake: [],
    orders_taked: [],
    orders_completed: [],
    tabList: ['正在悬赏', '正在帮助', '我帮助的'],
    tabNow: 0,
    user: {}
  },

  onLoad() {

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
    const orders_notake = res.result.data

    orders_notake.forEach(item => {
      item.date = getDateDiff(item.date);
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
    const user = await getUser();
    const res = await wx.cloud.callFunction({
      name: 'getOrders_taked',
      data: {
        status: 2,
        id: user._id
      }
    })
    console.log(res.result.data);
    const orders_taked = res.result.data
    orders_taked.forEach(item => {
      item.date = getDateDiff(item.date);
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

    const user = await getUser();
    const res = await wx.cloud.callFunction({
      name: 'getOrders_completed',
      data: {
        status: 3,
        id: user._id,
        len:this.data.orders_completed.length
      }
    })
    const orders_completed = res.result.data
    
    // 判断是否加载完数据
    if(orders_completed.length === 0){
      wx.showToast({
        title: '已加载完所有订单',
        icon:'none'
      })
      return
    }

    // 格式化时间
    orders_completed.forEach(item => {
      item.date = getDateDiff(item.date);
    });

    this.setData({
      orders_completed:this.data.orders_completed.concat(orders_completed),
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
  // 拨打手机号
  async call(e) {
    const user = await getUser();
    if (user.isTakeOrderer) {
      const phoneNumber = e.detail.phone;
      wx.makePhoneCall({
        phoneNumber
      })
    } else {
      const res = await wx.showModal({
        title: '你不是接单员，无法查看手机号。',
        content: '你要申请成为 接单员 吗？',
      })
      if (res.confirm) {
        console.log('点击了确定')
        wx.navigateTo({
          url: '../applyTakeOrderer/applyTakeOrderer',
        })
      } else if (res.cancel) {
        console.log('点击了取消')
      }
    }

  },
  // 点击接单后执行的函数
  async take(e) {
    console.log(e.detail.item._openid)
    const {_openid} = e.detail.item
    const user = await getUser();
    if (_openid === user._openid){
      wx.showToast({
        title: '你不能接自己下的单',
        icon:'none',
        duration:2000
      })
      return
    }
    
   const resTip = await wx.showModal({
      'title':'确认接单吗？'
    })
    if(resTip.cancel) return

    wx.showLoading({
      title: '接单中...',
    })
    if (user.isTakeOrderer) {
      const id = e.detail.item._id
      // 调用云函数更新此订单的状态为2，并添加接单人
      const res = await wx.cloud.callFunction({
        name: 'updateOrderbyId',
        data: {
          id,
          status: 2,
          takeOrderer: user
        }
      });
      console.log(res)
      wx.hideLoading();
      //    判断订单是否被抢
      try {
        if (res.result.stats.updated === 1) {
          this.getOrders_notake();
         await wx.showToast({
            title: '接单成功',
            icon: 'success'
          })
        }
      } catch (error) {
        wx.hideLoading();
        wx.showToast({
          title: '订单被抢了',
          icon: 'none'
        })
      }



    } else {
      wx.hideLoading();
      wx.showModal({
        title: '你不是接单员，无法接单。',
        content: '你要申请成为 接单员 吗？',
        success: (res) => {
          if (res.confirm) {
            console.log('点击了确定')
            wx.navigateTo({
              url: '../applyTakeOrderer/applyTakeOrderer',
            })
          } else if (res.cancel) {
            console.log('点击了取消')
          }
        },
      })
    }

  },
  refresh(e) {
    console.log("eeeeeeeeee", e)
    this.getOrders_taked();
  },
  onPullDownRefresh() {
    const tabNow = this.data.tabNow
    if (tabNow === 0){
      console.log('刷新了‘正在悬赏’tab')
      this.setData({
        orders_notake:[]
      })
     this.getOrders_notake();
    }
    if (tabNow === 1){
      console.log('刷新了‘正在帮助’tab')
    }
    if (tabNow === 2){
      console.log('刷新了‘我帮助的’tab')
      this.setData({
        orders_completed:[]
      })
      this.getOrders_completed();
    }
   
    //隐藏loading 提示框
    wx.hideLoading(); 
    //隐藏导航条加载动画 
    wx.hideNavigationBarLoading();
    //停止下拉刷新
    wx.stopPullDownRefresh();
  },
  onReachBottom() {
    const tabNow = this.data.tabNow
    if (tabNow === 0){
      console.log('我触底了0')
    }
    if (tabNow === 1){
      console.log('我触底了1')
    }
    if (tabNow === 2){
      this.getOrders_completed();
    }
    
  }
})