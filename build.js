const { execSync } = require('child_process')


// setup vs
fs.writeFileSync('temp.bat', `call "C:/Program Files/Microsoft Visual Studio/2022/Enterprise/VC/Auxiliary/Build/vcvarsall.bat" amd64\nset`)
const sets = spawnSync('temp.bat', {
  shell: true
}).stdout.toString()
fs.rmSync('temp.bat')
const vsEnvs = Object.fromEntries(sets.split('\n').slice(5).map(line => line.trim().split('=')).filter(t => t.length > 1))

execSync('git clone https://github.com/FFmpeg/FFmpeg.git', {
  stdio: 'inherit'
})

spawnSync('sh', [
  './configure'
], {
  stdio: 'inherit',
  cwd: 'FFmpeg',
  env: {
    ...vsEnvs,
    PATH: `C:\\msys64\\usr\\bin;${vsEnvs.PATH}`
  }
})