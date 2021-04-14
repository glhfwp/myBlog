<template>
  <div>
    test1:
    <Vmodel1 />
    test2:
    <Vmodel2 />
  </div>
</template>

<script>
import Vmodel1 from './test1/Vmodel1'
import Vmodel2 from './test2/Vmodel2'
export default {
  name: 'ElseIndex',
  components: {
    Vmodel1,
    Vmodel2,
  },
  data() {
    return {}
  },
  created() {},
  mounted() {},
  methods: {},
}
</script>
