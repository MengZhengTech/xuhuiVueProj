<template>
    <div class="fullScreen">
        <HeaderBar title="审批中心" :showBackBtn="true"></HeaderBar>
        <div class="fullScreen" v-if="!loading">
            <BodyContent>
                <div slot="content">
                    <div class="comment">
                        <group title="填写审批意见：">
                            <x-textarea v-model="comment"  :max="200" :show-counter="false" :height="200"></x-textarea>
                        </group>
                    </div>
                    <div class="fixedBottom" v-if="actList.length > 0">
                        <flexbox>
                            <flexbox-item v-for="(item,index) in mainAct" :key="index">
                                <x-button type="warn" @click.native="operation(item.type)">{{item.name}}</x-button>
                            </flexbox-item>
                            <flexbox-item v-if="moreAct.length > 0">
                                <x-button @click.native="showMore">更多</x-button>
                            </flexbox-item>
                        </flexbox>
                    </div>
                    <actionsheet v-model="popupShow" :menus="actMenu" @on-click-menu="operation"></actionsheet>
                    <div v-if="userSelectModal">
                        <SelectUser
                            @listenToToggleSearchBar="syncToggleState"
                            @listenSelectedUserList="getUserFromChild"
                        />
                    </div>
                    <div v-if="flowCommentModal">
                        <FlowComment
                            :actType="actType"
                            :givenUser="givenUser"
                            @listenToToggleComment="syncToggleComment"
                        />
                    </div>
                </div>
            </BodyContent>
        </div>
    </div>
</template>
<script>
import HeaderBar from '@/components/header/Header'
import BodyContent from "@/components/content/BodyContent"
import apiConfig from '../../../server/apiConfig'
import axios from 'axios'
import globalData from '../../../server/globalData'
import SelectUser from './SelectUser.vue';
import FlowComment from './FlowComment';
import { Group,XTextarea,XButton,Flexbox,FlexboxItem,Popup,Actionsheet  } from 'vux'
export default {
    data(){
        return {
            popupShow:false,
            userSelectModal:false,
            flowCommentModal:false,
            actList:[],
            mainAct:[],
            moreAct:[],
            actMenu:{},
            flowId: null,   // 流程Id
            flowInstanceId: null,   // 流程实例Id
            stepId:null,    // 当前步骤Id
            actType:null,
            comment:'',     // 审批意见
            givenUser:null,
            loading:false,
        }
    },
    methods:{
        showMore(){
            this.popupShow = true;
        },
        syncToggleState: function(newState){ // 同步用户选择状态
            this.userSelectModal = newState;
        },
        getUserFromChild: function(data){
            if(data.userId != globalData.user.userId){
                this.givenUser = data;
                this.flowCommentModal = !this.flowCommentModal;
            }else{
                this.$vux.toast.show({
                    type:'warn',
                    text: '转办对象有误',
                })
            }
        },
        syncToggleComment(newState){
            this.flowCommentModal = newState;
        },
        operation(type,item){
            var self = this;
            type = type + '';
            // console.log(typeof type);
            switch(type){
                case '1': // 会签确认
                    self.doActions(apiConfig.doAction,2,1)
                    break;
                case '2': // 通过
                    this.$vux.confirm.show({
                        title:'请确认审批操作',
                        content:'您选择的审批操作为“通过”',
                        onConfirm(){
                            self.doActions(apiConfig.doAction,3,1)
                        },
                    })
                    break;
                case '3': // 驳回
                    this.$vux.confirm.show({
                        title:'请确认审批操作',
                        content:'您选择的审批操作为“驳回”',
                        onConfirm(){
                            self.doActions(apiConfig.doAction,4,0)
                        },
                    })
                    break;
                case '4': // 集团驳回
                    break;
                case '5': // 转办
                    globalData.flow.actId = 0;
                    this.actType = 5;
                    this.userSelectModal = !this.userSelectModal;
                    break;
                case '7': // 终止
                    this.$vux.confirm.show({
                        title:'请确认审批操作',
                        content:'您选择的审批操作为“终止”',
                        onConfirm(){
                            self.doActions(apiConfig.ForceCompleteInstance,0);
                        },
                    });
                    break;
                case '8': // 已阅
                    this.$vux.confirm.show({
                        title:'请确认审批操作',
                        content:'您选择的审批操作为“已阅”',
                        onConfirm(){
                            self.doActions(apiConfig.doAction,3,2)
                        },
                    })
                    break;
                case '10': // 当前会签
                    self.$router.push({name:'FlowSign',query:{flowInstanceId:this.flowInstanceId,actType:10}});
                    break;
                case '11': // 加签
                    self.$router.push({name:'FlowSign',query:{flowInstanceId:this.flowInstanceId,actType:11}});
                    break;
                case '12': // 回退
                    this.$vux.confirm.show({
                        title:'请确认审批操作',
                        content:'您选择的审批操作为“回退”，流程将返回给上一级操作',
                        onConfirm(){
                            self.doActions(apiConfig.BackSpaceAction,4,0);
                        },
                    });
                    break;
                case '13': // 知会
                    this.$router.push({name:'NotifyUser'});
                    break;
            }
        },
        doActions(url,actId,attitude){
            var self = this;
            let param = new URLSearchParams();
            param.append("flowId", self.flowId);
            param.append("flowInstanceId", self.flowInstanceId);
            param.append("stepId", self.stepId);
            param.append("content", self.comment);
            param.append("actId", actId);
            param.append('jumpStepId',0);
            if(attitude){
                param.append("attitude", attitude);
            }
            axios.post(apiConfig.companyServer + url,param)
                .then(res=>{
                    console.log(res);
                    this.$vux.toast.show({
                        text: '操作成功'
                    })
                    setTimeout(()=>{
                        self.$router.push({name:'Flow'});
                    },500)
                }).catch(err=>{
                    console.log(err);
                })
        },
    },
    beforeMount(){
        const self = this,initData = JSON.parse(globalData.getStorage('curFlowContentInfo').data);
        this.flowId = globalData.flow.flowId || initData.flowId;
        this.flowInstanceId = globalData.flow.flowInstanceId || initData.flowInstanceId;
        this.stepId = globalData.flow.stepId || initData.stepId;
        this.actList = globalData.flow.actList || initData.actList;

        if(this.actList.length == 1 || this.actList.length == 2){
            this.mainAct = this.actList;
        }else if(this.actList.length > 2){
            this.mainAct = this.actList.slice(0,2);
            this.moreAct = this.actList.slice(2);
            this.moreAct.forEach(function(item,index) {
                this.actMenu[item.type] = item.name;
            }, this);
        }
    },
    mounted(){
        if(this.actList.length <= 0){
            var self = this;
            this.$vux.toast.show({
                text: '该流程已结束',
                type: 'warn',
            })
            setTimeout(()=>{
                self.$router.push({name:'Flow'});
            },2000)
        }
    },
    components:{
        HeaderBar,
        BodyContent,
        SelectUser,
        FlowComment,
        Group,
        XTextarea,
        XButton,
        Flexbox,
        FlexboxItem,
        Popup,
        Actionsheet
    }
}
</script>
<style scoped>
    .comment{
        padding: 0 1rem;
    }
</style>
