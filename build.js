const { match } = require('assert')
const { execSync, spawnSync } = require('child_process')
const fs = require('fs')

function buildWindows() {
  // setup msys env
  const msysDir = execSync('msys2 -c "cygpath -m /"').toString().trim()
  const msysBinDir = `${msysDir.replaceAll('/', '\\')}\\usr\\bin`

  // setup vs env
  fs.writeFileSync('temp.bat', `call "C:/Program Files/Microsoft Visual Studio/2022/Enterprise/VC/Auxiliary/Build/vcvarsall.bat" amd64\nset`)
  const sets = spawnSync('temp.bat', {
    shell: true
  }).stdout.toString()
  fs.rmSync('temp.bat')
  const vsEnvs = Object.fromEntries(sets.split('\n').slice(5).map(line => line.trim().split('=')).filter(t => t.length > 1))

  // build
  const options = {
    stdio: 'inherit',
    cwd: 'FFmpeg',
    env: {
      ...vsEnvs,
      Path: `${msysBinDir};${vsEnvs.Path}`
    }
  }

  spawnSync('sh', [
    './configure',
    '--toolchain=msvc',
    '--prefix=../output'
  ], options)
  execSync(`${msysBinDir}\\make.exe -j16`, options)
  execSync(`${msysBinDir}\\make.exe install`, options)
}

function buildDarwin() {
  const options = {
    stdio: 'inherit',
    cwd: 'FFmpeg'
  }
  spawnSync('sh', [
    './configure',
    '--prefix=../output'
  ], options)
  execSync(`${msysBinDir}\\make.exe -j16`, options)
  execSync(`${msysBinDir}\\make.exe install`, options)
}

switch (process.argv[2]) {
  case 'windows': {
    buildWindows()
    break
  }
  case 'darwin': {
    buildDarwin()
    break
  }
}