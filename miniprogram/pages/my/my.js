Page({
  data: {
    user: {
      info: {
        name: '三联小可爱',
        avatar: '',
        phone: ''
      },
      isTakeOrderer: false
    },

  },
  onLoad() {
    this.getInfo()
  },
  onShow() {
    this.onLoad();
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
    //  查询本地缓存中有没有info
    let user = wx.getStorageSync('user');
    if (user) {
      this.setData({
        user
      })
      return
    }
    // 查询数据库中有没有user
    const res = await wx.cloud.database().collection('user').get();
    console.log('数据库中的值', res.data[0]);
    user = res.data[0]
    if(user){
      wx.setStorageSync('user', user)
      this.setData({
        user
      })
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
  gotoTakeOrders() {
    wx.clearStorageSync()
    this.onLoad();
    if (this.data.user.isTakeOrderer) {
      wx.navigateTo({
        url: '../takeOrders/takeOrders',
      })
    } else {
      wx.showToast({
        title: '没有授权，请联系客服微信，申请接单权限。',
        icon: 'none'
      })
    }

  },
  onPullDownRefresh(){
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
})