
import path from 'path'
import hash from './hash'
import * as t from '@babel/types'
import { ResultMap } from 'postcss'
import { PluginObj } from '@babel/core'
import { execFileSync } from 'child_process'
import { insertStyleElement, styleTokenMap } from './template'

type GenerateScopedNameFunction = (name: string, filename: string, css: string) => string

// 插件配置
export interface Options {
  autoPrefix?: boolean // 自动补充浏览器前缀
  cssModule?: CssModuleOptions | boolean // 交给 postcss 的 module 参数
  lessOptions?: Less.Options // LessOptions
}

// 具体请查看 https://github.com/css-modules/postcss-modules
export interface CssModuleOptions {
  scopeBehaviour?: 'global' | 'local'
  globalModulePaths?: (RegExp | string)[]
  // generateScopedName 占位符： https://github.com/webpack/loader-utils#interpolatename
  generateScopedName?: string | GenerateScopedNameFunction
  hashPrefix?: string
  camelCase?: boolean
  root?: string
}

// 转换
export interface TransformStyleResult {
  css?: string,
  tokens?: { [key: string]: string }
}

export interface TransformStyleOptions extends Options {
  fileName: string
}

function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

// 同步调用 PostCss 处理资源
function transformStyle(options: TransformStyleOptions): TransformStyleResult {
  const isDev = isDevelopment()
  const optionsStr = JSON.stringify(options)
  const transform = path.resolve(__dirname, `./transform.${isDev ? 'ts' : 'js'}`)
  const result = execFileSync(isDev ? 'ts-node' : 'node', [transform, optionsStr])
  return JSON.parse(result.toString())
}

function generateImportStyleAST(data: TransformStyleResult, node: t.ImportDeclaration): t.Node[] {
  const nodeArray: babel.Node[] = []

  if (!data.css && !data.tokens) {
    return nodeArray
  }

  if (data.css) {
    const elementID = hash(data.css)
    nodeArray.push(insertStyleElement(elementID, data.css))
  }

  if (data.tokens) {
    const specifiers = node.specifiers
    const defaultImport = specifiers.find(s => t.isImportDefaultSpecifier(s))

    if (!defaultImport || !t.isImportDefaultSpecifier(defaultImport)) { // 用户没有默认导入
      return nodeArray
    }

    // TODO: 考虑允许用户其他方式导入
    const variableName = defaultImport.local.name
    nodeArray.push(styleTokenMap(variableName, data.tokens))
  }

  return nodeArray
}


function plugin(): PluginObj {

  return {
    name: 'less',
    // 语法转换
    visitor: {
      // import styles from './style.css';
      ImportDeclaration: {
        enter: function (data, state: any) {
          const { source } = data.node
          const pluginOptions = state.opts
          const matcher = /(.less)|(.css)$/i
          const entryfile = state.file.opts.filename
          const importSourceliteralValue = source.value
          const styleFileName = path.resolve(path.dirname(entryfile), importSourceliteralValue)

          // 匹配文件后缀
          if (!matcher.test(importSourceliteralValue)) {
            return
          }

          // 转换 css
          const result = transformStyle({ ...pluginOptions, fileName: styleFileName })
          //  生成 AST
          const newImportAST = generateImportStyleAST(result, data.node)
          // 替换当前节点
          data.replaceWithMultiple(newImportAST)
        }
      },

      // TODO: 支持，主要是防止之前有别的转换在这之前
      // 这样就会生成 require 的代码
      // const styles = require('./styles.css');
      // CallExpression: {

      // }
    }
  };
}

export default plugin