import { backendApi } from './backendApi';
import { converterProduto, type ProdutoApi } from './commerceTypes';
import type { Produto, CriarProdutoDTO, AtualizarProdutoDTO } from '@/types/product';

export function extractProductId(slugOrId: string | number): string {
  return String(slugOrId).split('--').pop()!;
}

async function listar(filtros: Record<string, string> = {}): Promise<Produto[]> {
  const produtos: Produto[] = [];
  let pagina = 1;
  let totalPaginas = 1;
  do {
    const { data } = await backendApi.get<{ dados: ProdutoApi[]; totalPaginas: number }>('/produtos', {
      params: { ...filtros, pagina, limite: 50 },
    });
    produtos.push(...data.dados.map(converterProduto));
    totalPaginas = data.totalPaginas;
    pagina++;
  } while (pagina <= totalPaginas);
  return produtos;
}

async function payloadProduto(produto: CriarProdutoDTO) {
  const categorias = (await backendApi.get<{ id: string; nome: string }[]>('/categorias')).data;
  const categoria = categorias.find(c => c.nome.toLowerCase() === produto.categoria.toLowerCase());
  if (!categoria) throw new Error('Selecione uma categoria cadastrada no backend.');
  return { titulo: produto.titulo, descricao: produto.descricao, tecnica: produto.tecnica,
    regiaoProducao: produto.regiaoProducao, categoriaId: categoria.id,
    precoCentavos: Math.round(produto.preco * 100), quantidadeEstoque: produto.quantidadeEstoque,
    tipo: produto.tipo === 'unico' ? 'UNICO' : 'LOTE', sku: produto.sku,
    materiaPrima: produto.materiaPrima, guiaCuidados: produto.guiaCuidados,
    prazoProducao: produto.prazoProducao, dimensoes: produto.dimensoes,
    galeriaImagens: produto.galeriaImagens,
  };
}

export const productService = {
  getAll: () => listar(),
  getByArtesao: (idArtesao: string) => listar({ idArtesao }),
  searchByText: (busca: string) => listar({ busca }),
  async getById(id: string | number): Promise<Produto> {
    return converterProduto((await backendApi.get<ProdutoApi>(`/produtos/${extractProductId(id)}`)).data);
  },
  async create(produto: CriarProdutoDTO): Promise<Produto> {
    return converterProduto((await backendApi.post<ProdutoApi>('/produtos', await payloadProduto(produto))).data);
  },
  async update(id: string | number, alteracoes: AtualizarProdutoDTO): Promise<Produto> {
    const atual = await productService.getById(id);
    const payload = await payloadProduto({ ...atual, ...alteracoes });
    return converterProduto((await backendApi.put<ProdutoApi>(`/produtos/${atual.id}`, payload)).data);
  },
  async delete(id: string | number): Promise<void> {
    await backendApi.delete(`/produtos/${extractProductId(id)}`);
  },
};
