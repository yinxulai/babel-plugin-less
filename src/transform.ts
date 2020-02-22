import path from 'path'
import less from 'less'
import postcss from 'postcss'
import cssnano from 'cssnano'
import { readFileSync } from 'fs'
import autoprefixer from 'autoprefixer'
import postcssModules from 'postcss-modules'
import { TransformStyleOptions, TransformStyleResult, CssModuleOptions } from './index'

const optionsArgs: string[] = process.argv.slice(2)
const options: TransformStyleOptions = JSON.parse(optionsArgs[0])

// 预处理语法
async function transformStyleSyntax(source: string, options: Less.Options): Promise<string> {
  const data = await less.render(source, options)
  return data.css || ''
}

interface PostCssOptions extends postcss.ProcessOptions {
  cssModule?: CssModuleOptions | boolean
  autoPrefix?: boolean
}

// 处理 css module, 同时会补充浏览器前缀
async function transformStyleByPostCss(source: string, options: PostCssOptions): Promise<TransformStyleResult> {
  const result: TransformStyleResult = {}
  const plugins: postcss.AcceptedPlugin[] = []
  const { cssModule, autoPrefix, ...postcssOptions } = options

  plugins.push(cssnano())

  // 开启补充浏览器前缀
  if (autoPrefix) {
    plugins.push(autoprefixer())
  }

  // 开启 css Module
  if (cssModule) {
    // 如果开启了 cssModule
    // 保证一定有 tokens 对象
    // 因为使用者会调用 style.className

    result.tokens = {}
    const options = {
      // TODO: 考虑设置一份默认配置、merge 用户配置
      ...(typeof cssModule === 'object' ? cssModule : {}),
      getJSON: (_, token) => result.tokens = token || {},
    }

    plugins.push(postcssModules(options))
  }

  const postcssResult = await postcss(plugins)
    .process(source || '', postcssOptions)

  result.css = postcssResult.css
  return result
}

async function transform() {
  const { fileName, cssModule } = options
  const dirname = path.dirname(fileName)
  const source = readFileSync(fileName).toString()
  const styleString = await transformStyleSyntax(source, { paths: [dirname] })
  return await transformStyleByPostCss(styleString, { from: fileName, autoPrefix: true, cssModule })
}

transform()
  .catch(error => console.error(JSON.stringify(error)))
  .then(result => console.log(JSON.stringify(result)))