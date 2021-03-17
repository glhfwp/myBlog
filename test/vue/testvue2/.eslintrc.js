module.exports = {
  root: true,
  parserOptions: {
    sourceType: 'module',
    parser: 'babel-eslint',
  },
  env: {
    browser: true,
    node: true,
  },
  extends: ['plugin:vue/essential', 'eslint:recommended', '@vue/prettier'],
  plugins: ['vue', 'prettier'],
  rules: {
    'prettier/prettier': [
      2,
      {
        printWidth: 160,
        tabWidth: 2,
        useTabs: false,
        semi: false,
        singleQuote: true,
        trailingComma: 'all',
        bracketSpacing: true,
        jsxBracketSameLine: false,
        arrowParens: 'avoid',
      },
    ],
    // "off"或者0    //关闭规则关闭
    // "warn"或者1    //在打开的规则作为警告（不影响退出代码）
    // "error"或者2    //把规则作为一个错误（退出代码触发时为1）
    'no-unused-vars': 0,
    'no-eq-null': 0, // 禁止在没有类型检查操作符的情况下与 null 进行比较
    camelcase: 0, // 驼峰
    'no-alert': 0,
    'no-console': 0,
    'no-dupe-keys': 2, // 2, //在创建对象字面量时不允许键重复
    'no-constant-condition': [
      2,
      {
        checkLoops: false,
      },
    ],
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0, // 禁止使用debugger,开发环境允许使用,
    'no-dupe-args': 2, // 2,//函数参数不能重复
    eqeqeq: 1, // 必须使用全等
    'no-caller': 2, // 2, // 禁止使用arguments.caller或arguments.callee
    'no-eval': 2, // 2,//禁止使用eval
    'vue/require-prop-type-constructor': 0,
    'vue/html-indent': 0, // html标签格式化等
    'vue/max-attributes-per-line': 0, // 各种折行
    'vue/html-self-closing': 0, // 标签关闭
    'vue/attribute-hyphenation': 0, // 标签属性必须用连字符连接
    'vue/no-side-effects-in-computed-properties': 0, // 意外的属性赋值，把修改data数据写成一个方法，在computed中调用该方法
    'vue/singleline-html-element-content-newline': 0, // 新行
    'vue/require-default-prop': 0, // props必须有默认值
    'vue/v-on-style': 2, // v-on: ---> @
    'vue/v-bind-style': 2, // v-bind:key="" --> :key=""

    // 以下规则暂时没注释
    'no-await-in-loop': 0,
    'no-compare-neg-zero': 2,
    'defalut-case': 0,
    'consistent-return': 0,
    'no-else-return': 0,
    'require-await': 0,
    'vars-on-top': 0,
    'no-warning-comments': 0,
    'for-direction': 2,
    'vue/custom-event-name-casing': 0,
    'vue/name-property-casing': 2,
    'vue/require-prop-types': 2,
    'vue/html-end-tags': 2,
    'vue/require-valid-default-prop': 2,
    'vue/no-shared-component-data': 2,
    'vue/no-dupe-keys': 2,
  },
}
