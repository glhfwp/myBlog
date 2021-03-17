<template>
  <div class="test-vmodel2">
    <div @click="showDialog">点击弹窗</div>
    <MyDialog v-model="isShowDialog" @showDialogCb="showDialogCb">
      <!-- <MyDialog :isShowDialog.sync="isShowDialog" @showDialogCb="showDialogCb"> -->
      <div class="test-dialog">
        <h3>test-dialog</h3>
        <p @click.stop="showDialogCb">父组件点击关闭(父组件的关闭需要回调)</p>
      </div>
    </MyDialog>
  </div>
</template>

<script>
import MyDialog from './MyDialog'
export default {
  name: 'Vmodel2',
  components: {
    MyDialog,
  },
  data() {
    return {
      isShowDialog: false,
    }
  },
  watch: {
    isShowDialog: function(val, oldval) {
      console.log('isShowDialog', val)
    },
  },
  created() {},
  mounted() {},
  methods: {
    showDialog() {
      this.isShowDialog = true
    },
    showDialogCb() {
      this.isShowDialog = false
    },
  },
}
</script>
<style lang="scss" scoped>
.test-vmodel2 {
  position: relative;
  ::v-deep .my-dialog-main {
    width: 300px;
    height: 400px;
    background: #fff;
    margin: 300px auto;
    .test-dialog {
      text-align: center;
    }
  }
}
</style>
