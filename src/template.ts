import * as t from '@babel/types'
import template from '@babel/template'

// 挂载 style 的模版
export function insertStyleElement(elementID: string, css: string): t.Node {
  // 防止内容包含特殊字符干扰
  const encodeCss = Buffer.from(css).toString('base64')
  const encodeElementID = Buffer.from(elementID).toString('base64')

  return template.statement(`
    (function(elementID, css) {
      // 环境检查
      if (typeof (window) == 'undefined') return;
      if (typeof (document) == 'undefined') return;
      if (typeof (document.head) == 'undefined') return;
      if (window.document.getElementById(elementID)) return;
      
      // 创建 style
      const style = document.createElement('style');
      style.type="text/css"
      style.id = elementID;
      style.innerHTML = css;

      // 插入 dom
      document.head.appendChild(style);
    })(atob("${encodeElementID}"), atob("${encodeCss}"));
  `)()
}

export function styleTokenMap(variableName: string, map: Object): babel.Node {
  return template.statement(`
    const ${variableName} = ${JSON.stringify(map)};
  `)();
}