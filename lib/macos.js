import childProcess from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const execFile = promisify(childProcess.execFile)
const binary = path.join(__dirname, '../main')

const parseMac = (stdout) => {
  try {
    return JSON.parse(stdout)
  } catch (error) {
    console.error(error)
    throw new Error('Error parsing window data')
  }
}

const getArguments = (options) => {
  if (!options) {
    return []
  }

  const arguments_ = []
  if (options.accessibilityPermission === false) {
    arguments_.push('--no-accessibility-permission')
  }

  if (options.screenRecordingPermission === false) {
    arguments_.push('--no-screen-recording-permission')
  }

  return arguments_
}

export async function activeWindow(options) {
  const { stdout } = await execFile(binary, getArguments(options))
  return parseMac(stdout)
}
