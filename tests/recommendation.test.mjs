import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recommendationService } from '../src/services/recommendationService.ts';

const produto = (id, dados = {}) => ({
  id, categoria: 'barro', ativo: true, quantidadeEstoque: 1,
  dataCriacao: '2026-01-01', ...dados,
});
const recomendar = recommendationService.getRecommendedIds;

test('mais vendidos não recomenda produtos inativos, sem estoque ou já comprados', () => {
  const produtos = [produto('a'), produto('b', { ativo: false }), produto('c', { quantidadeEstoque: 0 }), produto('d')];
  const vendas = ['b', 'c', 'a', 'd'].map((idProduto, i) => ({ idProduto, quantidade: 10 - i }));
  // Produto comprado sem categoria correspondente disponível força o fallback.
  produtos[0].categoria = 'madeira';
  assert.deepEqual(recomendar(produtos, [{ idProduto: 'a' }], vendas), ['d']);
});

test('categorias relacionadas também respeitam disponibilidade', () => {
  const produtos = [produto('a'), produto('b', { ativo: false }), produto('c', { quantidadeEstoque: 0 }), produto('d')];
  assert.deepEqual(recomendar(produtos, [{ idProduto: 'a' }], []), ['d']);
});

test('banco sem compras usa mais recentes sem alterar a lista original', () => {
  const produtos = [produto('a'), produto('b', { dataCriacao: '2026-02-01' })];
  assert.deepEqual(recomendar(produtos, [], []), ['b', 'a']);
  assert.deepEqual(produtos.map(p => p.id), ['a', 'b']);
});

test('limite inválido retorna lista vazia', () => {
  for (const limite of [0, -1, 1.5, NaN]) {
    assert.deepEqual(recomendar([produto('a')], [], [], limite), []);
  }
});
