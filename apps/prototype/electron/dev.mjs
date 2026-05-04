import { spawn } from 'node:child_process'

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const electronCommand = process.platform === 'win32' ? 'electron.cmd' : 'electron'
const viteUrlPattern = /https?:\/\/(?:localhost|127\.0\.0\.1):\d+\//

let electronProcess
let viteProcess
let isShuttingDown = false

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      ...options,
    })

    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`))
    })
  })
}

function shutdown(exitCode = 0) {
  if (isShuttingDown) {
    return
  }

  isShuttingDown = true
  electronProcess?.kill()
  viteProcess?.kill()
  process.exit(exitCode)
}

await run(npmCommand, ['run', 'build:electron'])

viteProcess = spawn(npmCommand, ['run', 'dev:web', '--', '--host', '127.0.0.1', '--port', '0'], {
  env: {
    ...process.env,
    ELECTRON_DEV: 'true',
  },
  stdio: ['inherit', 'pipe', 'pipe'],
})

viteProcess.on('error', (error) => {
  console.error(error)
  shutdown(1)
})

viteProcess.on('exit', (code) => {
  if (!isShuttingDown) {
    shutdown(code ?? 0)
  }
})

function handleViteOutput(chunk) {
  const output = chunk.toString()
  process.stdout.write(output)

  if (electronProcess) {
    return
  }

  const [devServerUrl] = output.match(viteUrlPattern) ?? []

  if (!devServerUrl) {
    return
  }

  electronProcess = spawn(electronCommand, ['dist-electron/main.js'], {
    env: {
      ...process.env,
      VITE_DEV_SERVER_URL: devServerUrl,
    },
    stdio: 'inherit',
  })

  electronProcess.on('error', (error) => {
    console.error(error)
    shutdown(1)
  })

  electronProcess.on('exit', (code) => {
    shutdown(code ?? 0)
  })
}

viteProcess.stdout.on('data', handleViteOutput)
viteProcess.stderr.on('data', handleViteOutput)

process.on('SIGINT', () => shutdown())
process.on('SIGTERM', () => shutdown())
