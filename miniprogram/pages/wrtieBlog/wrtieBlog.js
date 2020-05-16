const MAX_WORDS_NUM = 140; // 表示输入文字最大的个数
const MAX_IMG_NUM = 9; // 最大上传图片的数量
let context = '' // 表示输入框中内容
let app = getApp();
let userInfo = ""
const db = wx.cloud.database();
Page({
  data: {
    modalShow: false,  // 控制底部弹出层显示隐藏
    wordsNum: "字数： " + 0,
    footerBottom: 0,   // 表示底部元素固定定位大小
    images: [],  // 表示用户选择的图片集合
    selectPhoto: true, //  表示选择图片是否显示
  },
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    wx.showLoading({
      title: '加载中....',
    });
    wx.getUserInfo({
      success: function (res) {
        userInfo = res.userInfo
      }
    })
    console.log(userInfo, 2);
    wx.hideLoading();
  },
  onInput(event) {
    context = event.detail.value;
    let wordsNum = event.detail.cursor;
    if (wordsNum == MAX_WORDS_NUM) {
      wordsNum = '最大字数为' + MAX_WORDS_NUM
    }
    this.setData({
      wordsNum: "字数： " + wordsNum,
    })
  },
  onFocus(event) {
    // 模拟器获取的高度为0
    this.setData({
      footerBottom: event.detail.height    // 键盘的高度
    })
  },
  onBlur() {
    // 失去焦点 底部固定定位 0
    this.setData({
      footerBottom: 0,
    })
  },
  // 处理上传图片
  onChooseImage() {
    // 因为选择图片是多次；每次数量是不一定的，总数做多选择为9 ---> 求还能选择几张图片
    let max = MAX_IMG_NUM - this.data.images.length  // 总数 - 已经选择个数= 还能选择多少张

    wx.chooseImage({
      count: max, // 最多可以选择的图片张数
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          images: this.data.images.concat(res.tempFilePaths)
        })

        // 控制选择图片的显示隐藏的效果
        // 还能在选几张  当还能选择的图片数量小雨等于0时候  -->选择图片隐藏 selectPhoto false 否则显示
        max = MAX_IMG_NUM - this.data.images.length;
        this.setData({
          selectPhoto: max <= 0 ? false : true,
        })
      },
      fail: () => {

      }
    })
  },
  // 点击x 删除图片
  onDelImage(event) {
    this.data.images.splice(event.target.dataset.index, 1)
    this.setData({
      images: this.data.images
    })

    // 当删除图片后；显示选择图片效果
    if (this.data.images.length <= MAX_IMG_NUM) {
      this.setData({
        selectPhoto: true
      })
    }
  },

  // 点击图片实现预览图片效果
  onPreviewImage(event) {
    var imgsrc = event.target.dataset.imgsrc;
    // 作用 配置预览图片 注意：在真机上，苹果手机上 有多少张图片的显示  安卓手机没有
    wx.previewImage({
      current: imgsrc, // 当前显示的图片；为点击的图片
      urls: this.data.images,  // 预览图片集合
    });
  },

  // 发布
  send() {
    // 数据 ---> 云数据库中
    // 云数据库中内容 --> 内容 图片FILEIF oppenid 昵称  头像  博客的创建时间
    // 图片--->云存储中 --->返回fileId 云文件id
    if (context.trim() == "") {
      wx.showModal({
        title: '请输入内容',
        content: '',
      });
    }

    wx.showLoading({
      title: '发布中...',
      mask: true, // 蒙层
    });

    let promiseArr = []
    let fileIds = []
    // 1 图片上传到云存储中 注意每次只能上传一个文件,当按名字冲突时候，后上传的会把之前图片覆盖
    // ---->注意：上传到云存储值；执行的是多个异步  ----> 等所有的异步执行完毕，获取fileid 数据 --->怎么可以知道所有的异步执行完毕？--->Promise.all
    this.data.images.forEach(imgsrc => {

      let p = new Promise((resove, reject) => {
        // 文件扩展名增正则 匹配 .jpg .jpeg .png .xxxx
        let suffix = /\.\w+$/.exec(imgsrc)[0]
        wx.cloud.uploadFile({
          cloudPath: 'blog/' + Date.now() + '-' + Math.random() * 1000000 + suffix, // 文件在云存储中地址
          filePath: imgsrc,
          success: (res) => {
            fileIds = fileIds.concat(res.fileID)
            // 上传成功时
            resove()
          },
          fail: () => { reject() }
        })
      })
      promiseArr.push(p)
    });
    // 等所有图片都上传到云存储中完毕时候;
    Promise.all(promiseArr).then((res) => {
      db.collection('blog').add({
        data: {
          ...userInfo,
          content: context,
          img: fileIds,
          share: [],
          comment: [],
          goods: [],
          createTime: db.serverDate()   // 服务器时间  服务器时间比客户端时间准
        }
      }).then((res) => {
        wx.hideLoading();
        wx.showToast({
          title: '发布成功',
        });
        // 发布成功后-->调到发现页 --> 并让发现也刷新
        wx.navigateBack();
        const pages = getCurrentPages();  // 获取页面栈 在栈中可以获取返回页面的；页面对象；---> 可以调用这个页面中的方法
        // pages[0] 是 blog 页面对象 
        pages[0].setData({
          blogList: []  // 先清空列表 在获取博客列表
        })
        pages[0].loadBlogList()  // 在一个页面中执行另一个页面中的方法

      }).catch((res) => {
        wx.hideLoading();
        wx.showToast({
          title: '发布失败',
        });
      })
    })

  }
})