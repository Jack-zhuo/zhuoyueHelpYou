const db = wx.cloud.database();
Page({
  data: {
    name: '',
    phone: '',
    detail: '',
    isDefault: true, 
  },
  onLoad() {
    this.setPhone();
  },
  setPhone() {
    this.setData({
      phone: wx.getStorageSync('user').info.phone
    })
  },

  async save() {
   // 设置正则表达式的手机号码格式 规则 ^起点 $终点 1第一位数是必为1  [3-9]第二位数可取3-9的数字  \d{9} 匹配9位数字 
   var reg = /^1[3-9]\d{9}$/
    if(!this.data.name){
      wx.showToast({
        title: '姓名不能为空',
        icon:'none'
      })
      return
    }
    if(!reg.test(this.data.phone)){
      wx.showToast({
        title: '手机号输入错误，请检查',
        icon:'none'
      })
      return
    }
    if(!this.data.detail){
      wx.showToast({
        title: '详细地址不能为空',
        icon:'none'
      })
      return
    }

    const address = {
      name: this.data.name,
      phone: this.data.phone,
      detail: this.data.detail,
      default: this.data.isDefault
    }
    if (this.data.isDefault) {
      const res = await db.collection('address').where({
        default: true,
        _openid: wx.getStorageSync('openid')
      }).update({
        data:{
           default:false
        }
      });
    }

    const res = await db.collection('address').add({
      data: address
    });
    console.log(res);
    if(res.errMsg === 'collection.add:ok'){
      wx.showToast({
        title: '添加成功',
      });
      wx.redirectTo({
        url: '../address/address',
      });
    }
  },
})