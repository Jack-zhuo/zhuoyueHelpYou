import {getDateDiff} from "../../utils/getDateDiff"
Page({
  data: {
      id:'',
      order:{}
  },
  onLoad(options) {
    console.log(options);
    this.setData({
      id:options.id
    })
    this.getOrder();
  },
  async getOrder(){

    const res = await wx.cloud.callFunction({
      name:'getOrderById',
      data:{
        _id:this.data.id
      }
    })
    const order = res.result.data[0]
     order.date = getDateDiff(order.date)
    this.setData({
      order:res.result.data[0]
    })
  }
})