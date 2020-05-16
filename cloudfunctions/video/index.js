// 云函数入口文件
const cloud = require('wx-server-sdk')
const tcbRouter = require("tcb-router")

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: 'zc-weibo-0spfn'
})
let db = cloud.database();
const MAX_lIMIT = 100;

let videoCollection = db.collection('video')

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const app = new tcbRouter({
    event
  });
  app.router("list", async (ctx, next) => {
    const {
      keyword,
      start,
      count
    } = event
    let w = {}
    if (keyword.trim() != '') {
      // 将查询条件放在对象中 
      w = {
        // 根据用户数据的内容查询 , 以 正则匹配的 keyword 结果为 查询条件
        title: db.RegExp({
          regexp: keyword,
          opions: 'i'
        })
      }

    }
    // 分页查询，从第一个索引值开始 查询多少条数据
    let videoList = await videoCollection
      .where(w)     // 条件查询  根据某个字段查询，参数是一个对象；对象为查询条件
      .skip(start)   // 从集合中第几个索引值开始查新
      .limit(count)  // 查询多少条数据
      .orderBy('createTime', 'desc')  // 根据那个字段开始排序
      .get()         // 获取数据 返回promise对象
      .then((res) => {  // 查询成功后  res 接收查询结果
        return res.data
      })
    ctx.body = videoList
  })

  app.router("count", async (ctx, next) => {
    // 分页查询，从第一个索引值开始 查询多少条数据
    let num = await videoCollection.count().then((res) => {
      return res
    })
    ctx.body = num
  })


  return app.serve()
}