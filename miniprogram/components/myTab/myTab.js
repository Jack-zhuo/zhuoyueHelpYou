Component({
  properties:{
    tabList:{
      type:Array,
      value:['1','2']
    },
  },
  data:{
    tabNow:0
  }, 
  methods:{
    selectTab(e){
       const tabNow = e.currentTarget.dataset.index;
       this.setData({
         tabNow
       })
       this.triggerEvent('tabChange')
    }
  }
})