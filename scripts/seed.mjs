// Popula o Supabase com a demonstração: contas demo, 16 lugares (Brasília, São Paulo e Belo Horizonte),
// metadados e fotos (supabase/seed-assets).
// Idempotente (pode rodar quantas vezes quiser). Uso: node scripts/seed.mjs
// Requer .env.seed (SUPABASE_URL + SUPABASE_SECRET_KEY) e as migrations 0001 a 0003 já aplicadas.
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
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
  meta: { role: 'user', name: 'Ana Souza', age: 27, gender: 'F', city: 'Brasília, DF' },
};

// Bar do Zé pertence a uma conta demo (dá para entrar como dono); os demais são lugares "só de seed" (owner_id nulo).
const PLACES = [
  {
    slug: 'bar-do-ze',
    ownerEmail: 'bardoze@boraonde.demo',
    name: 'Bar do Zé',
    cep: '70239510',
    city: 'Brasília, DF',
    neighborhood: 'Asa Sul',
    street: 'CLS 405',
    number: 'Loja 12',
    metadata: { type: 'bar', specialties: ['cocktails'], vibes: ['friends', 'romantic'], atmospheres: ['lively'], sells_alcohol: true },
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    slug: 'cafe-grao-fino',
    name: 'Café Grão Fino',
    cep: '70844520',
    city: 'Brasília, DF',
    neighborhood: 'Asa Norte',
    street: 'CLN 207',
    number: 'Bloco B',
    metadata: { type: 'cafe', specialties: ['specialty_coffee', 'bakery'], vibes: ['family', 'friends', 'solo', 'work'], atmospheres: ['calm'], sells_alcohol: false },
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    slug: 'cantina-da-nonna',
    name: 'Cantina da Nonna',
    cep: '70673410',
    city: 'Brasília, DF',
    neighborhood: 'Sudoeste',
    street: 'CLSW 103',
    number: 'Bloco A',
    metadata: { type: 'restaurant', specialties: ['italian'], vibes: ['family', 'romantic', 'group'], atmospheres: ['calm'], sells_alcohol: true },
  },
  {
    id: '00000000-0000-4000-8000-000000000004',
    slug: 'boteco-esquina',
    name: 'Boteco Esquina',
    cep: '70350530',
    city: 'Brasília, DF',
    neighborhood: 'Asa Sul',
    street: 'CRS 506',
    number: 'Bloco C',
    metadata: { type: 'bar', specialties: ['pub', 'brewery'], vibes: ['friends', 'group'], atmospheres: ['lively', 'outdoor'], sells_alcohol: true },
  },
  // ── extras: dão resultado a todas as combinações do questionário em Brasília e permitem trocar de cidade ──
  {
    id: '00000000-0000-4000-8000-000000000005',
    slug: 'atelie-do-cafe',
    name: 'Ateliê do Café',
    cep: '71635150',
    city: 'Brasília, DF',
    neighborhood: 'Lago Sul',
    street: 'SHIS QI 15',
    number: 'Lote 8',
    metadata: { type: 'cafe', specialties: ['specialty_coffee', 'sweets'], vibes: ['romantic', 'friends', 'solo'], atmospheres: ['calm'], sells_alcohol: false },
  },
  {
    id: '00000000-0000-4000-8000-000000000006',
    slug: 'raizes',
    name: 'Raízes',
    cep: '70765540',
    city: 'Brasília, DF',
    neighborhood: 'Asa Norte',
    street: 'SCLN 312',
    number: 'Bloco D',
    metadata: { type: 'restaurant', specialties: ['brazilian'], vibes: ['friends', 'family', 'group'], atmospheres: ['lively', 'outdoor'], sells_alcohol: true },
  },
  {
    id: '00000000-0000-4000-8000-000000000007',
    slug: 'taberna-do-barao',
    name: 'Taberna do Barão',
    cep: '70673010',
    city: 'Brasília, DF',
    neighborhood: 'Sudoeste',
    street: 'CLSW 301',
    number: 'Bloco B',
    metadata: { type: 'bar', specialties: ['wine'], vibes: ['romantic', 'solo'], atmospheres: ['calm'], sells_alcohol: true },
  },
  {
    id: '00000000-0000-4000-8000-000000000008',
    slug: 'quintal-da-vo',
    name: 'Quintal da Vó',
    cep: '71503505',
    city: 'Brasília, DF',
    neighborhood: 'Lago Norte',
    street: 'SHIN CA 5',
    number: 'Lote 10',
    metadata: { type: 'restaurant', specialties: ['brazilian'], vibes: ['family'], atmospheres: ['calm', 'outdoor'], sells_alcohol: false },
  },
  // ── restaurantes por especialidade: cada tipo de comida do questionário tem ao menos um lugar em Brasília ──
  {
    id: '00000000-0000-4000-8000-000000000013',
    slug: 'sakura-sushi-bar',
    name: 'Sakura Sushi Bar',
    cep: '70293510',
    city: 'Brasília, DF',
    neighborhood: 'Asa Sul',
    street: 'CLS 214',
    number: 'Bloco A',
    metadata: { type: 'restaurant', specialties: ['japanese'], vibes: ['romantic', 'friends', 'solo', 'work'], atmospheres: ['calm'], sells_alcohol: true },
  },
  {
    id: '00000000-0000-4000-8000-000000000014',
    slug: 'casa-jalisco',
    name: 'Casa Jalisco',
    cep: '70856530',
    city: 'Brasília, DF',
    neighborhood: 'Asa Norte',
    street: 'CLN 408',
    number: 'Bloco C',
    metadata: { type: 'restaurant', specialties: ['mexican'], vibes: ['friends', 'group'], atmospheres: ['lively'], sells_alcohol: true },
  },
  {
    id: '00000000-0000-4000-8000-000000000015',
    slug: 'sahtein',
    name: 'Sahtein',
    cep: '71625205',
    city: 'Brasília, DF',
    neighborhood: 'Lago Sul',
    street: 'SHIS QI 11',
    number: 'Bloco F',
    metadata: { type: 'restaurant', specialties: ['arab'], vibes: ['family', 'friends', 'group'], atmospheres: ['outdoor', 'calm'], sells_alcohol: true },
  },
  {
    id: '00000000-0000-4000-8000-000000000016',
    slug: 'cerrado-burger',
    name: 'Cerrado Burger',
    cep: '70670522',
    city: 'Brasília, DF',
    neighborhood: 'Sudoeste',
    street: 'CLSW 102',
    number: 'Bloco B',
    metadata: { type: 'restaurant', specialties: ['burger'], vibes: ['friends', 'family', 'group', 'solo'], atmospheres: ['lively'], sells_alcohol: true },
  },
  {
    id: '00000000-0000-4000-8000-000000000009',
    slug: 'paulista-bistro',
    name: 'Paulista Bistrô',
    cep: '01310200',
    city: 'São Paulo, SP',
    neighborhood: 'Bela Vista',
    street: 'Avenida Paulista',
    number: '1500',
    metadata: { type: 'restaurant', specialties: [], vibes: ['romantic', 'friends', 'work'], atmospheres: ['calm'], sells_alcohol: true },
  },
  {
    id: '00000000-0000-4000-8000-000000000010',
    slug: 'bar-sampa',
    name: 'Bar Sampa',
    cep: '05433010',
    city: 'São Paulo, SP',
    neighborhood: 'Vila Madalena',
    street: 'Rua Aspicuelta',
    number: '120',
    metadata: { type: 'bar', specialties: ['pub', 'cocktails'], vibes: ['friends', 'group'], atmospheres: ['lively'], sells_alcohol: true },
  },
  {
    id: '00000000-0000-4000-8000-000000000011',
    slug: 'cafe-mineiro',
    name: 'Café Mineiro',
    cep: '30130151',
    city: 'Belo Horizonte, MG',
    neighborhood: 'Savassi',
    street: 'Rua Pernambuco',
    number: '1000',
    metadata: { type: 'cafe', specialties: ['specialty_coffee', 'bakery'], vibes: ['family', 'friends', 'work'], atmospheres: ['calm'], sells_alcohol: false },
  },
  {
    id: '00000000-0000-4000-8000-000000000012',
    slug: 'pe-de-moleque',
    name: 'Pé de Moleque',
    cep: '30140100',
    city: 'Belo Horizonte, MG',
    neighborhood: 'Funcionários',
    street: 'Rua Cláudio Manoel',
    number: '500',
    metadata: { type: 'bar', specialties: ['pub'], vibes: ['friends', 'group'], atmospheres: ['lively', 'outdoor'], sells_alcohol: true },
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

// Sobe as fotos `{slug}-{n}.jpg` de supabase/seed-assets (n = 1 é a capa; em ordem numérica). Créditos: CREDITS.md.
async function uploadPhotos(slug) {
  const dir = join(root, 'supabase', 'seed-assets');
  const files = (await readdir(dir))
    .filter((f) => new RegExp(`^${slug}-\\d+\\.jpg$`).test(f))
    .sort((a, b) => parseInt(a.match(/-(\d+)\.jpg$/)[1]) - parseInt(b.match(/-(\d+)\.jpg$/)[1]));
  if (files.length === 0) check({ message: `nenhuma foto em seed-assets para "${slug}"` }, 'fotos');

  const paths = [];
  for (const file of files) {
    const body = await readFile(join(dir, file));
    // O hash do conteúdo entra no nome: trocar a foto muda a URL, o que invalida o cache do CDN (max-age) e o cache
    // em disco do expo-image no aparelho (que é por URL). Por isso o arquivo é imutável e pode ficar em cache por 1 ano.
    const hash = createHash('sha1').update(body).digest('hex').slice(0, 8);
    const path = `seed/${file.replace(/\.jpg$/, '')}-${hash}.jpg`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
      contentType: 'image/jpeg',
      cacheControl: '31536000',
      upsert: true,
    });
    check(error, `upload ${path}`);
    paths.push(path);
  }
  return paths;
}

// Remove de seed/ os arquivos que nenhum lugar referencia mais (nomes antigos, sem hash, ou fotos trocadas).
async function pruneSeedPhotos(keep) {
  const { data, error } = await supabase.storage.from(BUCKET).list('seed', { limit: 1000 });
  check(error, 'listar seed/');
  const stale = data.map((f) => `seed/${f.name}`).filter((p) => !keep.has(p));
  if (stale.length) {
    const { error: rmError } = await supabase.storage.from(BUCKET).remove(stale);
    check(rmError, 'remover fotos antigas');
  }
  return stale.length;
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
const keepPhotos = new Set();
for (const place of PLACES) {
  const photos = await uploadPhotos(place.slug);
  photos.forEach((p) => keepPhotos.add(p));
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

// Só depois dos upserts (os lugares já apontam para os novos nomes) é seguro apagar os antigos.
const pruned = await pruneSeedPhotos(keepPhotos);
console.log(`✓ fotos: ${keepPhotos.size} em seed/ (${pruned} antigas removidas)`);

console.log(`\nPronto. Senha das contas demo: ${PASSWORD}`);
