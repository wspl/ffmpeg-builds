const { match } = require('assert')
const { execSync, spawnSync } = require('child_process')
const fs = require('fs')

function buildWindows(arch) {
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
    '--prefix=../output',
    `--arch=${arch}`,
    `--target-os=${arch === 'x86' ? 'win32' : 'win64'}`
  ], options)
  execSync(`make -j16`, options)
  execSync(`make install`, options)
}

function buildDarwin(arch) {
  const options = {
    stdio: 'inherit',
    cwd: 'FFmpeg',
  }
  try {
    execSync([
      'sh',
      './configure',
      '--prefix=../output',
      '--enable-cross-compile',
      `--arch=${arch}`,
      '--cc=clang',
      `--extra-cflags="--target=${arch}-apple-darwin"`,
      `--extra-ldflags="--target=${arch}-apple-darwin"`,
    ].join(' '), options)
    execSync(`make -j16`, options)
    execSync(`make install`, options)
  } catch {
    console.log(fs.readFileSync('FFmpeg/ffbuild/config.log', 'utf-8'))
  }
}

const [,, platform, arch] = process.argv;
switch (platform) {
  case 'win32': {
    buildWindows(arch)
    break
  }
  case 'darwin': {
    buildDarwin(arch)
    break
  }
}