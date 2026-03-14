/**
 * Custom vitest environment: jsdom without native canvas.
 *
 * The project has `canvas@2.11.2` installed as a jsdom peer but the native
 * binary is not compiled for this machine. This environment patches Node's
 * module resolver before jsdom loads so it never tries to require the missing
 * `canvas.node` binary.
 */
import { builtinEnvironments, populateGlobal } from 'vitest/environments'
import type { Environment } from 'vitest'
import Module from 'module'

// Patch Module._resolveFilename ONCE, before jsdom is imported.
// This must happen at module-evaluation time (top-level), not inside `setup`.
const _origResolve = (Module as any)._resolveFilename.bind(Module)
;(Module as any)._resolveFilename = (request: string, ...args: unknown[]) => {
  if (request === 'canvas') {
    // Return a stub CJS module that exports nothing
    return require.resolve('./canvas-stub.cjs')
  }
  return _origResolve(request, ...args)
}

const jsdomEnv = builtinEnvironments['jsdom']

const env: Environment = {
  ...jsdomEnv,
  name: 'jsdom-no-canvas',
  async setup(global, options) {
    return jsdomEnv.setup(global, options)
  },
}

export default env
