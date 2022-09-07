Page({
  data: {
    user: {
      info: {
        name: '三联小可爱',
        avatar: '',
        phone: ''
      },
      isTakeOrderer: false,
    },
    isAdmin: false
  },
  onLoad() {
    this.getInfo()
  },
  onShow() {
    this.onLoad();
  },
  async completeAfterFiveDay() {
    wx.showLoading({
      title: '处理中',
    })
    const res1 = await wx.cloud.callFunction({
      name: 'getOrders',
      data: {
        status: 2
      }
    })
    const orders = res1.result.data
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const deltaTime = new Date().getTime() - new Date(order.date).getTime()
      console.log(deltaTime)
      let minute = 1000 * 60;
      let hour = minute * 60;
      if (deltaTime < hour * 48) continue

      const price = order.price
      const takeOrderer_id = order.takeOrderer._id
      const id = order._id

      const res1 = await wx.cloud.callFunction({
        name: 'updateBalance',
        data: {
          user_id: takeOrderer_id,
          balance: price
        }
      })
      if (res1.result.stats.updated === 1) {
        const res2 = await wx.cloud.callFunction({
          name: 'updateOrderbyIdToCompleted',
          data: {
            id,
          }
        })
      }
    }

    wx.hideLoading()
  },
  setInfo() {
    wx.navigateTo({
      url: '../setInfo/setInfo',
    })
  },
  gotoAddress() {
    wx.navigateTo({
      url: '../address/address',
    })
  },
  openService() {
    wx.setClipboardData({
      data: 'zyjava2020',
      success: () => {
        wx.showToast({
          title: '复制成功！',
          icon: 'none'
        })
      }
    })
  },
  async getInfo() {
    wx.showLoading({
      title: '数据加载中',
    })

    // 查询数据库中有没有user
    const res = await wx.cloud.database().collection('user').get();
    const user = res.data[0]
    if (user) {
      wx.setStorageSync('user', user)
      this.setData({
        user,
        isAdmin: user._openid === 'o1qHG4sFXxAuC_8V8m40Rq-F5JcQ'
      })
      wx.hideLoading();
      return
    }

    //初始化新用户头像，昵称和手机号
    user = {
      info: {
        name: '三联小可爱',
        avatar: `cloud://zhuoyuebang-1gx979jw039db365.7a68-zhuoyuebang-1gx979jw039db365-1313189613/defaultAvatar/${Math.floor(Math.random()*10)}.png`,
        phone: ''
      },
      isTakeOrderer: false
    }

    // 将info分别存在data，本地缓存，和数据库中
    this.setData({
      user
    })
    wx.setStorageSync('user', user)
    wx.cloud.database().collection('user').add({
      data: {
        ...user
      }
    })
    wx.hideLoading();
  },

  gotoAboutUs() {
    wx.navigateTo({
      url: '../aboutus/aboutus',
    })
  },
  gotoComplain(e) {
    console.log(e.detail.path)
    console.log(e.detail.query)
  },
  gotoOrderManagement() {
    wx.navigateTo({
      url: '../orderManagement/orderManagement',
    })
  },
  gotoWithdraw() {
    wx.navigateTo({
      url: '../withdraw/withdraw',
    })
  },
  gotoCheckOrderer() {
    wx.navigateTo({
      url: '../checkOrderer/checkOrderer',
    })
  },
  // gotoTakeOrders() {
  //   wx.clearStorageSync()
  //   this.getInfo()
  //   wx.navigateTo({ 
  //     url: '../takeOrders/takeOrders',
  //   })
  // },
  onPullDownRefresh() {
    wx.clearStorage({
      success: (res) => {
        this.onLoad()
        //隐藏loading 提示框
        wx.hideLoading();
        //隐藏导航条加载动画
        wx.hideNavigationBarLoading();
        //停止下拉刷新
        wx.stopPullDownRefresh();
      },
    })

  },
  // async openSubscribe(){
  //  const res = await wx.requestSubscribeMessage({
  //     tmplIds: ['O7k6yTWkhS5SMCWTMz4Vx3wziOCDY__JWUuNLF7HPbc'],
  //   })
  //   console.log(res)
  // }
})