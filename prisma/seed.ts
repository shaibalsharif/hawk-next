/**
 * Prisma seed — pre-populates the DB with real content from the
 * original hawk_beta app (YouTube IDs, team members, portfolio
 * categories, etc.) plus sensible placeholder text for everything
 * that was stored in Firestore only.
 *
 * Run:  npx prisma db seed
 */
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()
const JsonNull = Prisma.JsonNull

async function main() {
  console.log('🌱 Seeding database …')

  // ── Home slides (exact YouTube IDs from data.js) ─────────────
  await prisma.homeSlide.deleteMany()
  await prisma.homeSlide.createMany({
    data: [
      {
        videoId: 'F982x43JYH8',
        title: 'HAWK CREATIVE STUDIOS',
        subtitle: 'WE CREATE VISUAL STORIES',
        category: 'FPV CINEMATOGRAPHY',
        order: 0,
      },
      {
        videoId: 'NcBjx_eyvxc',
        title: 'VISUAL STORYTELLING',
        subtitle: 'CAPTURING THE UNSEEN',
        category: 'PHOTOGRAPHY',
        order: 1,
      },
      {
        videoId: '5xqgvRIUffI',
        title: 'BEYOND THE LENS',
        subtitle: 'AERIAL & GROUND PERSPECTIVES',
        category: 'AERIAL PHOTOGRAPHY',
        order: 2,
      },
    ],
  })
  console.log('  ✓ HomeSlides')

  // ── About cover ──────────────────────────────────────────────
  await prisma.aboutCover.upsert({
    where: { id: 'singleton' },
    create: {
      id: 'singleton',
      title: 'WHO WE ARE',
      sub: 'A Creative Studio Driven by Passion',
      points: [
        'Visual storytelling at its finest',
        'FPV, aerial & ground cinematography',
        'Photography & post-production',
      ],
      imageMeta: JsonNull,
    },
    update: {},
  })

  // ── About inner page ─────────────────────────────────────────
  await prisma.aboutInner.upsert({
    where: { id: 'singleton' },
    create: {
      id: 'singleton',
      title: 'OUR STORY',
      description:
        'Hawk Creative Studios is a full-service visual media company based in Bangladesh. We specialize in FPV cinematography, aerial photography, product videography, and brand storytelling. Our team of passionate creators brings every vision to life through cutting-edge technology and artistic precision.',
    },
    update: {},
  })

  // ── Team members (exact names & positions from data.js) ──────
  await prisma.teamMember.deleteMany()
  const members = [
    {
      name: 'Jabir F Jaman',
      position: 'DOP & Content Planner',
      imageMeta: { type: 'url', url: '/images/jabir.jpg' },
      displayOrder: 0,
    },
    {
      name: 'Ahmed Arif',
      position: 'Business Developer & Photographer',
      imageMeta: { type: 'url', url: '/images/ahmed.jpg' },
      displayOrder: 1,
    },
    {
      name: 'M Samun Sakib',
      position: 'Photographer & Logistics',
      imageMeta: { type: 'url', url: '/images/m.jpg' },
      displayOrder: 2,
    },
    {
      name: 'Rafiz Imtiaz',
      position: 'Cinematographer & Editor',
      imageMeta: { type: 'url', url: '/images/rafiz.jpg' },
      displayOrder: 3,
    },
    {
      name: 'Rakibul Islam',
      position: 'Web Developer',
      imageMeta: { type: 'url', url: '/images/rakibul.jpg' },
      displayOrder: 4,
    },
  ]
  for (const m of members) {
    await prisma.teamMember.create({ data: m })
  }
  console.log('  ✓ TeamMembers')

  // ── Services cover ───────────────────────────────────────────
  await prisma.servicesCover.upsert({
    where: { id: 'singleton' },
    create: {
      id: 'singleton',
      title: 'WHAT WE DO',
      sub: 'Comprehensive visual media services',
      imageMeta: { type: 'youtube', url: 'F982x43JYH8' },
    },
    update: {},
  })

  // ── Services inner page ──────────────────────────────────────
  await prisma.servicesInner.upsert({
    where: { id: 'singleton' },
    create: {
      id: 'singleton',
      title: 'OUR SERVICES',
      sub: 'We offer a complete suite of visual production services',
      details:
        'From concept to final delivery, Hawk Creative Studios handles every aspect of your visual media needs. Our integrated approach ensures consistency and quality across all deliverables.',
      imageMeta: JsonNull,
    },
    update: {},
  })

  // ── Service items ────────────────────────────────────────────
  await prisma.serviceItem.deleteMany()
  const services = [
    {
      name: 'FPV Cinematography',
      details:
        'High-speed, immersive drone footage that puts viewers inside the action. Perfect for sports, events, and architectural walkthroughs.',
      imageMeta: { type: 'url', url: '/images/portfolio/portfolio1.jpg' },
      displayOrder: 0,
    },
    {
      name: 'Photography',
      details:
        'Commercial, product, and editorial photography with a keen eye for composition and light.',
      imageMeta: { type: 'url', url: '/images/portfolio/portfolio2.jpg' },
      displayOrder: 1,
    },
    {
      name: 'Aerial Photography',
      details:
        'Licensed drone pilots delivering sweeping aerial perspectives for real estate, events, and film.',
      imageMeta: { type: 'url', url: '/images/portfolio/portfolio3.jpg' },
      displayOrder: 2,
    },
    {
      name: 'Video Production',
      details:
        'Full-service video production from scripting and shooting to editing and colour grading.',
      imageMeta: { type: 'url', url: '/images/portfolio/portfolio4.jpg' },
      displayOrder: 3,
    },
  ]
  for (const s of services) {
    await prisma.serviceItem.create({ data: s })
  }
  console.log('  ✓ ServiceItems')

  // ── Client items ─────────────────────────────────────────────
  await prisma.clientItem.deleteMany()
  const clients = [
    { name: 'Client A', imageMeta: JsonNull, displayOrder: 0 },
    { name: 'Client B', imageMeta: JsonNull, displayOrder: 1 },
    { name: 'Client C', imageMeta: JsonNull, displayOrder: 2 },
    { name: 'Client D', imageMeta: JsonNull, displayOrder: 3 },
    { name: 'Client E', imageMeta: JsonNull, displayOrder: 4 },
    { name: 'Client F', imageMeta: JsonNull, displayOrder: 5 },
  ]
  for (const c of clients) {
    await prisma.clientItem.create({ data: c })
  }
  console.log('  ✓ ClientItems')

  // ── Portfolio categories (from data.js) ─────────────────────
  await prisma.portfolioImage.deleteMany()
  await prisma.portfolioItem.deleteMany()
  await prisma.portfolioCategory.deleteMany()

  const photography = await prisma.portfolioCategory.create({
    data: {
      name: 'Photography',
      details: 'Commercial and editorial photography',
      imageMeta: { type: 'url', url: '/images/portfolio/portfolio4.jpg' },
      displayOrder: 0,
    },
  })

  const cinematography = await prisma.portfolioCategory.create({
    data: {
      name: 'Cinematography',
      details: 'Cinematic video production',
      imageMeta: { type: 'url', url: '/images/portfolio/portfolio3.jpg' },
      displayOrder: 1,
    },
  })

  const aerial = await prisma.portfolioCategory.create({
    data: {
      name: 'Aerial',
      details: 'Drone and aerial photography',
      imageMeta: { type: 'url', url: '/images/portfolio/portfolio2.jpg' },
      displayOrder: 2,
    },
  })

  const fpv = await prisma.portfolioCategory.create({
    data: {
      name: 'FPV',
      details: 'First-person view drone footage',
      imageMeta: { type: 'url', url: '/images/portfolio/portfolio1.jpg' },
      displayOrder: 3,
    },
  })

  // Portfolio items under Photography
  const photoItem1 = await prisma.portfolioItem.create({
    data: {
      categoryId: photography.id,
      title: 'Commercial Brand Shoot',
      client: 'Yolo Schlitz',
      year: 2023,
      role: 'Commercial Photography',
      coverMeta: { type: 'url', url: '/images/portfolio/portfolio-cover-1.jpeg' },
      description:
        'A high-end commercial shoot capturing the essence of the brand through dynamic compositions and expert lighting.',
      takeaways: ['Brand Identity', 'Product Photography', 'Creative Direction', 'Post-Production'],
      displayOrder: 0,
    },
  })
  await prisma.portfolioImage.createMany({
    data: [
      { itemId: photoItem1.id, imageMeta: { type: 'url', url: '/images/portfolio/nest-1-1.jpeg' }, displayOrder: 0 },
      { itemId: photoItem1.id, imageMeta: { type: 'url', url: '/images/portfolio/nest-1-2.jpeg' }, displayOrder: 1 },
      { itemId: photoItem1.id, imageMeta: { type: 'url', url: '/images/portfolio/nest-1-3.jpeg' }, displayOrder: 2 },
      { itemId: photoItem1.id, imageMeta: { type: 'url', url: '/images/portfolio/nest-1-4.jpeg' }, displayOrder: 3 },
    ],
  })

  await prisma.portfolioItem.create({
    data: {
      categoryId: photography.id,
      title: 'Editorial Fashion Shoot',
      client: 'Fashion House',
      year: 2023,
      role: 'Editorial Photography',
      coverMeta: { type: 'url', url: '/images/portfolio/cover1.jpeg' },
      description: 'A striking editorial fashion series exploring texture and movement.',
      takeaways: ['Editorial', 'Fashion', 'Styling', 'Retouching'],
      displayOrder: 1,
    },
  })

  // Portfolio items under Cinematography
  await prisma.portfolioItem.create({
    data: {
      categoryId: cinematography.id,
      title: 'Brand Story Film',
      client: 'Corporate Client',
      year: 2024,
      role: 'Director / DOP',
      coverMeta: { type: 'youtube', url: 'NcBjx_eyvxc' },
      description: 'A cinematic brand film that communicates the company\'s vision and values.',
      takeaways: ['Storytelling', 'Colour Grading', 'Motion Graphics', 'Sound Design'],
      displayOrder: 0,
    },
  })

  // Portfolio items under Aerial
  await prisma.portfolioItem.create({
    data: {
      categoryId: aerial.id,
      title: 'Real Estate Showcase',
      client: 'Property Developer',
      year: 2024,
      role: 'Aerial Cinematographer',
      coverMeta: { type: 'youtube', url: '5xqgvRIUffI' },
      description: 'Sweeping aerial coverage of a premium real estate development.',
      takeaways: ['Real Estate', 'Aerial', 'Licensed Pilot', 'Post-Production'],
      displayOrder: 0,
    },
  })

  // Portfolio items under FPV
  await prisma.portfolioItem.create({
    data: {
      categoryId: fpv.id,
      title: 'FPV Event Coverage',
      client: 'Sports Brand',
      year: 2024,
      role: 'FPV Pilot & Editor',
      coverMeta: { type: 'youtube', url: 'F982x43JYH8' },
      description: 'High-energy FPV footage capturing the raw excitement of live events.',
      takeaways: ['FPV', 'Event Coverage', 'Action Sports', 'Dynamic Editing'],
      displayOrder: 0,
    },
  })

  console.log('  ✓ Portfolio categories & items')

  // ── Contact cover ────────────────────────────────────────────
  await prisma.contactCover.upsert({
    where: { id: 'singleton' },
    create: {
      id: 'singleton',
      title: 'GET IN TOUCH',
      sub: 'Let\'s create something extraordinary together',
    },
    update: {},
  })

  // ── Contact items ────────────────────────────────────────────
  await prisma.contactItem.deleteMany()
  await prisma.contactItem.createMany({
    data: [
      { type: 'EMAIL', value: 'hello@hawkcreativestudios.com', displayOrder: 0 },
      { type: 'PHONE', value: '+880 1700 000000', displayOrder: 1 },
      { type: 'ADDRESS', value: 'Dhaka, Bangladesh', displayOrder: 2 },
    ],
  })

  // ── Social links (from data.js) ──────────────────────────────
  await prisma.socialLink.deleteMany()
  await prisma.socialLink.createMany({
    data: [
      { platform: 'Instagram', url: 'https://instagram.com/hawkcreativestudios', displayOrder: 0 },
      { platform: 'Facebook', url: 'https://facebook.com/hawkcreativestudios', displayOrder: 1 },
      { platform: 'Vimeo', url: 'https://vimeo.com/hawkcreativestudios', displayOrder: 2 },
      { platform: 'Behance', url: 'https://behance.net/hawkcreativestudios', displayOrder: 3 },
      { platform: 'YouTube', url: 'https://youtube.com/@hawkcreativestudios', displayOrder: 4 },
    ],
  })

  console.log('  ✓ Contact & Social')
  console.log('\n✅ Seed complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
