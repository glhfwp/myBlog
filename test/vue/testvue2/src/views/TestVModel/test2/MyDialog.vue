<template>
  <!-- <transition name="fade-dialog" appear> -->
  <div v-if="isShow" class="my-dialog">
    <!-- 遮罩层 -->
    <!-- <-mask v-model="isShow" @maskClick="close"></mask> -->
    <div class="my-dialog-close" @click="close">子组件点击关闭</div>
    <div class="my-dialog-main">
      <slot></slot>
    </div>
  </div>
  <!-- </transition> -->
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
      // 为了处理回调操作
      this.$emit('showDialogCb', false)
    },
  },
}
</script>
<style lang="scss" scoped>
.my-dialog {
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  .my-dialog-close {
    width: 200px;
    height: 40px;
    background: #fff;
    margin: 100px auto;
  }
  .my-dialog-main {
  }
}
</style>
