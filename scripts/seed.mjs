import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const USERS = [
  { email: 'seller1@test.com',  name: 'สมชาย ใจดี',      password: 'test1234' },
  { email: 'seller2@test.com',  name: 'สุดา ค้าขาย',     password: 'test1234' },
  { email: 'seller3@test.com',  name: 'วิชัย ร้านดัง',    password: 'test1234' },
  { email: 'buyer1@test.com',   name: 'นภา ซื้อดี',       password: 'test1234' },
  { email: 'buyer2@test.com',   name: 'ปรีชา ชอบซื้อ',    password: 'test1234' },
  { email: 'buyer3@test.com',   name: 'มาลี ลูกค้า',      password: 'test1234' },
  { email: 'user4@test.com',    name: 'อรุณ ทดสอบ',       password: 'test1234' },
  { email: 'user5@test.com',    name: 'กาญจนา ทั่วไป',    password: 'test1234' },
  { email: 'admin@test.com',    name: 'แอดมิน ระบบ',      password: 'test1234', isAdmin: true },
  { email: 'demo@test.com',     name: 'ดีโม่ โชว์',       password: 'test1234' },
]

async function main() {
  console.log('🌱 Seeding 10 mock users...\n')

  for (const u of USERS) {
    // Insert into auth.users (Supabase Auth) — uses pgcrypto for bcrypt
    await prisma.$executeRawUnsafe(`
      INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password,
        email_confirmed_at, raw_user_meta_data,
        created_at, updated_at,
        confirmation_token, recovery_token, email_change_token_new, email_change
      )
      SELECT
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        '${u.email}',
        crypt('${u.password}', gen_salt('bf', 10)),
        now(),
        '{"name": "${u.name}"}'::jsonb,
        now(), now(),
        '', '', '', ''
      WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = '${u.email}')
    `)
    console.log(`  ✓  ${u.email}  (${u.name})`)
  }

  // Set admin flag
  await prisma.$executeRawUnsafe(`
    UPDATE profiles
    SET is_admin = true
    WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@test.com')
  `)
  console.log('\n  🔑 admin@test.com → is_admin = true')

  console.log('\n✅ Done! All users created with password: test1234')
  console.log('\nUser list:')
  USERS.forEach(u => console.log(`  ${u.email.padEnd(25)} password: ${u.password}`))
}

main()
  .catch(e => { console.error('❌ Error:', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
