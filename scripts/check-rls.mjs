// Prova que o RLS funciona: com contas reais (publishable key), tenta o que NÃO deveria ser permitido.
// Uso (depois de seed.mjs): node scripts/check-rls.mjs   — requer SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY em .env.seed
import { createClient } from '@supabase/supabase-js';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
try {
  process.loadEnvFile(join(root, '.env.seed'));
} catch {
  console.error('.env.seed não encontrado.');
  process.exit(1);
}
const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error('Defina SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY em .env.seed.');
  process.exit(1);
}

const PASSWORD = 'demo12345';
const newClient = () => createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

async function login(email) {
  const client = newClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password: PASSWORD });
  if (error) throw new Error(`login ${email}: ${error.message}`);
  return { client, uid: data.user.id };
}

const results = [];
const expect = (name, ok, detail = '') => {
  results.push(ok);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
};

const ana = await login('ana@boraonde.demo');
const dono = await login('bardoze@boraonde.demo');
const anon = newClient();

// ── visitante sem login ──
{
  const { data } = await anon.from('establishments').select('id');
  expect('visitante sem login não lê lugares', !data || data.length === 0, `linhas: ${data?.length ?? 0}`);
}

// ── Ana (Usuário Padrão) ──
{
  const { data } = await ana.client.from('establishments').select('id,name');
  expect('Ana vê os lugares do feed', (data?.length ?? 0) >= 4, `${data?.length} lugares`);

  const { data: me } = await ana.client.from('users').select('id');
  expect('Ana só vê a própria linha em users', me?.length === 1 && me[0].id === ana.uid);

  const { error } = await ana.client.from('users').update({ name: 'Hacker' }).eq('id', ana.uid);
  expect('Ana NÃO altera o nome (dado pessoal somente leitura)', !!error, error?.message);

  const { error: ageErr } = await ana.client.from('users').update({ age: 99 }).eq('id', ana.uid);
  expect('Ana NÃO altera a idade', !!ageErr, ageErr?.message);

  const { data: city, error: cityErr } = await ana.client.from('users').update({ city: 'São Paulo, SP' }).eq('id', ana.uid).select();
  expect('Ana ALTERA a própria cidade', !cityErr && city?.length === 1);
  await ana.client.from('users').update({ city: 'Campinas, SP' }).eq('id', ana.uid); // restaura

  const { data: upd } = await ana.client.from('establishments').update({ name: 'Invadido' }).eq('name', 'Bar do Zé').select();
  expect('Ana NÃO edita lugar de outro dono', !upd || upd.length === 0, `linhas afetadas: ${upd?.length ?? 0}`);

  const { error: delErr } = await ana.client.from('establishments').delete().eq('name', 'Bar do Zé');
  expect('Ana NÃO exclui lugar', !!delErr, delErr?.message);

  const { data: est } = await ana.client.from('establishments').select('id').eq('name', 'Bar do Zé').single();
  const { error: metaErr } = await ana.client
    .from('establishment_metadata')
    .update({ sells_alcohol: false })
    .eq('establishment_id', est.id)
    .select();
  const { data: meta } = await dono.client.from('establishment_metadata').select('sells_alcohol').eq('establishment_id', est.id).single();
  expect('Ana NÃO altera metadados de lugar alheio', meta?.sells_alcohol === true, metaErr?.message ?? 'inalterado');

  const { error: upErr } = await ana.client.storage
    .from('place-photos')
    .upload(`${dono.uid}/invasao.jpg`, new Blob(['x'], { type: 'image/jpeg' }));
  expect('Ana NÃO escreve na pasta do dono no Storage', !!upErr, upErr?.message);

  const { error: rpcAnon } = await anon.rpc('delete_my_account');
  expect('visitante NÃO executa delete_my_account', !!rpcAnon, rpcAnon?.message);
}

// ── Dono do Bar do Zé ──
{
  const { data: own } = await dono.client.from('establishments').select('id,name').eq('owner_id', dono.uid).single();
  expect('dono localiza o próprio lugar', own?.name === 'Bar do Zé');

  const { data: ok, error } = await dono.client.from('establishments').update({ name: 'Bar do Zé' }).eq('id', own.id).select();
  expect('dono EDITA o próprio lugar', !error && ok?.length === 1);

  const { error: metaErr } = await dono.client
    .from('establishment_metadata')
    .update({ sells_alcohol: true })
    .eq('establishment_id', own.id);
  expect('dono EDITA os próprios metadados', !metaErr, metaErr?.message);

  const { data: other } = await dono.client.from('establishments').update({ name: 'Invadido' }).eq('name', 'Café Grão Fino').select();
  expect('dono NÃO edita lugar de outro', !other || other.length === 0, `linhas afetadas: ${other?.length ?? 0}`);

  const { error: stErr } = await dono.client.storage
    .from('place-photos')
    .upload(`${ana.uid}/x.jpg`, new Blob(['x'], { type: 'image/jpeg' }));
  expect('dono NÃO escreve na pasta de outro uid', !!stErr, stErr?.message);

  const { error: ownDir } = await dono.client.storage
    .from('place-photos')
    .upload(`${dono.uid}/teste-rls.jpg`, new Blob(['x'], { type: 'image/jpeg' }), { upsert: true });
  expect('dono ESCREVE na própria pasta', !ownDir, ownDir?.message);
  await dono.client.storage.from('place-photos').remove([`${dono.uid}/teste-rls.jpg`]);
}

const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} verificações passaram.`);
process.exit(failed ? 1 : 0);
