// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db_orders = cloud.database().collection('orders')

// 云函数入口函数
exports.main = async (event, context) => {

  const res = await db_orders.orderBy("date","desc").where({
    status:Number(event.status),
    'takeOrderer._id':event.id
  }).skip(event.len).limit(5).get()
  return res
}