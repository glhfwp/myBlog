<template>
  <div>
    <!-- v-model写法1 -->
    <base-checkbox v-model="lovingVue" />
    <!-- v-model 语法糖展开写法 -->
    <base-checkbox :checked="lovingVue" @change="lovingVue = $event" />
    <base-checkbox :checked="lovingVue" @change="onChangeVal($event)" />
    <base-checkbox :checked="lovingVue" @change="val => (lovingVue = val)" />
  </div>
</template>

<script>
import BaseCheckbox from './BaseCheckbox'
export default {
  name: 'Vmodel',
  components: {
    BaseCheckbox,
  },
  data() {
    return {
      lovingVue: false,
    }
  },
  watch: {
    lovingVue: function(val, oldval) {
      console.log(val)
    },
  },
  created() {},
  mounted() {},
  methods: {
    onChangeVal(val) {
      this.lovingVue = val
    },
  },
}
</script>
