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
      phone: wx.getStorageSync('phone')
    })
  },

  async save() {
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
      wx.navigateBack();
    }
  },
})