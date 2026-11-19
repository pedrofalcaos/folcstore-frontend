import { backendApi } from './backendApi';
import { recommendationService } from './recommendationService';
import type { Product } from '@/types/product';
import type { Order } from '@/types/order';

interface RespostaRecomendacoes {
  resultados: { produtoId: string; itens: { produtoId: string }[] }[];
}

export async function buscarRecomendacoes(
  produtos: Product[],
  historico: Order[],
  limite = 4,
): Promise<string[]> {
  const disponiveis = produtos.filter(p => p.ativo !== false && p.quantidadeEstoque > 0);
  const disponiveisPorId = new Map(disponiveis.map(p => [String(p.id), p]));
  const comprados = new Set(historico.map(p => String(p.idProduto)));
  const origem = historico.find(p => disponiveisPorId.has(String(p.idProduto)))?.idProduto ?? disponiveis[0]?.id;
  if (origem === undefined) return [];
  try {
    const { data } = await backendApi.get<RespostaRecomendacoes>('/recomendacoes', {
      params: { produtoId: String(origem), limite, modo: 'sequencial' },
    });
    const ids = data.resultados[0].itens.map(item => item.produtoId);
    return [...new Set(ids)].filter(id => disponiveisPorId.has(id) && !comprados.has(id)).slice(0, limite);
  } catch {
    return recommendationService.getRecommendedIds(produtos, historico, historico, limite);
  }
}
