// Popula o Supabase com a demonstração: contas demo, 4 lugares de Campinas, metadados e fotos.
// Idempotente (pode rodar quantas vezes quiser). Uso: node scripts/seed.mjs
// Requer .env.seed (SUPABASE_URL + SUPABASE_SECRET_KEY) e a migration 0001 já aplicada.
import { createClient } from '@supabase/supabase-js';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

try {
  process.loadEnvFile(join(root, '.env.seed'));
} catch {
  console.error('Arquivo .env.seed não encontrado. Copie .env.seed.example para .env.seed e preencha.');
  process.exit(1);
}

const { SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error('Defina SUPABASE_URL e SUPABASE_SECRET_KEY em .env.seed.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const BUCKET = 'place-photos';
const PASSWORD = 'demo12345';

const DEMO_USER = {
  email: 'ana@boraonde.demo',
  meta: { role: 'user', name: 'Ana Souza', age: 27, gender: 'F', city: 'Campinas, SP' },
};

// Bar do Zé pertence a uma conta demo (dá para entrar como dono); os demais são lugares "só de seed" (owner_id nulo).
const PLACES = [
  {
    slug: 'bar-do-ze',
    ownerEmail: 'bardoze@boraonde.demo',
    name: 'Bar do Zé',
    cep: '13025151',
    city: 'Campinas, SP',
    neighborhood: 'Cambuí',
    street: 'Rua Maria Monteiro',
    number: '820',
    metadata: { type: 'bar', vibes: ['friends', 'romantic'], sells_alcohol: true },
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    slug: 'cafe-grao-fino',
    name: 'Café Grão Fino',
    cep: '13025000',
    city: 'Campinas, SP',
    neighborhood: 'Cambuí',
    street: 'Rua Coronel Quirino',
    number: '1250',
    metadata: { type: 'cafe', vibes: ['family', 'friends'], sells_alcohol: false },
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    slug: 'cantina-da-nonna',
    name: 'Cantina da Nonna',
    cep: '13015001',
    city: 'Campinas, SP',
    neighborhood: 'Centro',
    street: 'Rua Barão de Jaguara',
    number: '980',
    metadata: { type: 'restaurant', vibes: ['family', 'romantic'], sells_alcohol: true },
  },
  {
    id: '00000000-0000-4000-8000-000000000004',
    slug: 'boteco-esquina',
    name: 'Boteco Esquina',
    cep: '13025061',
    city: 'Campinas, SP',
    neighborhood: 'Cambuí',
    street: 'Avenida Júlio de Mesquita',
    number: '450',
    metadata: { type: 'bar', vibes: ['friends'], sells_alcohol: true },
  },
];

function check(error, what) {
  if (error) {
    console.error(`✗ ${what}: ${error.message}`);
    process.exit(1);
  }
}

// Cria a conta (o trigger do banco cria o perfil) ou, se já existir, devolve a existente.
async function ensureUser(email, meta) {
  const created = await supabase.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: meta,
  });
  if (!created.error) return created.data.user.id;

  if (!/already|registered|exists/i.test(created.error.message)) check(created.error, `criar ${email}`);
  for (let page = 1; page < 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    check(error, 'listar usuários');
    const found = data.users.find((u) => u.email === email);
    if (found) {
      await supabase.auth.admin.updateUserById(found.id, { password: PASSWORD, user_metadata: meta });
      return found.id;
    }
    if (data.users.length < 200) break;
  }
  console.error(`✗ conta ${email} existe mas não foi encontrada`);
  process.exit(1);
}

async function uploadPhotos(slug) {
  const paths = [];
  for (const n of [1, 2, 3]) {
    const file = join(root, 'supabase', 'seed-assets', `${slug}-${n}.jpg`);
    const path = `seed/${slug}-${n}.jpg`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, await readFile(file), {
      contentType: 'image/jpeg',
      upsert: true,
    });
    check(error, `upload ${path}`);
    paths.push(path);
  }
  return paths;
}

// ── contas demo ──
const anaId = await ensureUser(DEMO_USER.email, DEMO_USER.meta);
{
  // Garante o perfil mesmo se a conta já existia sem ele.
  const { error } = await supabase.from('users').upsert({ id: anaId, ...pick(DEMO_USER.meta, ['name', 'age', 'gender', 'city']) });
  check(error, 'perfil da Ana');
}
console.log(`✓ usuário demo: ${DEMO_USER.email}`);

function pick(obj, keys) {
  return Object.fromEntries(keys.map((k) => [k, obj[k]]));
}

// ── lugares ──
for (const place of PLACES) {
  const photos = await uploadPhotos(place.slug);
  const base = {
    name: place.name,
    cep: place.cep,
    city: place.city,
    neighborhood: place.neighborhood,
    street: place.street,
    number: place.number,
    photos,
  };

  let establishmentId;
  if (place.ownerEmail) {
    const ownerId = await ensureUser(place.ownerEmail, {
      role: 'establishment',
      name: place.name,
      cep: place.cep,
      city: place.city,
      neighborhood: place.neighborhood,
      street: place.street,
      number: place.number,
    });
    const { data, error } = await supabase
      .from('establishments')
      .upsert({ owner_id: ownerId, ...base }, { onConflict: 'owner_id' })
      .select('id')
      .single();
    check(error, `lugar ${place.name}`);
    establishmentId = data.id;
  } else {
    const { error } = await supabase.from('establishments').upsert({ id: place.id, owner_id: null, ...base });
    check(error, `lugar ${place.name}`);
    establishmentId = place.id;
  }

  const { error } = await supabase.from('establishment_metadata').upsert({ establishment_id: establishmentId, ...place.metadata });
  check(error, `metadados de ${place.name}`);
  console.log(`✓ ${place.name}${place.ownerEmail ? ` (dono: ${place.ownerEmail})` : ''}`);
}

console.log(`\nPronto. Senha das contas demo: ${PASSWORD}`);
