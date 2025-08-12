// Minimal Vue 3 SFC transformer for Jest (CommonJS)
// Avoids external dependency on @vue/vue3-jest
// Requires @vue/compiler-sfc (already present via Vite plugin dependency)

const { parse, compileScript, compileTemplate } = require('@vue/compiler-sfc')
const ts = require('typescript')
const path = require('path')

function toConstSfc(scriptCode) {
  return scriptCode.replace(/export\s+default/, 'const __sfc__ =')
}

module.exports = {
  process(source, filename) {
    if (path.extname(filename) !== '.vue') {
      return { code: source }
    }

    const { descriptor } = parse(source, { filename })

    // Compile <script> / <script setup>
    const script = compileScript(descriptor, { id: filename, inlineTemplate: false })
    let code = toConstSfc(script.content)

    // Compile <template>
    if (descriptor.template) {
      const tpl = compileTemplate({
        source: descriptor.template.content,
        filename,
        id: filename,
        slotted: false,
        isProd: false,
        // Provide script-setup bindings so template treats them as module-scope vars
        bindings: script.bindings,
      })
      code += `\n${tpl.code}\n__sfc__.render = render;`
    }

    // Export as CJS for Jest
    code += `\nmodule.exports = __sfc__;`

    // Transpile TS -> CJS JS
    const transpiled = ts.transpileModule(code, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        jsx: ts.JsxEmit.Preserve,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        skipLibCheck: true,
      },
      fileName: filename,
    })

    return { code: transpiled.outputText }
  }
}


