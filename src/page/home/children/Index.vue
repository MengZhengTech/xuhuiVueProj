<template>
    <div class="fullScreen">
        <BodyContent :showBottomPadding="true">
            <div class="container" slot="content">
              <!-- 首页banner -->
                <swiper loop auto :aspect-ratio="350/800">
                    <swiper-item v-for="(item,index) in homeBannerAry" :key="index" class="p-img-center">
                        <img :src="item.path" alt="#" width="100%" :onerror="defaultSwiper">
                    </swiper-item>
                </swiper>
                <Cell class="index-title" is-link title="新人风采" :link="{name:'Rookies',params:{name:'新人风采'}}"></Cell>
                <ul class="flexbox p-employeeShowList">
                    <li
                      v-for="(item,index) in filterEmp"
                      :key="index"
                    >
                        <img :src="item.path" alt="#" :onerror="setThumbpath(item,index)" width="100" style="height:100px;width: 100px;">
                        <span>{{item.name}}</span>
                    </li>
                </ul>
                <Cell class="index-title" is-link title="新闻快讯" :link="{name:'News',params:{name:'新闻快讯'}}"></Cell>
                <panel :list="newsList" :type="type" @on-img-error="onImgError" @on-click-item="getNewsDetail"></panel>
                <Cell class="index-title" title="公司体系"></Cell>
                <grid :cols="3" class="p-company-sys-content">
                    <grid-item v-for="(item,index) in companySys" :key="index"
                     :label="item.name" class="p-company-sys-item"
                     :link="item.link?item.link:''">
                        <i slot="icon" class="fa p-company-sys-icon" :class="[item.icon,item.isActive?'p-icon-active':'']"></i>
                        <span class="p-company-sys-eName">{{item.eName}}</span>
                    </grid-item>
                </grid>
            </div>
        </BodyContent>
        <!-- 新闻详情 -->
        <popup height="100%" v-model="showNewsDetail">
            <x-header :left-options="{showBack: false}" style="width:100%;position:absolute;left:0;top:0;z-index:100;">
                {{curNewsTitle}}
                <a slot="right" href="javascript:;" @click="closeNewsDetail"><i class="fs18 fa fa-close"></i></a>
            </x-header>
            <BodyContent :showBottomPadding="false" style="padding:0 10px;background-color: #fff;">
                <div slot="content" v-html="newsDetailHTML" style="overflow: hidden;background-color:#fff;">
                </div>
            </BodyContent>
        </popup>
    </div>
</template>

