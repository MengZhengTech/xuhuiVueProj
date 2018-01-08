<template>
    <div class="fullScreen">
        <swiper loop auto :aspect-ratio="350/800">
            <swiper-item v-for="(item,index) in projBannerAry" :key="index" class="p-img-center">
                <img :src="item.src" alt="#" width="100%" :onerror="defaultSwiper">
            </swiper-item>
        </swiper>
        <group>
            <cell value-align="left" v-for="(item,index) in abstractAry" :key="index" class="p-proj-item">
                <div slot="title" class="p-label">{{item.key}}</div>
                <span class="p-value">{{item.value|| "暂无数据"}}</span>
            </cell>
            <cell-box class="p-attachList" v-for="(item,index) in attachList" :key="index" v-if="item.appFileList.length>0">
                <div class="w100p">
                    <div class="p-title">{{item.name}}</div>
                    <div class="w100p">
                        <grid :cols="3" >
                            <grid-item class="p-attachItem" v-for="(img,i) in  item.appFileList" :key="i">
                                <img @click="show(img)" class="p-previewer-img" :src="img.thumbPicPath"
                                     alt="#" :onerror="defaultAvatar" width="100" style="height:100%;width: 100%;">
                            </grid-item>
                        </grid>
                        <div v-transfer-dom>
                            <previewer :list="getPreview(item.appFileList)" ref="previewer" :options="options"></previewer>
                        </div>
                    </div>
                </div>
            </cell-box>
        </group>
    </div>
</template>
<script>
import apiConfig from "../../../server/apiConfig";
import globalData from '../../../server/globalData';
import axios from "axios";
import { Group,Cell,CellBox,Swiper,SwiperItem, Grid, GridItem, Previewer, TransferDom } from 'vux'
export default {
    directives: {
        TransferDom
    },
    data(){
        return{
            defaultAvatar: 'this.src="' + require('../../../assets/images/projLogo/default.png') + '"',
            defaultSwiper: 'this.src="' + require('../../../assets/images/projLogo/noPic.png') + '"',
            projBannerAry: [], // 项目详情页轮播图
            imgIndex: 1, // 图片计数
            count: 0,
            abstractAry: [], // 项目简介
            attachList: [], // 实景图等
            imgList: [],
            options: {
                getThumbBoundsFn (index) {
                    // find thumbnail element
                    let thumbnail = document.querySelectorAll('.p-previewer-img')[index]
                    // get window scroll Y
                    let pageYScroll = window.pageYOffset || document.documentElement.scrollTop
                    // optionally get horizontal scroll
                    // get position of element relative to viewport
                    let rect = thumbnail.getBoundingClientRect()
                    // w = width
                    return {x: rect.left, y: rect.top + pageYScroll, w: rect.width}
                    // Good guide on how to get element coordinates:
                    // http://javascript.info/tutorial/coordinates
                }
            }
        }
    },
    methods:{
        getPreview:function(list){
            const previewList = JSON.parse(JSON.stringify(this.imgList).replace(/thumbPicPath/g,'src').replace(/_m./g,'_hmsl.'));
            return previewList;
        },

        show:function(index) {
            this.$refs.previewer[0].show(index.count)
        },
        fetchData(){
            this.$vux.loading.show({
                text: '加载中'
            });
            // 获取项目概要
            const projId = JSON.parse(globalData.getStorage('curProjBaseInfo').data).projId;
            axios.get(apiConfig.companyServer+apiConfig.projectSummaryUrl
                +"?projId=" + projId
                +"&userId=" + globalData.user.guid
            ).then(res => {
                this.projBannerAry = res.data.imgList;
                this.$vux.loading.hide();
            }).catch(err=>{
                this.$vux.loading.hide();
            });
            // 获取项目简介
            axios.get(apiConfig.companyServer + apiConfig.projectIntroduce
                +"?projId=" + projId
                +"&userId=" + globalData.user.guid
            ).then(res => {
                this.abstractAry = res.data.data;
                this.attachList = res.data.appFileList;
                let count = 0;
                this.attachList.forEach((item)=>{
                    item.appFileList.forEach((item2)=>{
                        item2.count=count++;
                    });
                    this.imgList = this.imgList.concat(item.appFileList);
                });
                this.$vux.loading.hide();
            }).catch(err=>{
                console.log(err);
                this.$vux.loading.hide();
            });
        }
    },
    components:{
        Group,  Cell, CellBox, Previewer,
        Swiper, SwiperItem, Grid, GridItem,
    },
    beforeMount(){
        if(globalData.beforeLoadCheckUser()) {
            this.fetchData();
        }
    }
}
</script>
<style scoped>
.weui-cells .weui-cell{
    padding: 15px;
}
.p-label{
    color: #999999 !important;
    width: 6rem;
    font-size: 1rem;
}
.p-value{
    padding-left: 1rem;
    color:#000;
    font-size: 1rem;
}
.weui-cell__ft{
    margin-left: 1rem !important;
    color: #000 !important;
}
.p-attachList{
  padding: 15px 5px !important;
}
.p-attachItem{
  padding: 5px 5px;
  overflow: hidden;
  height: 8rem;
  border: none;
}
.p-attachItem.weui-grid:before,.p-attachItem.weui-grid:after{
  border: none;
}
.p-attachList:before,.p-attachList:after{
  border: none;
}
.w100p{
    width: 100%;
}
.p-cellTitle{
    color: #999999;
}
.p-buildingShowList{
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 1rem 0 0.5rem 0;
    background-color: #fff;
}
.p-buildingShowList li{
    width: 30%;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    flex-direction: column;
}
.index-title{
  text-align: left;
  border-left: 0.2rem solid #D43C33;
  padding-left: 1rem;
  margin: 1rem 0;
}
.p-proj-item{
  padding: 8px 10px !important;
}
.p-img-center{
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
