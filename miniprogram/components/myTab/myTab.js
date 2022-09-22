Component({
  properties:{
    tabList:{
      type:Array,
      value:['1','2']
    },
    tabNow:{
      type:Number,
      value:1
    }
  },
  // data:{
  //   tabNow:Number(0)
  // }, 
  methods:{
    selectTab(e){
       const tabNow = e.currentTarget.dataset.index;
       this.setData({
         tabNow
       })
       this.triggerEvent('tabChange',tabNow)
    }
  }
})