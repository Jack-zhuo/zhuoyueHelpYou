// 云函数代码
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  const res = await cloud.cloudPay.unifiedOrder({
    "body" : event.goodName,
    "outTradeNo" : "15922476232"+new Date().getTime(),
    "spbillCreateIp" : "127.0.0.1",
    "subMchId" : "1629655829",
    "totalFee" : event.totalFee,
    "envId": "zhuoyuebang-1gx979jw039db365",
    "functionName": "pay_cb"
  })
  return res
}