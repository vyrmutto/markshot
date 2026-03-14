import { createRequire } from 'module'
import Module from 'module'

/**
 * Global setup runs in Node.js before any test environment (jsdom) is created.
 * We intercept the canvas module resolution here so jsdom can load without the
 * native canvas.node binary.
 */
export default function setup() {
  const origResolve = (Module as any)._resolveFilename.bind(Module)
  ;(Module as any)._resolveFilename = (request: string, ...args: unknown[]) => {
    // Return an empty module path for the canvas native binding
    if (request === 'canvas' || request.includes('canvas/lib/bindings')) {
      return require.resolve('./canvas-stub.cjs')
    }
    return origResolve(request, ...args)
  }
}
