// 云函数入口文件
const rp = require('request-promise')
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('支付结果回调结果：',event);
 const res = await cloud.database().collection('orders').doc(event.outTradeNo).update({
    data:{
      status:1
    }
  })
  return {
    errcode:0,
    errmsg:''
  }
}