// 云函数入口文件
const cloud = require('wx-server-sdk')
const tcbRouter = require("tcb-router")

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: 'zc-weibo-0spfn'
})
let db = cloud.database();
const MAX_lIMIT = 100;

let blogCollection = db.collection('blog')

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const app = new tcbRouter({
    event
  });
  // 所有的博客
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
        content: db.RegExp({
          regexp: keyword,
          opions: 'i'
        })
      }
    }
    // 分页查询，从第一个索引值开始 查询多少条数据
    let bloglist = await blogCollection
      .where(w)     // 条件查询  根据某个字段查询，参数是一个对象；对象为查询条件
      .skip(start)   // 从集合中第几个索引值开始查新
      .limit(count)  // 查询多少条数据
      .orderBy('createTime', 'desc')  // 根据那个字段开始排序
      .get()         // 获取数据 返回promise对象
      .then((res) => {  // 查询成功后  res 接收查询结果
        return res.data
      })
    ctx.body = bloglist
  })
  // 博客详情
  app.router("detail", async (ctx, next) => {
    // 博客详情数据
    let detail = await blogCollection.where({
      _id: event.blogId
    }).get().then((res) => {
      return res.data
    })
    // 查询评论信息 
    let countResult = await db.collection('blog-comment').count();
    let total = countResult.total;
    let commentList = {
      data: []
    }
    if (total > 0) {
      let tasks = []
      const batchTimes = Math.ceil(total / MAX_lIMIT);
      for (var i = 0; i < batchTimes; i++) {
        let promise = db.collection('blog-comment').skip(i * MAX_lIMIT)
          .limit(MAX_lIMIT)
          .where({
            blogId: event.blogId,
          })
          .orderBy('createTime', "desc")
          .get()
        tasks.push(promise);
      }
      if (tasks.length > 0) {
        commentList = (await Promise.all(tasks)).reduce((acc, cur) => {
          return {
            data: acc.data.concat(cur.data)
          }
        })
      }
    }
    ctx.body = {
      detail,
      commentList
    }
  })
  // 博客的评论
  app.router("updateTalk", async (ctx, next) => {
    const {
      comment,
      _id
    } = event
    // 分页查询，从第一个索引值开始 查询多少条数据
    let comments = await blogCollection.where({
      _id
    }).update({
      data: {
        comment: comment
      }
    })
    ctx.body = comments
  })
  // 更改博客内容
  app.router("updataContent", async (ctx, next) => {
    const {
      content,
      _id
    } = event
    // 分页查询，从第一个索引值开始 查询多少条数据
    let res = await blogCollection.where({
      _id
    }).update({
      data: {
        content
      }
    })
    ctx.body = res
  })
  // 博客是否点赞
  app.router("giveGoods", async (ctx, next) => {
    const {
      goods,
      _id
    } = event
    // 分页查询，从第一个索引值开始 查询多少条数据
    let res = await blogCollection.where({
      _id
    }).update({
      data: {
        goods: goods
      }
    })
    ctx.body = res
  })
  // 用户一共有多少博客
  app.router("mineCount", async (ctx, next) => {
    // 分页查询，从第一个索引值开始 查询多少条数据
    let _openid = event.openid
    let num = await blogCollection.where({
      _openid
    }).count().then((res) => {
      return res
    })
    ctx.body = num
  })
  // 一共有多少博客
  app.router("count", async (ctx, next) => {
    // 分页查询，从第一个索引值开始 查询多少条数据
    let num = await blogCollection.count().then((res) => {
      return res
    })
    ctx.body = num
  })
  // 用户bolg的数量
  app.router("myCount", async (ctx, next) => {
    let openid = event.openid
    let w = {}
    if (openid.trim() != '') {
      // 将查询条件放在对象中 
      w = {
        // 根据用户数据的内容查询 , 以 正则匹配的 openid 结果为 查询条件
        _openid: db.RegExp({
          regexp: openid,
          opions: 'i'
        })
      }
    }

    let myNum = await blogCollection
      .where(w)
      .count()
      .then((res) => {
        return res
      })
    ctx.body = myNum
  })
  // 用户的博客
  app.router("myBlog", async (ctx, next) => {
    let openid = event.openid
    let start = event.start
    let count = event.count
    let w = {}
    if (openid.trim() != '') {
      // 将查询条件放在对象中 
      w = {
        // 根据用户数据的内容查询 , 以 正则匹配的 keyword 结果为 查询条件
        _openid: db.RegExp({
          regexp: openid,
          opions: 'i'
        })
      }
    }
    let myCount = await blogCollection
      .where(w)     // 条件查询  根据某个字段查询，参数是一个对象；对象为查询条件
      .skip(start)   // 从集合中第几个索引值开始查新
      .limit(count)  // 查询多少条数据
      .orderBy('createTime', 'desc')  // 根据那个字段开始排序
      .get()         // 获取数据 返回promise对象
      .then((res) => {  // 查询成功后  res 接收查询结果
        return res.data
      })
    ctx.body = myCount
  })
  // 删除用户的博客
  app.router("deleteMineBlog", async (ctx, next) => {
    let _id = event._id

    let blogRes = await blogCollection
      .where({
        _id
      })     // 条件查询  根据某个字段查询，参数是一个对象；对象为查询条件
      .remove()
      .then(console.log)
      .catch(console.error)
      
    let commentRes = await db.collection('blog-comment')
      .where({
        blogId:_id
      })     // 条件查询  根据某个字段查询，参数是一个对象；对象为查询条件
      .remove()
      .then(console.log)
      .catch(console.error)

    ctx.body = {
      blogRes,
      commentRes
    }
  })

  return app.serve()
}