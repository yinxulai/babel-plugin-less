# babel-plugin-less

一个 `Babel` 插件，用来帮助你对文件中引用的 `less` 进行预处理、转换成 `css` 并自动管理, 支持 `cssModule`, `autoPrefix`

## Installation

```
npm install --save-dev @yinxulai/babel-plugin-less
```

## Usage

```js
// .babelrc
{
  "presets": [],
  "plugins": [
    [
      "@yinxulai/babel-plugin-less",
      {
        "autoPrefix": true,
        "cssModule": true
      }
    ],
  ]
}
```

### Example
```less
// style.less
.example {
    display: grid;
    user-select: none;
}
```
```js
// index.jsx
import style from './style.less'
```
***最终输出***
```js
// outfile.js
(function (elementID, css) {
  if (typeof window == 'undefined') return;
  if (typeof document == 'undefined') return;
  if (typeof document.head == 'undefined') return;
  if (window.document.getElementById(elementID)) return;
  var style = document.createElement('style');
  style.type = "text/css";
  style.id = elementID;
  style.innerHTML = css;
  document.head.appendChild(style);
})("elementID", "CSS");

// render 到 html 上时:
// .example {
//    display: -ms-grid;
//    display: grid;
//    -webkit-user-select: none;
//       -moz-user-select: none;
//        -ms-user-select: none;
//            user-select: none;
// }


var style = {
  "example": "_example_1q9fy_1",
};

```

### Configuration

#### `autoPrefix` bool

是否启用自动补充 `css` 属性的浏览器前缀

#### `cssModule` object | bool

 本插件使用 `postcss-modules` 插件来处理 `cssModule`
 同时完整支持 `postcss-modules` 插件配置，具体请查看
 [postcss-modules 文档](https://github.com/css-modules/postcss-modules)

```ts
interface CssModuleOptions {
  scopeBehaviour?: 'global' | 'local'
  globalModulePaths?: (RegExp | string)[]
  generateScopedName?: string | GenerateScopedNameFunction
  hashPrefix?: string
  camelCase?: boolean
  root?: string
}
```

#### `lessOptions` object
 本插件使用 `less` 包来对 `less` 文件进行预处理，同时完整支持 `less` 的相关配置
 详细信息查看 [less 文档](https://github.com/less/less-docs/blob/master/content/usage/less-options.md)

### TODO List

  * [ ] 完善文档
  * [ ] 添加更多示例

## License

MIT
