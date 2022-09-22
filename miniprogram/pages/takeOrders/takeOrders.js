const db = wx.cloud.database()
import {
  getUser
} from '../../utils/getUser'
import {
  getDateDiff
} from '../../utils/getDateDiff'
let startX, endX;
Page({
  data: {
    orders_notake: [],
    orders_taked: [],
    orders_completed: [],
    tabList: ['正在悬赏', '正在帮助', '我帮助的'],
    tabNow: 0,
    user: {},
    name:'',
    // wechat:'',
    QRcode:''
  },
 async onLoad() {
    const user = await getUser()
    this.setData({
      user,
      name:user.realName,
      QRcode:user.QRcode
    })
    this.getOrders_notake();
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
      if (tabNow === 0) this.getOrders_notake();
      if (tabNow === 1) this.getOrders_taked();
      if (tabNow === 2) this.getOrders_completed();
    }
    if (endX - startX > 50) {
      console.log('你左滑了')
      if (tabNow === 0) return
      tabNow = tabNow - 1
      this.setData({
        tabNow
      })
      if (tabNow === 0) this.getOrders_notake();
      if (tabNow === 1) this.getOrders_taked();
      if (tabNow === 2) this.getOrders_completed();
    }
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
    const len = orders_notake.length;
     console.log('len',len)
     wx.removeTabBarBadge({index:2})
     if (len !== 0) {
      wx.setTabBarBadge({
        index: 2,
        text: len+''  
      })
     }
    orders_notake.forEach(item => {
      item.date = getDateDiff(item.date);
      item.price = Math.round(item.price*0.8) 
    });
    this.setData({
      orders_notake
    })
    console.log('dfdfdf')
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
      item.takeDate = getDateDiff(item.takeDate);
      item.price = Math.round(item.price*0.8)
    });
    this.setData({
      user,
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
      item.takeDate = getDateDiff(item.takeDate);
      item.price = Math.round(item.price*0.8)
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
  getName(e){
    const {value:name} = e.detail
    this.setData({
      name
    })
  },
  getWechat(e){
    const {value:wechat} = e.detail
    this.setData({
      wechat
    })
  },
 async uploadQRcode(){
   const chooseSrc = await wx.chooseMedia({
      count:1,
      mediaType:['image'],
      sourceType:['album'],
    })
    console.log(chooseSrc)


    // 获取后缀名
    const tempFilePath = chooseSrc.tempFiles[0].tempFilePath
    const index = tempFilePath.lastIndexOf(".")
    const suffix = tempFilePath.substr(index)

    // 上传到云数据库
    const res2 = await wx.cloud.uploadFile({
      cloudPath:'QRcode/'+new Date().getTime()+suffix,
      filePath:tempFilePath
    })
    console.log(res2)
    this.setData({
      QRcode:res2.fileID
    })
  },
 async withdraw(){
     const {balance} = this.data.user
     const {name} = this.data
     const {QRcode} = this.data

     if (!balance || balance === 0){
       wx.showToast({
         title: '收益为零，不可提现',
         icon:'none'
       })
       return
     }
     if(!name){
      wx.showToast({
        title: '名字不可以为空',
        icon:'none'
      })
      return
     }
     if(!QRcode){
      wx.showToast({
        title: '必须上传收款码',
        icon:'none'
      })
      return
     }
    const content = `确认提现吗？`
    const modalRes = await wx.showModal({
      title:'说明',
      content
    })
    if (modalRes.cancel) return

     wx.showLoading({
       title: '加载中',
     })
      // 添加或者更新姓名和收款码
     const addSrc = await wx.cloud.database().collection('user').where({
       _openid:'就是这么任性！！！！！'
     }).update({
        data:{
          realName:name,
          QRcode
        }
      })

     const queryRes = await db.collection('withdraw').where({
      isWithdraw:false
     }).get();

    //  判断是否申请过提现
     if (queryRes.data.length !== 0){
       wx.hideLoading()
        wx.showToast({
          title: '你已经申请提现，后台处理中...',
          icon:'none',
          mask:true,
          duration:2000
        })
        return
     } 

    //  把提现信息提交到数据库
     const res = await db.collection('withdraw').add({
       data:{
         user_id:this.data.user._id,
         name,
         QRcode,
         balance,
         isWithdraw:false
       }
     })
     wx.hideLoading()
     console.log(res)
     if (res.errMsg ==="collection.add:ok"){
       wx.showToast({
         title: '你的提现申请已受理，预计2小时内到账',
         icon:'none',
         duration:2000
       })
       wx.cloud.callFunction({
        name:'sendSms',
        data:{
          content:'有人提现啦',
          phone:'15922476232'
        },
        success:(res)=>{
            console.log(res)
        }
      })
     }else{
       wx.showToast({
         title: '出错了，稍后再试',
         icon:'error'
       })
     }
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
      this.setData({
        orders_taked:[]
      })
     this.getOrders_taked();
    }
    if (tabNow === 2){
      console.log('刷新了‘我帮助的’tab')
      this.setData({
        orders_completed:[]
      })
      this.getOrders_completed();
    }
   
    // //隐藏loading 提示框
    // wx.hideLoading(); 
    // //隐藏导航条加载动画 
    // wx.hideNavigationBarLoading();
    // //停止下拉刷新 
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