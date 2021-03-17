# `一文搞懂Vue2-3的v-model和.sync`

## 一、 Vue2

### 1、v-model 处理输入控件

在 2.x 中，在组件上使用 `v-model` 相当于绑定 `value` prop 和 `input` 事件：

```html
<ChildComponent v-model="pageTitle" />
<!-- 是以下的简写: -->
<ChildComponent :value="pageTitle" @input="pageTitle = $event" />
```

如果要将属性或事件名称更改为其他名称，则需要在 `ChildComponent` 组件中添加 `model:{}` 选项。 这里的 `lovingVue` 的值将会传入这个名为 `checked` 的 prop。同时当 <base-checkbox> 触发一个 change 事件并附带一个新的值的时候，这个 `lovingVue` 的 property 将会被更新。注意你仍然需要在组件的 `props` 选项里声明 `checked` 这个 prop。

```html
<!-- 父组件 -->
<template>
  <div>
    <!-- v-model缩写语法糖 -->
    <base-checkbox v-model="lovingVue" />
    <!-- v-model语法糖展开写法3种相同 -->
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
    methods: {
      onChangeVal(val) {
        this.lovingVue = val
      },
    },
  }
</script>
```

```html
<!-- 子组件 -->
<template>
  <div class="my-component">
    <input type="checkbox" v-bind:checked="checked" v-on:change="$emit('change', $event.target.checked)" />
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
```

### 2、 v-model 处理非输入控件

1）直接在子组件改值会报语法错误`Avoid mutating a prop directly since the value will be overwritten whenever the parent component re-renders. Instead, use a data or computed property based on the prop's value. Prop being mutated: "isShowDialog"`。

2）在父组件用`ref`修改子组件的属性时机有时不够准确。

所以我们平时写自定义组件用`v-model`不是专门处理输入控件的，一般使用`update`。

```html
<!-- 父组件 -->
<template>
  <div class="test-vmodel2">
    <div @click="showDialog">点击弹窗</div>
    <!-- v-model -->
    <MyDialog v-model="isShowDialog" @showDialogCb="showDialogCb">
      <div class="test-dialog">
        <h3>test-dialog</h3>
        <p @click.stop="showDialogCb">父组件点击关闭(父组件的关闭需要回调)</p>
      </div>
    </MyDialog>
    <!-- .sync语法糖 -->
    <MyDialog :isShowDialog.sync="isShowDialog" @showDialogCb="showDialogCb">同上...</MyDialog>
    <!-- .sync语法糖展开 -->
    <MyDialog :isShowDialog="isShowDialog" @update:isShowDialog="isShowDialog = $event" @showDialogCb="showDialogCb">同上...</MyDialog>
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
```

```html
<!-- 子组件 -->
<template>
  <transition name="fade-dialog" appear>
    <div v-if="isShow" class="my-dialog-wraper">
      <div class="my-dialog">
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
    // .sync可以去掉model
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
      isShowDialog: function (val, oldval) {
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
```

### 3、 v-model 和.sync

`.sync`实际也是一个缩写语法糖(见上面示例)

```html
父组件 可以监听那个事件并根据需要更新一个本地的数据 property
<MyDialog :isShowDialog="isShowDialog" @update:isShowDialog="isShowDialog = $event" @showDialogCb="showDialogCb">...</MyDialog>

为了方便起见，我们为这种模式提供一个缩写，即 .sync 修饰符:
<MyDialog :isShowDialog.sync="isShowDialog" @showDialogCb="showDialogCb">...</MyDialog>
```

**两者相同点**

1、 都是监听触发事件，比如 `@update:isShowDialog="val => (isShowDialog = val)"`
2、 `v-model` 默认对应的是输入控件 `input/checkbox/select/textarea` 等的 `input` 事件，和`.sync`用法一样

**不同点**

1、 一个子组件只能有 1 个`v-model`绑定`1个value`，而`.sync`可以有多个。

