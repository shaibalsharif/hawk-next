/**
 * Uploads all ASSETS to UploadThing and seeds the portfolio DB.
 * Run from project root: node scripts/seed-portfolio.mjs
 *
 * Saves uploaded URLs to scripts/upload-cache.json so you can
 * re-run the DB seeding without re-uploading if needed.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs'
import { resolve, join, basename } from 'path'

// ── Load .env.local ───────────────────────────────────────────────────────────
try {
  const env = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8')
  for (const line of env.split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const idx = t.indexOf('=')
    if (idx === -1) continue
    const key = t.slice(0, idx).trim()
    let val = t.slice(idx + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1)
    val = val.replace(/\\n/g, '\n')
    if (!process.env[key]) process.env[key] = val
  }
} catch { /* vars already set */ }

import { UTApi } from 'uploadthing/server'
import { PrismaClient } from '@prisma/client'

const utapi = new UTApi({ token: process.env.UPLOADTHING_TOKEN })
const prisma = new PrismaClient()

const ASSETS   = resolve(process.cwd(), 'ASSETS')
const CACHE    = resolve(process.cwd(), 'scripts/upload-cache.json')

// ── Upload cache (skip already-uploaded files) ────────────────────────────────
const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf-8')) : {}
function saveCache() { writeFileSync(CACHE, JSON.stringify(cache, null, 2)) }

// ── Helpers ───────────────────────────────────────────────────────────────────
function files(folder) {
  const dir = join(ASSETS, folder)
  return readdirSync(dir)
    .filter(f => /\.(jpg|jpeg|mp4)$/i.test(f))
    .sort()
    .map(f => join(dir, f))
}

function mediaMeta(entry) {
  const isVideo = entry.name?.toLowerCase().endsWith('.mp4')
  return {
    type: 'uploadthing',
    url: entry.url,
    key: entry.key,
    mimeType: isVideo ? 'video/mp4' : 'image/jpeg',
  }
}

