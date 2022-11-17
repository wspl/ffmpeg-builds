const { execSync, spawnSync } = require('child_process')
const fs = require('fs')

const msysDir = execSync('msys2 -c "cygpath -m /"').toString().trim()
const msysBinDir = `${msysDir.replaceAll('/', '\\')}\\usr\\bin`

console.log(fs.readdirSync(msysBinDir).join('\n'))

// setup vs
fs.writeFileSync('temp.bat', `call "C:/Program Files/Microsoft Visual Studio/2022/Enterprise/VC/Auxiliary/Build/vcvarsall.bat" amd64\nset`)
const sets = spawnSync('temp.bat', {
  shell: true
}).stdout.toString()
fs.rmSync('temp.bat')
console.log(sets)
const vsEnvs = Object.fromEntries(sets.split('\n').slice(5).map(line => line.trim().split('=')).filter(t => t.length > 1))

execSync('git clone https://github.com/FFmpeg/FFmpeg.git', {
  stdio: 'inherit'
})

spawnSync('sh', [
  './configure',
  '--toolchain=msvc',
  '--prefix=../output'
], {
  stdio: 'inherit',
  cwd: 'FFmpeg',
  env: {
    ...vsEnvs,
    Path: `${msysBinDir};${vsEnvs.Path}`
  }
})

execSync(`${msysBinDir}\\make.exe`, {
  stdio: 'inherit',
  cwd: 'FFmpeg',
  env: {
    ...vsEnvs,
    Path: `${msysBinDir};${vsEnvs.Path}`
  }
})

console.log(fs.readFileSync('FFmpeg/ffbuild/config.log', 'utf-8'))