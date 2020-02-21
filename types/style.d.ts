declare module '*.css' {
  const cssModuleExport: {
    [className: string]: string
  }

  export = cssModuleExport
}

declare module '*.less' {
const cssModuleExport: {
  [className: string]: string
}

export = cssModuleExport
}

declare module '*.sass' {
const cssModuleExport: {
  [className: string]: string
}

export = cssModuleExport
}

declare module '*.scss' {
const cssModuleExport: {
  [className: string]: string
}

export = cssModuleExport
}
