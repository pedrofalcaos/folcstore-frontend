import { backendApi } from './backendApi';
import { sessionStore } from '@/store/sessionStore';
import type { Order } from '@/types/order';
import type { PedidoApi, ConfirmacaoCompra } from './commerceTypes';

function converterPedidos(pedidos: (PedidoApi & { comprador?: { nome: string } })[]): Order[] {
  return pedidos.flatMap(pedido => pedido.itens.map(item => ({
    id: item.id, idArtesao: item.idArtesao, idComprador: pedido.compradorId,
    nomeComprador: pedido.comprador?.nome || sessionStore.getState().customer?.nome || '',
    idProduto: item.produtoId, tituloProduto: item.tituloProduto, quantidade: item.quantidade,
    precoUnitario: item.precoUnitarioCentavos / 100, status: pedido.status, dataCompra: pedido.criadoEm,
    enderecoEntrega: pedido.enderecoEntrega,
    pagamento: { metodo: pedido.metodoPagamento === 'PIX' ? 'pix' : 'cartao', status: 'aprovado' as const },
    situacaoEntrega: 'aguardadoEnvio' as const, codigoPostagem: null,
  })));
}

export const orderService = {
  async confirmar(dados: ConfirmacaoCompra, chave: string): Promise<PedidoApi> {
    return (await backendApi.post<PedidoApi>('/pedidos', dados, { headers: { 'Idempotency-Key': chave } })).data;
  },
  async getComprasPorComprador(_id: string): Promise<Order[]> {
    return converterPedidos((await backendApi.get<PedidoApi[]>('/pedidos')).data);
  },
  async getComprasPorArtesao(_id: string): Promise<Order[]> {
    return converterPedidos((await backendApi.get<PedidoApi[]>('/artesao/pedidos')).data);
  },
  async getTodasCompras(): Promise<Order[]> {
    const rota = sessionStore.getState().admin ? '/admin/pedidos' : '/pedidos';
    return converterPedidos((await backendApi.get<PedidoApi[]>(rota)).data);
  },
  // Fulfillment e avaliações serão migrados em uma etapa própria; não escrevem no json-server.
  async declararPostagem(_id: string, _codigo: string): Promise<Order> {
    throw new Error('O envio de pedidos ainda não está disponível nesta etapa.');
  },
  async declararRecebimento(_id: string): Promise<Order> {
    throw new Error('A confirmação de entrega ainda não está disponível nesta etapa.');
  },
  async marcarComoAvaliado(_id: string): Promise<Order> {
    throw new Error('A avaliação de pedidos ainda não está disponível nesta etapa.');
  },
};
