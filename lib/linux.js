import childProcess from 'node:child_process'
import { promisify } from 'node:util'

const execFile = promisify(childProcess.execFile)

const xpropBinary = 'xprop'
const xwininfoBinary = 'xwininfo'
const xpropActiveArguments = ['-root', '\t$0', '_NET_ACTIVE_WINDOW']
const xpropDetailsArguments = ['-id']

const processOutput = (output) => {
  const result = {}

  for (const row of output.trim().split('\n')) {
    if (row.includes('=')) {
      const [key, value] = row.split('=')
      result[key.trim()] = value.trim()
    } else if (row.includes(':')) {
      const [key, value] = row.split(':')
      result[key.trim()] = value.trim()
    }
  }

  return result
}

const getActiveWindowId = (activeWindowIdStdout) =>
  Number.parseInt(activeWindowIdStdout.split('\t')[1], 16)

const parseLinux = ({ stdout, _, activeWindowId }) => {
  const result = processOutput(stdout)

  const windowIdProperty = 'WM_CLIENT_LEADER(WINDOW)'
  const resultKeys = Object.keys(result)
  const windowId =
    (resultKeys.indexOf(windowIdProperty) > 0 &&
      Number.parseInt(result[windowIdProperty].split('#').pop(), 16)) ||
    activeWindowId

  return {
    platform: 'linux',
    title: JSON.parse(result['_NET_WM_NAME(UTF8_STRING)'] || result['WM_NAME(STRING)']) || null,
    id: windowId,
    application: JSON.parse(result['WM_CLASS(STRING)'].split(',').pop())
  }
}

async function getWindowInformation(windowId) {
  const [{ stdout }, { stdout: boundsStdout }] = await Promise.all([
    execFile(xpropBinary, [...xpropDetailsArguments, windowId], {
      env: { ...process.env, LC_ALL: 'C.utf8' }
    }),
    execFile(xwininfoBinary, [...xpropDetailsArguments, windowId])
  ])

  const data = parseLinux({
    activeWindowId: windowId,
    boundsStdout,
    stdout
  })
  return data
}

export async function activeWindow() {
  try {
    const { stdout: activeWindowIdStdout } = await execFile(xpropBinary, xpropActiveArguments)
    const activeWindowId = getActiveWindowId(activeWindowIdStdout)

    if (!activeWindowId) {
      return
    }

    return getWindowInformation(activeWindowId)
  } catch {
    return undefined
  }
}