<script>
  import { Swiper,SwiperItem,Flexbox, FlexboxItem,Panel,Cell, Grid, GridItem, GroupTitle, Popup,XHeader } from 'vux';
  import BodyContent from "@/components/content/BodyContent";
  import apiConfig from '../../../server/apiConfig';
  import globalData from '../../../server/globalData';
  import defaultAvatar from '../../../assets/images/avatar/errorAvatar';
  import axios from 'axios';
  export default {
      data(){
          return {
              homeBannerAry: [], // 首页轮播图
              appNewsList: [], // 首页新闻列表
              appEmpList: [], // 首页新人展示
              loading: false, // 是否处于加载中
              defaultNewsImg: 'this.src="' + require('../../../assets/images/avatar/BatMan.png') + '"',
              defaultSwiper: 'this.src="' + require('../../../assets/images/projLogo/noPic.png') + '"',
              type: '1',
              showNewsDetail: false,
              newsDetailHTML: '',
              curNewsTitle: '', //当前新闻标题
              newsList: [],
              companySys:[
                  { name: '项目管理', eName: 'PROJECT', icon: 'fa-list-ul', isActive: false },
                  { name: '制度流程体系', eName: 'SYSTEM', icon: 'fa-file-text-o', isActive: false },
                  { name: '专业标准体系', eName: 'PROFESSION', icon: 'fa-star-o', isActive: false },
                  { name: '产品线体系', eName: 'PRODUCT', icon: 'fa-cogs', isActive: false },
                  { name: '产品成本体系', eName: 'COST', icon: 'fa-database', isActive: false },
                  { name: '人才管理体系', eName: 'TALENT', icon: 'fa-users', isActive: false },
                  { name: '供应商管理', eName: 'SUPPLIER', icon: 'fa-link', isActive: true, link: { name:'Suppliers'} },
                  { name: '设计论剑', eName: 'DESIGN', icon: 'fa-folder-o', isActive: false },
                  { name: '地区风采', eName: 'STYLE', icon: 'fa-pencil-square-o', isActive: false }
              ]
          }
      },
      components:{
          Swiper, SwiperItem,
          Flexbox, FlexboxItem,
          Panel, Cell, Grid, GridItem, GroupTitle,
          BodyContent,Popup,XHeader,
      },
      computed: {
          filterEmp: function () {
              return this.appEmpList.filter((item,index) => {
                  return index <= 2;
              });
          }
      },
      methods:{
          onImgError:function(){},
          closeNewsDetail:function(){
            this.newsDetailHTML = '';
            this.showNewsDetail = false;
            this.curNewsTitle = '';
          },
          fetchData: function(){
              this.$vux.loading.show({
                  text: '加载中'
              });
              this.loading = true;
              axios.get(apiConfig.companyServer+apiConfig.homeIndexData)
              .then( res => {
                  this.homeBannerAry = res.data.appPicList;
                  this.appEmpList = res.data.appEmpList;

                  res.data.appNewsList.forEach((item, index) => {
                      this.newsList.push({
                          src: item.path,
                          fallbackSrc: require('../../../assets/images/projLogo/default.png'), // 默认图片
                          title: item.name,
                          desc: item.content.replace(/<[^>]+>/g, '').substring(0,50),
                          newsId:item.newsId
                      })
                  });
                  this.$vux.loading.hide(); // 关闭遮罩
              }).catch(error => {
                  this.$vux.loading.hide(); // 关闭遮罩
                  console.log(error);
              });
          },
          setThumbpath:function(item,index){
              return item.path?item.path:defaultAvatar['avatar'+(index%10!==0?index%10:8)];
          },
          getNewsDetail(item){
              const url = apiConfig.companyServer + apiConfig.newsDetailData + '?newsId=' + item.newsId + '&r=' + Math.random();
              this.showNewsDetail = true;
              this.curNewsTitle = item.title;
              this.$vux.loading.show({
                  text: '加载中'
              });
              axios.get(url)
              .then(res=>{
                  let w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                  this.newsDetailHTML = res.data.content.replace(/<img.+?src=\"(.+?)\".+?>/g, function ($1, str) {
                      return '<img src="' + str + '" style="width:' + (w - 20) + 'px;">';
                  }).replace(/960px/g, (w - 20) + 'px').replace(/682px/g,(w - 50) + 'px')
                    .replace(/818px/g, (w - 135) + 'px;display:inline-block')
                    .replace(/text-indent/g, '_none').replace(/style="/g,'style="max-width:'+ (w - 20) + 'px;');
                  this.$vux.loading.hide();
              }).catch(err=>{
                  console.log(err)
                  this.$vux.loading.hide();
              });
          }
      },
      beforeMount(){
          this.fetchData();
          globalData.removeData("suppTabIndex");// 清空记录的 供应商 首页状态
      },
  }
</script>

<style>
  .carousel{
    height: 10rem;
  }
  .index-title{
    text-align: left;
    border-left: 0.2rem solid #D43C33;
    padding-left: 1rem;
    margin: 1rem 0;
  }
  .p-employeeShowList{
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 1rem 0.5rem 0.5rem 0.5rem;
    background-color: #fff;
  }
  .p-employeeShowList li{
    width: 30%;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    flex-direction: column;
  }
  .index-newsItem{
    display: flex;
    justify-content: flex-start;
    padding: 1rem;
  }
  .index-newsItem>img{
    width: 5rem;
    height: 5rem;
  }
  .container .weui-cell {
    padding: 0px 15px;
    position: relative;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
  }
  .container .weui-cell:before{
    border-top: none;
  }
  .p-img-center{
    display: flex;
    align-items: center;
  }
</style>

