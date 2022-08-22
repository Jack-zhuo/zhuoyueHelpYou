// 云函数代码
//申请退款
const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async (event, context) => {
  const res = await cloud.cloudPay.refund({
    "out_refund_no": event.refundOrder, //商户退款单号
    "out_trade_no": event.trade, //订单号
    "nonce_str": "" + new Date().getTime(), //随机字符串
    "sub_mch_id": "1629655829", //子商户号
    "total_fee": event.price, //订单金额
    "refund_fee": event.price, //申请退款金额	
  })
  return res
}