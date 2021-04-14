<template>
  <div class="my-component">
    <input type="checkbox" :checked="checked" @change="$emit('change', $event.target.checked)" />
    <input type="checkbox" :checked="checked" @change="changeVal($event)" />
  </div>
</template>
<script>
export default {
  name: 'BaseCheckbox',
  model: {
    prop: 'checked',
    event: 'change',
  },
  props: {
    checked: Boolean,
  },
  methods: {
    changeVal(e) {
      this.$emit('change', e.target.checked)
    },
  },
}
</script>
