import { Buffer } from 'node:buffer'
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import process from 'node:process'

const ROOT = join(import.meta.dirname, '..')

const TARBALL_URL = 'https://registry.npmjs.org/@ar-js-org/ar.js/-/ar.js-3.4.8.tgz'

const GITHUB_RAW = 'https://raw.githubusercontent.com/nicolocarpignoli/AR.js/master/data/data'

const ENTRIES = [
  {
    name: 'ar-threex.mjs',
    dest: 'src/vendor/ar-js/ar-threex.mjs',
    fetch: async (tmpDir) => {
      const res = await fetch(TARBALL_URL)
      if (!res.ok)
        throw new Error(`HTTP ${res.status} ${res.statusText}`)
      const buf = Buffer.from(await res.arrayBuffer())
      const tgz = join(tmpDir, 'archive.tgz')
      writeFileSync(tgz, buf)

      execSync(`tar xzf "${tgz}" -C "${tmpDir}" package/three.js/build/ar-threex.mjs`, { stdio: 'pipe' })

      return readFile(join(tmpDir, 'package/three.js/build/ar-threex.mjs'))
    },
  },
  {
    name: 'camera_para.dat',
    dest: 'public/ar-js/camera_para.dat',
    fetch: async () => {
      const res = await fetch(`${GITHUB_RAW}/camera_para.dat`)
      if (!res.ok)
        throw new Error(`HTTP ${res.status} ${res.statusText}`)
      return Buffer.from(await res.arrayBuffer())
    },
  },
  {
    name: 'patt.hiro',
    dest: 'public/ar-js/patt.hiro',
    fetch: async () => {
      const res = await fetch(`${GITHUB_RAW}/patt.hiro`)
      if (!res.ok)
        throw new Error(`HTTP ${res.status} ${res.statusText}`)
      return Buffer.from(await res.arrayBuffer())
    },
  },
  {
    name: 'patt.kanji',
    dest: 'public/ar-js/patt.kanji',
    fetch: async () => {
      const res = await fetch(`${GITHUB_RAW}/patt.kanji`)
      if (!res.ok)
        throw new Error(`HTTP ${res.status} ${res.statusText}`)
      return Buffer.from(await res.arrayBuffer())
    },
  },
]

const force = process.argv.includes('--force')
let hasError = false

for (const entry of ENTRIES) {
  const absPath = join(ROOT, entry.dest)

  if (!force && existsSync(absPath)) {
    console.log(`  ✓ ${entry.name} — already exists (use --force to re-download)`)
    continue
  }

  const tmpDir = await mkdtemp(join(tmpdir(), 'ar-assets-'))
  try {
    process.stdout.write(`  ↓ ${entry.name} — downloading...`)
    mkdirSync(dirname(absPath), { recursive: true })

    const data = await entry.fetch(tmpDir)
    writeFileSync(absPath, data)
    console.log(` done (${data.length} bytes)`)
  }
  catch (err) {
    console.error(` FAILED`)
    console.error(`    ${err instanceof Error ? err.message : String(err)}`)
    hasError = true
  }
  finally {
    await rm(tmpDir, { recursive: true, force: true })
  }
}

if (hasError)
  process.exit(1)
