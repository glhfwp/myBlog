<template>
  <transition name="fade-dialog" appear>
    <div v-if="isShow" class="my-dialog-wraper">
      <div class="my-dialog">
        <!-- 遮罩层 -->
        <!-- <-mask v-model="isShow" @maskClick="close"></mask> -->
        <div class="my-dialog-close" @click="close">子组件点击关闭</div>
        <div class="my-dialog-main">
          <slot></slot>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
export default {
  name: 'MyDialog',
  model: {
    prop: 'isShowDialog',
    event: 'update',
  },
  props: {
    isShowDialog: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isShow: this.isShowDialog,
    }
  },
  watch: {
    isShowDialog: function(val, oldval) {
      this.isShow = val
    },
  },
  methods: {
    close() {
      this.isShow = false
      this.$emit('update:isShowDialog', false)
      // 为了处理回调操作，除非v-model和.sync的语法糖是展开的，否则都需要额外的回调来处理数据。
      this.$emit('showDialogCb', false)
    },
  },
}
</script>
<style lang="scss" scoped>
.my-dialog-wraper {
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  .my-dialog {
    .my-dialog-close {
      width: 200px;
      height: 40px;
      background: #fff;
      margin: 100px auto;
    }
  }
}
.fade-dialog-enter-active {
  animation-delay: 0.3s;
  .my-dialog {
    animation: fadeDialogIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}
.fade-dialog-leave-active {
  animation-delay: 0.3s;
  .my-dialog {
    animation: fadeDialogOut 0.3s ease-in both;
  }
}
@keyframes fadeDialogIn {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes fadeDialogOut {
  0% {
    opacity: 1;
    // transform: scale(1) translate3d(0, 0, 0);
    transform: scale(1);
  }
  100% {
    opacity: 0;
    // transform: translate3d(0, 100%, 0) scale(0.815);
    transform: scale(0.8);
  }
}
</style>
