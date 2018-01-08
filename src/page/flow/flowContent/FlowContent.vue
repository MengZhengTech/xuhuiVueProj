<template>
    <div class="fullScreen">
        <HeaderBar title="审批中心" :showBackBtn="true"></HeaderBar>
        <FlowTemplate v-if="!loading">
            <div slot="flowInfo" v-if="flowContent.showFields.length > 0">
                <group class="weui-group p-flowInfoContent">
                    <cell v-for="(item,index) in flowContent.showFields" :key="index"
                        :title="item.showName" :inline-desc="item.showValue"></cell>
                </group>
            </div>
            <div slot="flowAttachment" v-if="flowContent.fileList.length > 0">
                <div class="p-title">相关附件</div>
                <group class="p-no-group-top">
                    <cell v-for="(item,index) in flowContent.fileList" :key="index"
                        :title="item.name + item.ext">
                        <x-button type="warn" :mini="true" @click.native="goFlowAttachment(item)">查看</x-button>
                    </cell>
                </group>
            </div>
            <div slot="flowForm" v-if="flowContent.formList.length > 0">
                <div class="p-title">相关表单</div>
                <group class="p-no-group-top">
                    <cell v-for="(item,index) in flowContent.formList" :key="index" is-link
                          :title="item.name" @click.native="showTable(item)"></cell>
                </group>
            </div>
            <div slot="flowOperation">
                <div class="fixedBottom" v-if="type == 1">
                    <x-button type="warn" @click.native="goFlowOpinion">查看审批意见</x-button>
                </div>
                <div class="fixedBottom" v-else-if="type == 2">
                    <flexbox>
                        <flexbox-item>
                            <x-button type="warn" @click.native="goFlowCheck">我要审批</x-button>
                        </flexbox-item>
                        <flexbox-item>
                            <x-button type="warn" @click.native="goFlowOpinion">查看审批意见</x-button>
                        </flexbox-item>
                    </flexbox>
                </div>
                <div class="fixedBottom" v-if="type == 3">
                    <x-button type="warn" @click.native="goFlowOpinion">查看审批意见</x-button>
                </div>
                <div class="fixedBottom" v-if="type == 4">
                    <x-button type="warn" @click.native="startFlow">发起流程</x-button>
                </div>
            </div>
        </FlowTemplate>
        <!-- 表格承载容器 -->
        <popup height="100%" v-model="showPopup">
            <x-header :left-options="{showBack: false}" style="width:100%;position:absolute;left:0;top:0;z-index:100;">
                {{curPopupTitle}}
                <a slot="right" href="javascript:;" @click="toggleDialog"><i class="fa fa-close"></i></a>
            </x-header>
            <BodyContent :showBottomPadding="false">
                <iframe v-if="curTableUrl" slot="content" :src="curTableUrl" width="100%" height="100%" frameborder="0"></iframe>
                <div v-else slot="content">暂无数据</div>
            </BodyContent>
        </popup>
        <!-- 附件预览 -->
        <popup height="100%" v-model="showFileReaderPopup">
            <x-header :left-options="{showBack: false}" style="width:100%;position:absolute;left:0;top:0;z-index:100;">
                {{curShowFileName}}
                <a slot="right" href="javascript:;" @click="closeFileReaderPopup"><i class="fa fa-close"></i></a>
            </x-header>
            <BodyContent :showBottomPadding="false">
                <iframe style="border: none;" width="100%" height="100%" slot="content" v-if="curFileReaderPath" :src="curFileReaderPath" frameborder="0"></iframe>
                <div v-else slot="content" class="p-no-data-panel">
                    <divider>文件未上传成功！请稍后重试</divider>
                </div>
            </BodyContent>
        </popup>
    </div>
