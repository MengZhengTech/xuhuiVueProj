<template>
    <div class="fullScreen">
        <BodyContent :showBottomPadding="false">
            <div class="container" slot="content">
                <div class="news-box">
                    <mt-cell v-for="(item,index) in newsList" :key="index" style="border-bottom: 1px dashed #ddd;"
                             :title="item.name" :label="item.date" @click.native="getNewsDetail(item)">
                        <img class="news-img" :src="item.path" :onerror="defaultImg">
                    </mt-cell>
                </div>
            </div>
        </BodyContent>
        <!-- 新闻详情 -->
        <popup height="100%" v-model="showNewsDetail">
            <x-header :left-options="{showBack:   false}" style="width:100%;position:absolute;left:0;top:0;z-index:100;">
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
import BodyContent from "@/components/content/BodyContent"
import apiConfig from '../../../server/apiConfig';
import axios from 'axios';

import { Popup,XHeader } from 'vux';
export default {
    data(){
        return{
            newsList:[],
            newsDetailHTML: '', //页面加载的数据
            curNewsTitle: '', //当前新闻标题
            showNewsDetail: false,
            defaultImg: 'this.src="' + require('../../../assets/images/projLogo/default.png') + '"'
        }
    },
    methods:{
        getNewsData(){
            this.$vux.loading.show({
                text: '加载中'
            });
            axios.get(apiConfig.companyServer+apiConfig.allNewsList)
                .then(res=>{
                    this.newsList = res.data.appNewsList;
                    this.$vux.loading.hide();
                }).catch(err=>{
                    console.log(err);
                    this.$vux.loading.hide();
                });
        },
        getNewsDetail:function(item){
            const url = apiConfig.companyServer + apiConfig.newsDetailData + '?newsId=' + item.newsId + '&r=' + Math.random();
            this.showNewsDetail = true;
            this.curNewsTitle = item.name;
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
        },
        closeNewsDetail:function(){
            this.newsDetailHTML = '';
            this.showNewsDetail = false;
            this.curNewsTitle = '';
        },
    },
    beforeMount(){
        this.getNewsData();
    },
    components:{
        BodyContent,Popup,XHeader
    }
}
</script>

<style>
    .news-box .mint-cell-wrapper{
        padding-top: 1rem;
        padding-bottom: 1rem;
        background-image: none;
    }
    .news-box .news-img{
        width: 5rem;
        height: 5rem;
    }
    .news-box .mint-cell-title{
        text-align: left;
        padding-right: 0.8rem;
        line-height: 1.5rem;
    }
</style>
