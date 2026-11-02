import type { Product } from "@/types/product";
import type { Order } from "@/types/order";

export const recommendationService = {
  getRecommendedIds(
    produtos: Product[],
    historicoCompras: Order[],
    todasCompras: Order[],
    limite = 4
  ): string[] {
    if (!Number.isInteger(limite) || limite <= 0) return [];

    const disponiveis = produtos.filter((p) => p.ativo !== false && p.quantidadeEstoque > 0);
    const idsDisponiveis = new Set(disponiveis.map((p) => String(p.id)));
    const idsComprados = new Set(historicoCompras.map((o) => String(o.idProduto)));

    if (idsComprados.size > 0) {
      const categoriasCompradas = new Set(
        produtos
          .filter((p) => idsComprados.has(String(p.id)))
          .map((p) => p.categoria)
      );
      const relacionados = disponiveis.filter(
        (p) => categoriasCompradas.has(p.categoria) && !idsComprados.has(String(p.id))
      );
      if (relacionados.length > 0) {
        return relacionados.slice(0, limite).map((p) => String(p.id));
      }
    }

    // Fallback: mais vendidos (contagem real a partir de /orders)
    const contagem = new Map<string, number>();
    todasCompras.forEach((o) => {
      const id = String(o.idProduto);
      contagem.set(id, (contagem.get(id) || 0) + o.quantidade);
    });

    const maisVendidosIds = [...contagem.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);

    if (maisVendidosIds.length > 0) {
      const idsValidos = maisVendidosIds.filter(
        (id) => !idsComprados.has(id) && idsDisponiveis.has(id)
      );
      if (idsValidos.length > 0) {
        return idsValidos.slice(0, limite);
      }
    }

    // Fallback final (banco novo/sem pedidos ainda): produtos mais recentes
    return disponiveis
      .filter((p) => !idsComprados.has(String(p.id)))
      .sort((a, b) => (b.dataCriacao || "").localeCompare(a.dataCriacao || ""))
      .slice(0, limite)
      .map((p) => String(p.id));
  },
};
