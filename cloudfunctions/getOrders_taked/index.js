// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db_orders = cloud.database().collection('orders')

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const res = await db_orders.orderBy("takeDate","desc").where({
    status:Number(event.status),
    'takeOrderer._id':event.id 
  }).get()
  return res
}