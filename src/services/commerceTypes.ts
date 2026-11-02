import type { Endereco } from '@/types/customer';
import type { Produto } from '@/types/product';

export interface ProdutoApi {
  id: string; titulo: string; descricao: string; tecnica: string; regiaoProducao: string;
  precoCentavos: number; quantidadeEstoque: number; tipo: 'UNICO' | 'LOTE'; ativo: boolean;
  categoriaId: string; categoria: { nome: string }; idArtesao: string; artesao: { nome: string };
  criadoEm: string; sku: string; materiaPrima: string; guiaCuidados: string; prazoProducao: number;
  dimensoes: Partial<Produto['dimensoes']>; galeriaImagens: string[];
}

export function converterProduto(p: ProdutoApi): Produto {
  const imagens = p.galeriaImagens?.length ? p.galeriaImagens : ['/file.svg'];
  return { id: p.id, titulo: p.titulo, descricao: p.descricao, tecnica: p.tecnica,
    regiaoProducao: p.regiaoProducao, preco: p.precoCentavos / 100, quantidadeEstoque: p.quantidadeEstoque,
    tipo: p.tipo === 'UNICO' ? 'unico' : 'lote', ativo: p.ativo, categoria: p.categoria.nome,
    idArtesao: p.idArtesao, nomeArtesao: p.artesao.nome, dataCriacao: p.criadoEm,
    sku: p.sku || p.id, materiaPrima: p.materiaPrima, guiaCuidados: p.guiaCuidados,
    prazoProducao: p.prazoProducao, dimensoes: { altura: 0, largura: 0, profundidade: 0, peso: 0, ...p.dimensoes },
    galeriaImagens: imagens, linkImagens: imagens, imagem: imagens[0],
  };
}

export interface CarrinhoApi {
  versao: number; totalCentavos: number;
  itens: { produto: ProdutoApi; quantidade: number; subtotalCentavos: number }[];
}

export interface ConfirmacaoCompra {
  enderecoId: string; metodoPagamento: 'PIX' | 'CARTAO'; versaoCarrinho: number; totalEsperadoCentavos: number;
}

export interface PedidoApi {
  id: string; compradorId: string; totalCentavos: number; status: string; criadoEm: string;
  enderecoEntrega: Endereco; metodoPagamento: 'PIX' | 'CARTAO';
  itens: { id: string; produtoId: string; idArtesao: string; tituloProduto: string; quantidade: number; precoUnitarioCentavos: number }[];
}
