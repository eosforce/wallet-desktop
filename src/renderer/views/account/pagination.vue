<template>
    <div class="pagination-container">
        <div class="num-wrap clearfix">
            <span v-if="showFirstText"><a @click="currentNum--">上一页</a></span>
            <span v-for="idx in indexs" :key="idx" @click="gotoPage(idx)" :class="currentNum == idx ? 'current-num' : 'num'">{{ idx }}</span>
            <span v-if="showNextText"><a @click="currentNum++">下一页</a></span>
            <span class="show-for-pc total-warp">共{{ total }}条记录</span>
        </div>
    </div>
</template>

<script>
    export default {
        name: "pagination",
        props: {
            //当前页
            currentPage: {
                type: Number,
                default: 1
            },
            //每页显示多少条
            pageSize:{
                type: Number,
                default: 5
            },
            //总记录
            total:{
                type: Number,
                default: 0
            },
            //中间显示多少个页面编号
            showPageNum: {
                type: Number,
                default: 5, //最小为 3
            },
        },
        data() {
            return {
                showFirstText: false,
                showNextText: true,
                //当前页码
                currentNum: this.currentPage,
                totalPageNum:0
            }
        },
        methods: {
            //跳转到第几页
            gotoPage(curNum) {
                if (curNum != this.currentNum) {
                    this.currentNum = curNum;
                    // if(this.currentNum > this.totalPage){
                    //     this.currentNum = this.totalPage;
                    // }else if(this.currentNum < 1){
                    //     this.currentNum = 1;
                    // }
                    // //通知调用方，当前选中的页码
                    // this.$emit("pageChanged", this.currentNum);
                }
            },

        },
        computed: {
            //显示页码集合
            indexs: function() {
                var startPoint = 1;
                var endPoint = this.totalPage;
                var ar = [];
                if (this.totalPage > this.showPageNum) {
                    var middleTmp = Math.floor(this.showPageNum / 2)
                    if (this.currentNum > middleTmp && this.currentNum < this.totalPage - middleTmp) {
                        startPoint = this.currentNum - middleTmp;
                        endPoint = this.currentNum + middleTmp;
                    } else {
                        if (this.currentNum <= middleTmp) {
                            startPoint = 1;
                            endPoint = this.showPageNum;
                        } else {
                            endPoint = this.totalPage;
                            startPoint = this.totalPage - (this.showPageNum - 1);
                        }
                    }
                }
                while (startPoint <= endPoint) {
                    ar.push(startPoint);
                    startPoint++;
                }
                return ar;
            },
            //总页数
            totalPage(){
                console.log(this.total + "->" + this.pageSize)
                return this.totalPageNum = parseInt(this.total / this.pageSize) + (this.total % this.pageSize == 0 ? 0 : 1);
            },
        },
        watch: {
            currentNum: function(oldValue , newValue){
                if(this.currentNum <= this.totalPageNum)
                {
                    this.showFirstText = true;
                    this.showNextText = true;
                    if(this.currentNum == 1)
                    {
                        this.showFirstText = false;
                    }
                    if(this.currentNum == this.totalPageNum){
                        this.showNextText=false;
                    }
                    if(this.currentNum == this.totalPageNum)
                    {
                        this.$emit("pageChanged", 1, this.total % this.pageSize -1 );
                    }else{
                        this.$emit("pageChanged", this.total -this.currentNum * this.pageSize +1, this.pageSize-1);
                    }
                }
            }
        }
    };

</script>

<style scoped>

</style>