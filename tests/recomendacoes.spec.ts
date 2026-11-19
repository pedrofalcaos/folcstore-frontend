import { test, expect } from '@playwright/test';

test('área do cliente usa sugestões da API e mantém sugestões locais se o serviço falhar', async ({ page, request }) => {
  const base = 'http://127.0.0.1:3103/api';
  const id = Date.now();
  const senha = 'SenhaDeTeste123!';
  const artesao = await (await request.post(base + '/auth/register', {
    data: { nome: 'Artesão recomendações', email: `artesao-reco-${id}@example.com`, senha, perfil: 'ARTESAO' },
  })).json();
  const categorias = await (await request.get(base + '/categorias')).json();
  await request.post(base + '/produtos', {
    headers: { Authorization: `Bearer ${artesao.token}` },
    data: { titulo: 'Prato de recomendações', descricao: 'Prato artesanal de barro para demonstrar sugestões.',
      tecnica: 'Barro', regiaoProducao: 'Olinda', categoriaId: categorias[0].id,
      precoCentavos: 2500, quantidadeEstoque: 5, tipo: 'LOTE' },
  });
  const email = `cliente-reco-${id}@example.com`;
  await request.post(base + '/auth/register', { data: { nome: 'Cliente recomendações', email, senha } });
  const catalogo = (await (await request.get(base + '/produtos')).json()).dados;
  let sugestao: string | undefined;
  await page.route('**/api/recomendacoes?*', async route => {
    const origem = new URL(route.request().url()).searchParams.get('produtoId');
    const candidato = catalogo.find((p: { id: string }) => p.id !== origem);
    sugestao = candidato.titulo;
    await route.fulfill({ status: 200, contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': 'http://127.0.0.1:3100' },
      body: JSON.stringify({ resultados: [{ produtoId: origem, itens: [{ produtoId: candidato.id }] }] }) });
  });
  await page.goto('/customer/login');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(senha);
  const chamada = page.waitForResponse(response => response.url().includes('/api/recomendacoes?'));
  await page.getByRole('button', { name: 'Entrar como Cliente' }).click();
  await chamada;
  const secao = page.getByRole('heading', { name: 'Recomendados para Você' }).locator('..');
  await expect(secao).toBeVisible();
  await expect(secao.getByText(sugestao!, { exact: true })).toBeVisible();

  await page.unroute('**/api/recomendacoes?*');
  await page.route('**/api/recomendacoes?*', route => route.fulfill({
    status: 503, contentType: 'application/json',
    headers: { 'Access-Control-Allow-Origin': 'http://127.0.0.1:3100' },
    body: JSON.stringify({ erro: 'Recomendador indisponível' }),
  }));
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Recomendados para Você' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Adicionar ao Carrinho' })).toHaveCount(catalogo.length);
});