### 4、 示例

[详见/testvue2/src/views/TestVModel](https://github.com/glhfwp/myBlog/tree/main/test/vue/testvue2/src/views/TestVModel)

## 二、 Vue3

### 1、 相对于 Vue2 的变化

官方文档：

- 非兼容：用于自定义组件时，`v-model` prop 和事件默认名称已更改：
  - prop：`value` -> `modelValue`；
  - event：`input` -> `update:modelValue`；
- 非兼容：`v-bind` 的 `.sync` 修饰符和组件的 `model` 选项已移除，可用 `v-model` 作为代替；
- 新增：现在可以在同一个组件上使用多个 `v-model` 进行双向绑定；
- 新增：现在可以自定义 `v-model` 修饰符。

### 2、 3.x 语法

自定义组件上的 `v-model` 相当于传递了 `modelValue` prop 并接收抛出的 `update:modelValue` 事件：

不带参语法：

```html
<ChildComponent v-model="pageTitle" />
<!-- v-model语法糖是以下的简写: -->
<ChildComponent :modelValue="pageTitle" @update:modelValue="pageTitle = $event" />

<!-- 子组件 -->
<script>
  export default {
    props: {
      modelValue: String, // 以前是`value：String`
    },
    emits: ['update:modelValue'],
    methods: {
      changePageTitle(title) {
        this.$emit('update:modelValue', title) // 以前是 `this.$emit('input', title)`
      },
    },
  }
</script>
```

带参语法：

```html
<ChildComponent v-model:title="pageTitle" />
<!-- 是以下的简写: -->
<ChildComponent :title="pageTitle" @update:title="pageTitle = $event" />

<!-- 子组件 -->
<script>
  export default {
    props: {
      title: String,
    },
    emits: ['update:title'],
    methods: {
      changePageTitle(title) {
        this.$emit('update:title', title)
      },
    },
  }
</script>
```

在自定义组件上使用多个 v-model：

```html
<ChildComponent v-model:title="pageTitle" v-model:content="pageContent" />
<!-- 是以下的简写：不用像2.x写多个sync了 -->
<ChildComponent :title="pageTitle" @update:title="pageTitle = $event" :content="pageContent" @update:content="pageContent = $event" />

<!-- 子组件 -->
<template>
  <div>
    <input type="text" :value="title" @input="$emit('update:title', $event.target.value)" />
    <input type="text" :value="content" @input="$emit('update:content', $event.target.value)" />
    <input type="text" :value="content" @input="emitValue" />
  </div>
</template>
<script>
  export default {
    props: {
      title: String,
      content: String,
    },
    emits: ['update:title', 'update:content'],
    methods: {
      changePageTitle(title) {
        this.$emit('update:title', title)
      },
      changePageContent(content) {
        this.$emit('update:content', content)
      },
      emitValue(e) {
        this.$emit('update:content', e.target.value)
      },
    },
  }
</script>
```

## 参考

[vue2 官网 自定义组件的 v-model](https://cn.vuejs.org/v2/guide/components-custom-events.html#%E8%87%AA%E5%AE%9A%E4%B9%89%E7%BB%84%E4%BB%B6%E7%9A%84-v-model)

[vue2 官网 .sync 修饰符](https://cn.vuejs.org/v2/guide/components-custom-events.html#sync-%E4%BF%AE%E9%A5%B0%E7%AC%A6)

[vue3 官网 v-model 迁移](https://v3.cn.vuejs.org/guide/migration/v-model.html#%E6%A6%82%E8%A7%88)

[vue3 官网 v-model 参数](https://v3.cn.vuejs.org/guide/component-custom-events.html#v-model-%E5%8F%82%E6%95%B0)

[vue3 官网 多个 v-model 绑定](https://v3.cn.vuejs.org/guide/component-custom-events.html#%E5%A4%9A%E4%B8%AA-v-model-%E7%BB%91%E5%AE%9A)
