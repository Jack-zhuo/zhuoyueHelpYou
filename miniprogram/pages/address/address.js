const db = wx.cloud.database();
Page({
  data: {
    addresses: {}
  },
  onLoad() {
    this.getAddress();
  },
  onShow() { 
    this.getAddress();
  },
  async getAddress() {
    const addresses = await db.collection('address').where({
      _openid: wx.getStorageSync('openid')
    }).get();
    this.setData({
      addresses: addresses.data
    })
  },
  addAddress() {
    wx.navigateTo({
      url: '../addAddress/addAddress',
    })
  },
  async delete(e) {
    console.log(e)
    const id = e.currentTarget.dataset.id;
    console.log(id);

    const res = await db.collection('address').doc(id).remove();
    console.log(res);
    this.getAddress();
  },
  async radioChange(e){
     const id = e.detail.value;
    const res = await db.collection('address').where({
       _openid: wx.getStorageSync('openid')
     }).update({
       data:{
         default:false
       }
     })
     if (res.errMsg === 'collection.update:ok'){
       db.collection('address').doc(id).update({
         data:{
           default:true
         },
         success:(res)=>{
           console.log(res);
           this.getAddress();
         }
       })
     }
  },
  onPullDownRefresh(){
    this.onLoad();  
     //隐藏loading 提示框
     wx.hideLoading();
     //隐藏导航条加载动画
     wx.hideNavigationBarLoading();
     //停止下拉刷新
     wx.stopPullDownRefresh();
  },
})