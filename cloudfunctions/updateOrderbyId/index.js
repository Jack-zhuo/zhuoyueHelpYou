// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db_orders = cloud.database().collection("orders")

// 云函数入口函数
exports.main = async (event, context) => {
 const res1 = await db_orders.doc(event.id).get();
 const status = res1.data.status;
 if (status === 1){
  const res2 = await db_orders.doc(event.id).update({
    data:{
      status:event.status,
      takeOrderer:event.takeOrderer
    }
  });
  return res2
 }
 return '订单被抢'
}