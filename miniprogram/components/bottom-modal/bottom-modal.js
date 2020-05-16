// components/bottom-modal/bottom-modal.js
Component({

  properties: {
    modalShow: {
      type: Boolean,
      value: false  // 底部弹出成隐藏
    }
  },
  options: {
    // 默认情况下组件有样式隔离的效果  isolated 隔离  shared 页面影响组件；组件影响样式
    styleIsolation: 'apply-shared',  // 允许页面样式影响组件内部的样式,自定义组件样式不影响页面
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },


  data: {

  },

  methods: {
    onClose() {
      this.setData({
        modalShow: false
      })
    }
  },
  // 组件声命周期
  lifetimes: {
    // 使用组件的时候触发
    ready() {
    }
  }
})
