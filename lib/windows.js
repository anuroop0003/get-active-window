import preGyp from '@mapbox/node-pre-gyp'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const getAddon = () => {
  const require = createRequire(import.meta.url)

  const bindingPath = preGyp.find(path.resolve(path.join(__dirname, '../../package.json')))

  return fs.existsSync(bindingPath)
    ? require(bindingPath)
    : {
        getActiveWindow() {},
        getOpenWindows() {}
      }
}

export async function activeWindow() {
  const activeWindow = getAddon().getActiveWindow()

  return {
    platform: 'windows',
    title: activeWindow.title,
    id: activeWindow.id,
    application: activeWindow.owner.name
  }
}