</template>
<script>
import HeaderBar from '@/components/header/Header';
import FlowTemplate from '@/components/FlowTemplate/FlowTemplate';
import BodyContent from "@/components/content/BodyContent";
import TableView from '@/components/common/TableViewReader';
import apiConfig from '../../../server/apiConfig';
import axios from 'axios';
import globalData from '../../../server/globalData';
import { Group, Cell, XButton, Flexbox, FlexboxItem, Popup, XHeader, Divider } from 'vux';
export default {
    data(){
        return{
            flowContent: [],
            tableName: null,
            referFieldName: null,
            referFieldValue: null,
            actList:null,
            flowId: null,   // 流程Id
            flowInstanceId: null,   // 流程实例Id
            stepId:null,    // 当前步骤Id
            type: null, // 判断流程状态 1.已审 2.未审 3.已发 4.未发
            loading: false,
            showPopup: false, // 是否显示弹窗
            curPopupTitle: '附件标题',
            curTableUrl: null,
            curShowFileName: '', // pdf附件预览名称
            curFileReaderPath: '',
            showFileReaderPopup: false,
        }
    },
    methods:{
        getFlowContent(){
            this.$vux.loading.show({
                text: '加载中'
            });
            this.loading = true;
            axios.get(apiConfig.companyServer + apiConfig.flowContent.pageUrl
                + '?tableName='+this.tableName
                +'&referFieldName=' + this.referFieldName
                +'&referFieldValue='+this.referFieldValue
                +'&userId=' + globalData.user.guid
            ).then(res=>{
                console.log(res);
                this.flowContent = res.data;
                this.actList = res.data.actList;
                this.flowId = res.data.flowId;
                this.flowInstanceId = res.data.flowInstanceId;
                this.stepId = res.data.stepId;

                this.loading = false;
                this.$vux.loading.hide();

                globalData.setStorage('curFlowContentInfo', res.data, true);
                //console.log(JSON.parse(globalData.getStorage('curFlowContentInfo').data))
            }).catch(err=>{
                console.log(err);
                this.loading = false;
                this.$vux.loading.hide();
            });
        },
        goFlowOpinion(){
            this.$router.push({name:'FlowOpinion',query:{flowInstanceId:this.flowInstanceId}});
        },
        /**
         * 查看附件
         * @param filename
         * @param url
         * @param fileext
         */
        goFlowAttachment(item){
            if(item.ext == ""){
                // 拓展名为空
            } else if(item.ext == "folder"){ // 文件夹的情况
            } else if(globalData.fileType.img.indexOf(item.ext.toLowerCase())!== -1 && item.onlineFilePath){ // 预览图片格式
                if(this.picList.length > 0){
                    this.picList = [];
                }
                this.picList.push({
                    src: item.onlineFilePath,
                });
                this.$refs.previewer.show(0);
            } else if (globalData.fileType.other.indexOf(item.ext.toLowerCase())!== -1){ // office pdf
                this.curShowFileName = item.name;

                this.curFileReaderPath = item.onlineShowUrl;
                this.showFileReaderPopup = true;
            } else { // 未知文件格式
                this.$vux.alert.show({
                    title: '未知文件类型',
                    content: '系统暂未支持该类型文件预览！'
                });
            }
        },
        goFlowCheck(){
            globalData.flow.actList = this.actList;
            globalData.flow.flowId = this.flowId;
            globalData.flow.flowInstanceId = this.flowInstanceId;
            globalData.flow.stepId = this.stepId;
            this.$router.push({name:'FlowCheck',query:{
            }});
        },
        startFlow(){
            // 发起流程
        },
        showTable(item){
            this.showPopup = true;
            this.curPopupTitle = item.name;
            this.curTableUrl = apiConfig.webViewServer + decodeURIComponent(item.url) + '&uid=' + globalData.user.guid;
        },
        toggleDialog(){
            this.showPopup = false;
            this.curPopupTitle = "暂无附件";
        },
      // 关闭预览弹窗
        closeFileReaderPopup:function(){
            this.showFileReaderPopup = false;
            this.curFileReaderPath = "";
        },
    },
    beforeMount(){
        const initData = JSON.parse(globalData.getStorage('curFlowInfo').data);
        this.tableName = this.$route.query.tableName || initData.tableName;
        this.referFieldName = this.$route.query.referFieldName || initData.referFieldName;
        this.referFieldValue = this.$route.query.referFieldValue || initData.referFieldValue;
        this.type = this.$route.query.type || initData.type;
        if(globalData.beforeLoadCheckUser()){
            this.getFlowContent();
        }
    },
    components:{
        HeaderBar, FlowTemplate, Group, Divider,
        Cell, XButton, XHeader, BodyContent,
        Flexbox, FlexboxItem, Popup, TableView,
    }
}
</script>
<style scoped>
    .title{
        margin-top: 0.5rem;
    }
    .weui-group>.vux-no-group-title.weui-cells{
        margin-top: 0;
    }
    .weui-cells{
        margin-top: 0;
    }
</style>
<style>
  .p-flowInfoContent .vux-no-group-title{
      margin-top: 0 !important;
  }
</style>

