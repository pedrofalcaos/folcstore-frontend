import { test, expect } from '@playwright/test';

test('cadastro inválido informa o campo e erro 400 aparece sem erro de console', async ({ page }) => {
  const errosConsole: string[] = [];
  page.on('console', mensagem => { if (mensagem.type() === 'error' && mensagem.text().includes('AxiosError')) errosConsole.push(mensagem.text()); });
  await page.goto('/customer/login');
  await page.locator('input[type="email"]').fill('formulario@example.com');
  await page.locator('input[type="password"]').fill('123456');
  await page.getByRole('button', { name: 'Entrar como Cliente' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'A senha precisa ter pelo menos 8 caracteres.' })).toBeVisible();
  await page.goto('/customer/register');
  const campos = { nome: 'Pessoa Teste', cpf: '11122233344', email: 'formulario@example.com', senha: '123456',
    telefone: '81999990000', cep: '50000-000', rua: 'Rua de teste', numero: '10', bairro: 'Centro', cidade: 'Recife', estado: 'pe' };
  for (const [campo, valor] of Object.entries(campos)) await page.locator(`input[name="${campo}"]`).fill(valor);
  await page.getByRole('button', { name: 'Criar conta de Comprador' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'A senha precisa ter pelo menos 8 caracteres.' })).toBeVisible();
  await page.locator('input[name="senha"]').fill('SenhaTeste123!');
  await page.route('**/api/auth/register', route => route.fulfill({ status: 400, contentType: 'application/json',
    headers: { 'Access-Control-Allow-Origin': 'http://127.0.0.1:3100' },
    body: JSON.stringify({ erro: 'Dados inválidos', campos: [{ campo: 'enderecos.0.cep', mensagem: 'CEP inválido' }] }),
  }));
  await page.getByRole('button', { name: 'Criar conta de Comprador' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'CEP inválido' })).toBeVisible();
  expect(errosConsole).toEqual([]);
});

test('cadastro, carrinho persistido e confirmação recuperada sem pedido duplicado', async ({ page, request }) => {
  const erros: string[] = [];
  page.on('pageerror', error => erros.push(error.message));
  await page.goto('/customer/register');
  const cadastro = { nome: 'Comprador Navegador', cpf: '11122233344', email: `comprador-${Date.now()}@example.com`,
    senha: 'SenhaDeTeste123!', telefone: '81999990000', cep: '50000-000', rua: 'Rua de teste', numero: '10',
    bairro: 'Centro', complemento: '', cidade: 'Recife', estado: 'PE' };
  for (const [campo, valor] of Object.entries(cadastro)) await page.locator(`input[name="${campo}"]`).fill(valor);
  await page.getByRole('button', { name: 'Criar conta de Comprador' }).click();
  await expect(page).toHaveURL(/\/customer$/);
  const adicionar = page.getByRole('button', { name: 'Adicionar ao Carrinho' });
  await expect(adicionar).toBeVisible();
  await adicionar.dblclick();
  const sessao = await page.evaluate(() => JSON.parse(localStorage.getItem('session-jwt-storage')!).state);
  expect(sessao.customer.senha).toBeUndefined();
  const headers = { Authorization: `Bearer ${sessao.token}` };
  await expect.poll(async () => {
    const res = await request.get('http://127.0.0.1:3103/api/carrinho', { headers });
    return (await res.json()).itens[0]?.quantidade;
  }).toBe(2);
  await page.goto('/customer/checkout');
  await expect(page.getByText(/Vaso do fluxo local.*× 2/)).toBeVisible();
  // Reload comprova que os itens vêm do banco, sem depender do Zustand anterior.
  await page.reload();
  await expect(page.getByText(/Vaso do fluxo local.*× 2/)).toBeVisible();
  await page.getByText('Rua de teste, 10', { exact: true }).click();
  // O servidor confirma, mas o cliente perde a resposta. O retry usa a mesma chave.
  let perderResposta = true;
  await page.route('**/api/pedidos', async route => {
    if (route.request().method() !== 'POST' || !perderResposta) return route.continue();
    perderResposta = false;
    await route.fetch();
    await route.abort('failed');
  });
  await page.getByRole('button', { name: 'Confirmar pedido', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Verificar confirmação pendente' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Verificar confirmação pendente' })).toBeEnabled();
  expect(await (await request.get('http://127.0.0.1:3103/api/pedidos', { headers })).json()).toHaveLength(1);
  await page.reload();
  await page.getByRole('button', { name: 'Verificar confirmação pendente' }).click();
  await expect(page.getByRole('heading', { name: 'Pedido confirmado!' })).toBeVisible();
  const pedidos = await (await request.get('http://127.0.0.1:3103/api/pedidos', { headers })).json();
  expect(pedidos).toHaveLength(1);
  expect(pedidos[0].totalCentavos).toBe(2500);
  const catalogo = await (await request.get('http://127.0.0.1:3103/api/produtos')).json();
  expect(catalogo.dados[0].quantidadeEstoque).toBe(3);
  await page.getByRole('link', { name: 'Ver meus pedidos' }).click();
  await expect(page.getByText('Vaso do fluxo local', { exact: true })).toBeVisible();
  expect(erros).toEqual([]);
});
