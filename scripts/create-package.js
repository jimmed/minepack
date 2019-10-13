#!/usr/bin/env node
const pkg = require('../package.json')
const { resolve } = require('path')
const { promises: fs } = require('fs')

const packageRoot = resolve(process.cwd(), 'packages')

const packagePath = resolve.bind(null, packageRoot)

function getPackageRootName() {
  const [rootPackage] = pkg.name.split('/')
  if (!rootPackage) {
    throw new Error('Could not get package name from package.json')
  }
  return rootPackage
}

function getNewPackageName(name) {
  return `${getPackageRootName()}/${name}`
}

async function createPackageJson(name, version) {
  const newJson = {
    name: getNewPackageName(name),
    version: version || pkg.version || '0.1.0',
    main: './lib/index.js',
    scripts: { test: 'jest' },
  }
  await fs.writeFile(packagePath(name, 'package.json'), JSON.stringify(newJson, null, 2), 'utf8')
}

async function createTsConfig(name) {
  const newJson = {
    extends: '../tsconfig.settings.json',
    compilerOptions: {
      outDir: './lib',
      rootDir: './src',
    },
  }
  await fs.writeFile(packagePath(name, 'tsconfig.json'), JSON.stringify(newJson, null, 2), 'utf8')
}

async function addPackageToBaseTsConfig(name) {
  const path = packagePath('tsconfig.json')
  const oldJson = JSON.parse(await fs.readFile(path, 'utf8'))
  const newJson = {
    ...oldJson,
    references: [...oldJson.references, { path: `./${name}` }]
      .reduce((x, a) => (x.some(y => y.path === a.path) ? x : x.concat([a])), [])
      .sort((a, b) => a.path.localeCompare(b.path)),
  }
  await fs.writeFile(path, JSON.stringify(newJson, null, 2), 'utf8')
}

async function createPackageDir(name) {
  const path = packagePath(name)
  await fs.mkdir(path)
}

async function createSrcTemplate(name) {
  await fs.mkdir(packagePath(name, 'src'))
  await fs.writeFile(packagePath(name, 'src', 'index.ts'), 'export default {}', 'utf8')
}

async function main(argv = process.argv) {
  const name = argv[argv.length - 1]
  await createPackageDir(name)
  await createPackageJson(name)
  await createTsConfig(name)
  await addPackageToBaseTsConfig(name)
  await createSrcTemplate(name)
}

if (module.parent) {
  module.exports = main
} else {
  main().then(
    () => process.exit(0),
    err => {
      console.error(err)
      process.exit(1)
    },
  )
}