/** Upload a batch of file paths. Returns array of { key, url, name }. */
async function upload(filePaths, label) {
  const results = []
  const BATCH = 3

  for (let i = 0; i < filePaths.length; i += BATCH) {
    const batch = filePaths.slice(i, i + BATCH)
    const toUpload = []

    for (const fp of batch) {
      const name = basename(fp)
      if (cache[fp]) {
        console.log(`  [cached] ${name}`)
        results.push(cache[fp])
        continue
      }
      toUpload.push(fp)
    }

    if (toUpload.length === 0) continue

    const fileObjs = toUpload.map(fp => {
      const buf  = readFileSync(fp)
      const name = basename(fp)
      const mime = fp.toLowerCase().endsWith('.mp4') ? 'video/mp4' : 'image/jpeg'
      return new File([buf], name, { type: mime })
    })

    try {
      const raw = await utapi.uploadFiles(fileObjs)
      const arr = Array.isArray(raw) ? raw : [raw]

      for (let j = 0; j < arr.length; j++) {
        const r = arr[j]
        if (r?.data) {
          const entry = { key: r.data.key, url: r.data.ufsUrl ?? r.data.url, name: r.data.name }
          cache[toUpload[j]] = entry
          results.push(entry)
          console.log(`  ✓ ${r.data.name}`)
        } else {
          console.error(`  ✗ Failed: ${toUpload[j]} —`, r?.error?.message ?? 'unknown error')
        }
      }
      saveCache()
    } catch (err) {
      console.error(`  ✗ Batch error: ${err.message}`)
    }
  }

  console.log(`  → ${results.length}/${filePaths.length} files ready for [${label}]`)
  return results
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n══════════════════════════════════════════════')
  console.log('  HAWK CREATIVE STUDIOS — Content Seeding')
  console.log('══════════════════════════════════════════════\n')

  // ── 1. Upload all assets ──────────────────────────────────────────────────
  console.log('▶ Phase 1: Uploading assets to UploadThing\n')

  console.log('📷 Wedding Photos (18 JPG)...')
  const weddingPhotos = await upload(files('Wedding Photos'), 'Wedding Photos')

  console.log('\n🎬 Wedding Videos (4 MP4)...')
  const weddingVideos = await upload(files('Wedding Videos'), 'Wedding Videos')

  console.log('\n📷 TEKNAF (13 JPG)...')
  const teknafPhotos = await upload(files('TEKNAF'), 'TEKNAF')

  console.log('\n📷 Jahangirnagar University (13 JPG)...')
  const juPhotos = await upload(files('JAHANGIRNAGAR UNIVERSITY'), 'JU')

  console.log('\n📷 BUET (6 JPG)...')
  const buetPhotos = await upload(files('BUET'), 'BUET')

  console.log('\n📷 Aerial Shots (19 JPG)...')
  const aerialPhotos = await upload(files('Aerial Shots'), 'Aerial Shots')

  console.log('\n🎬 Aerial Videos (9 MP4)...')
  const aerialVideos = await upload(files('Aerial Videos'), 'Aerial Videos')

  console.log('\n🎬 Normal Videos (2 MP4)...')
  const normalVideos = await upload(files('Normal video'), 'Normal Videos')

  console.log('\n══ Upload complete. ══\n')

  // ── 2. Clear existing dummy portfolio data ────────────────────────────────
  console.log('▶ Phase 2: Clearing dummy portfolio data\n')

  await prisma.portfolioImage.deleteMany()
  await prisma.portfolioItem.deleteMany()
  await prisma.portfolioCategory.deleteMany()
  console.log('  ✓ Existing portfolio data cleared')

  // ── 3. Seed categories + items ────────────────────────────────────────────
  console.log('\n▶ Phase 3: Seeding portfolio\n')

  // ── Wedding ──────────────────────────────────────────────────────────────
  console.log('💍 Creating Wedding category...')
  const wedding = await prisma.portfolioCategory.create({
    data: {
      name: 'Wedding',
      details: 'Timeless wedding photography and cinematic films that preserve every emotion, every glance, and every moment of your most cherished day.',
      imageMeta: weddingPhotos.length ? mediaMeta(weddingPhotos[0]) : null,
      displayOrder: 1,
    },
  })

  // Wedding Photography item
  const weddingPhotoItem = await prisma.portfolioItem.create({
    data: {
      categoryId: wedding.id,
      title: 'Wedding Photography 2025',
      client: 'Private',
      year: 2025,
      role: 'Lead Photographer',
      coverMeta: weddingPhotos.length ? mediaMeta(weddingPhotos[0]) : null,
      description: 'A curated collection of wedding photographs capturing the raw emotion and quiet beauty of each celebration — from the nervous anticipation before the ceremony to the tearful exchange of vows and the joy of the reception.',
      takeaways: ['Candid Portraiture', 'Ceremony Coverage', 'Reception Highlights', 'Detail Shots', 'Golden Hour Portraits'],
      displayOrder: 1,
    },
  })
  for (let i = 0; i < weddingPhotos.length; i++) {
    await prisma.portfolioImage.create({
      data: { itemId: weddingPhotoItem.id, imageMeta: mediaMeta(weddingPhotos[i]), displayOrder: i },
    })
  }
  console.log(`  ✓ Wedding Photography — ${weddingPhotos.length} photos`)

  // Wedding Films item
  if (weddingVideos.length) {
    const weddingFilmItem = await prisma.portfolioItem.create({
      data: {
        categoryId: wedding.id,
        title: 'Wedding Films 2025',
        client: 'Private',
        year: 2025,
        role: 'Cinematographer & Editor',
        coverMeta: mediaMeta(weddingVideos[0]),
        description: 'Cinematic wedding films that go beyond documentation — weaving together stolen glances, whispered promises and dancing silhouettes into a story you will watch for a lifetime.',
        takeaways: ['Cinematic Storytelling', 'Same-Day Edit', 'Full Ceremony Film', 'Highlight Reel'],
        displayOrder: 2,
      },
    })
    // Additional wedding videos as gallery items
    for (let i = 1; i < weddingVideos.length; i++) {
      await prisma.portfolioImage.create({
        data: { itemId: weddingFilmItem.id, imageMeta: mediaMeta(weddingVideos[i]), displayOrder: i },
      })
    }
    console.log(`  ✓ Wedding Films — ${weddingVideos.length} videos`)
  }

  // ── Photography ──────────────────────────────────────────────────────────
  console.log('\n📸 Creating Photography category...')
  const photography = await prisma.portfolioCategory.create({
    data: {
      name: 'Photography',
      details: 'Documentary and editorial photography across Bangladesh — from the serene shores of Teknaf to the vibrant campuses of the nation\'s finest universities.',
      imageMeta: teknafPhotos.length ? mediaMeta(teknafPhotos[0]) : null,
      displayOrder: 2,
    },
  })

  // TEKNAF item
  if (teknafPhotos.length) {
    const teknafItem = await prisma.portfolioItem.create({
      data: {
        categoryId: photography.id,
        title: 'Teknaf',
        client: 'Personal Project',
        year: 2019,
        role: 'Photographer',
        coverMeta: mediaMeta(teknafPhotos[0]),
        description: 'A photographic journey through Teknaf — Bangladesh\'s southernmost tip where the Naf River meets the Bay of Bengal. These frames document the rugged coastal landscape, the fishing communities, and the quiet drama of life at the edge of the country.',
        takeaways: ['Documentary Photography', 'Landscape', 'Street Photography', 'Coastal Bangladesh'],
        displayOrder: 1,
      },
    })
    for (let i = 0; i < teknafPhotos.length; i++) {
      await prisma.portfolioImage.create({
        data: { itemId: teknafItem.id, imageMeta: mediaMeta(teknafPhotos[i]), displayOrder: i },
      })
    }
    console.log(`  ✓ TEKNAF — ${teknafPhotos.length} photos`)
  }

  // Jahangirnagar University item
  if (juPhotos.length) {
    const juItem = await prisma.portfolioItem.create({
      data: {
        categoryId: photography.id,
        title: 'Jahangirnagar University',
        client: 'Personal Project',
        year: 2019,
        role: 'Photographer',
        coverMeta: mediaMeta(juPhotos[0]),
        description: 'Jahangirnagar University — nestled in lush greenery on the outskirts of Dhaka — is one of Bangladesh\'s most picturesque campuses. This series captures its serene lakes, century-old trees, migratory birds and the everyday life of its students.',
        takeaways: ['Campus Photography', 'Nature & Wildlife', 'Architectural Details', 'Student Life'],
        displayOrder: 2,
      },
    })
    for (let i = 0; i < juPhotos.length; i++) {
      await prisma.portfolioImage.create({
        data: { itemId: juItem.id, imageMeta: mediaMeta(juPhotos[i]), displayOrder: i },
      })
    }
    console.log(`  ✓ Jahangirnagar University — ${juPhotos.length} photos`)
  }

  // BUET item
  if (buetPhotos.length) {
    const buetItem = await prisma.portfolioItem.create({
      data: {
        categoryId: photography.id,
        title: 'BUET',
        client: 'Bangladesh University of Engineering & Technology',
        year: 2019,
        role: 'Photographer',
        coverMeta: mediaMeta(buetPhotos[0]),
        description: 'An intimate portrait of BUET — Bangladesh\'s premier engineering institution. The series explores the architecture, the late-night study sessions, and the quiet pride of a campus that has shaped generations of the country\'s brightest minds.',
        takeaways: ['Institutional Photography', 'Architectural Photography', 'Campus Life'],
        displayOrder: 3,
      },
    })
    for (let i = 0; i < buetPhotos.length; i++) {
      await prisma.portfolioImage.create({
        data: { itemId: buetItem.id, imageMeta: mediaMeta(buetPhotos[i]), displayOrder: i },
      })
    }
    console.log(`  ✓ BUET — ${buetPhotos.length} photos`)
  }

  // ── Aerial ────────────────────────────────────────────────────────────────
  console.log('\n🚁 Creating Aerial category...')
  const aerial = await prisma.portfolioCategory.create({
    data: {
      name: 'Aerial',
      details: 'Drone photography and cinematography revealing Bangladesh from perspectives the eye alone cannot reach — rivers, coastlines, cities and landscapes seen from above.',
      imageMeta: aerialPhotos.length ? mediaMeta(aerialPhotos[0]) : null,
      displayOrder: 3,
    },
  })

  // Aerial Photography item
  if (aerialPhotos.length) {
    const aerialPhotoItem = await prisma.portfolioItem.create({
      data: {
        categoryId: aerial.id,
        title: 'Aerial Photography',
        client: 'Various',
        year: 2020,
        role: 'Aerial Photographer',
        coverMeta: mediaMeta(aerialPhotos[0]),
        description: 'Bangladesh from above — a country of rivers, delta wetlands and dense urban fabric that only reveals its true scale and beauty from altitude. Shot across multiple locations, this series reframes the familiar into the extraordinary.',
        takeaways: ['Drone Photography', 'Landscape Aerial', 'Urban Aerial', 'Delta & Waterways'],
        displayOrder: 1,
      },
    })
    for (let i = 0; i < aerialPhotos.length; i++) {
      await prisma.portfolioImage.create({
        data: { itemId: aerialPhotoItem.id, imageMeta: mediaMeta(aerialPhotos[i]), displayOrder: i },
      })
    }
    console.log(`  ✓ Aerial Photography — ${aerialPhotos.length} photos`)
  }

  // Aerial Films item
  if (aerialVideos.length) {
    const aerialFilmItem = await prisma.portfolioItem.create({
      data: {
        categoryId: aerial.id,
        title: 'Aerial Cinematography',
        client: 'Various',
        year: 2020,
        role: 'Aerial Cinematographer',
        coverMeta: mediaMeta(aerialVideos[0]),
        description: 'Cinematic aerial footage that transforms Bangladesh\'s landscapes into sweeping visual poetry — gliding over rivers at golden hour, banking across coastal plains, and descending into the heartbeat of its cities.',
        takeaways: ['Drone Videography', 'Cinematic Grading', 'Aerial Storytelling', '4K Footage'],
        displayOrder: 2,
      },
    })
    for (let i = 1; i < aerialVideos.length; i++) {
      await prisma.portfolioImage.create({
        data: { itemId: aerialFilmItem.id, imageMeta: mediaMeta(aerialVideos[i]), displayOrder: i },
      })
    }
    console.log(`  ✓ Aerial Cinematography — ${aerialVideos.length} videos`)
  }

  // ── Cinematography ────────────────────────────────────────────────────────
  console.log('\n🎥 Creating Cinematography category...')
  const cinema = await prisma.portfolioCategory.create({
    data: {
      name: 'Cinematography',
      details: 'Narrative-driven films, brand stories and visual productions that move audiences — crafted frame by frame with intention, light and purpose.',
      imageMeta: normalVideos.length ? mediaMeta(normalVideos[0]) : null,
      displayOrder: 4,
    },
  })

  if (normalVideos.length) {
    const cinemaItem = await prisma.portfolioItem.create({
      data: {
        categoryId: cinema.id,
        title: 'Cinematic Productions',
        client: 'Various',
        year: 2024,
        role: 'Director of Photography',
        coverMeta: mediaMeta(normalVideos[0]),
        description: 'A selection of cinematic productions spanning brand films, documentary shorts and narrative pieces. Each project is approached with the same commitment: to find the visual language that tells the story only this subject can tell.',
        takeaways: ['Brand Films', 'Documentary', 'Colour Grading', 'Post Production'],
        displayOrder: 1,
      },
    })
    for (let i = 1; i < normalVideos.length; i++) {
      await prisma.portfolioImage.create({
        data: { itemId: cinemaItem.id, imageMeta: mediaMeta(normalVideos[i]), displayOrder: i },
      })
    }
    console.log(`  ✓ Cinematic Productions — ${normalVideos.length} videos`)
  }

  // ── FPV ───────────────────────────────────────────────────────────────────
  console.log('\n🔮 Creating FPV category...')
  await prisma.portfolioCategory.create({
    data: {
      name: 'FPV',
      details: 'First-person view freestyle drone flights — raw, immersive and adrenaline-charged. FPV cinematography that puts the viewer inside the machine.',
      imageMeta: null,
      displayOrder: 5,
    },
  })
  console.log('  ✓ FPV category created (ready for future content)')

  // ── Done ──────────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════')
  console.log('  ✅ Portfolio seeding complete!')
  console.log('══════════════════════════════════════════════')

  const stats = await prisma.portfolioCategory.findMany({ include: { items: { include: { _count: { select: { images: true } } } } } })
  console.log('\nSummary:')
  for (const cat of stats) {
    console.log(`  ${cat.name} (${cat.items.length} items)`)
    for (const item of cat.items) {
      console.log(`    └─ ${item.title} — ${item._count.images} gallery files`)
    }
  }

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error('\n✗ Fatal error:', e.message)
  await prisma.$disconnect()
  process.exit(1)
})
