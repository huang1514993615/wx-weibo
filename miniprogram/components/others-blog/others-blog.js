Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blog: {
      type: Object
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    isShow: true,
    content: '',
    // talikContent: '',
    // loginShow: false,
    // modalShow: false,
    // isGoods: false
  },
  observers: {
    'blog': function () {
      if (this.data.blog.content.length > 60) {
        this.setData({
          content: this.data.blog.content.slice(0, 58) + '...'
        })
      } else {
        this.setData({
          content: this.data.blog.content
        })
      }
    }
  },
  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    dontShow() {
      this.setData({
        isShow: false
      })
    },
    onPreview(event) {
      let { index, imgs } = event.currentTarget.dataset;
      wx.previewImage({
        current: imgs[index],
        urls: imgs
      });
    }
  }
})
