import { create } from 'zustand';
import type { Product, CartItem } from '@/types/product';
import { backendApi, mensagemErro } from '@/services/backendApi';
import { converterProduto, type CarrinhoApi } from '@/services/commerceTypes';
import { sessionStore } from './sessionStore';

interface CartStore {
  items: CartItem[];
  ownerId: string | null;
  versao: number;
  totalCentavos: number;
  carregando: boolean;
  erro: string;
  sincronizar: () => Promise<void>;
  addItem: (product: Product) => Promise<void>;
  removeItem: (id: string | number) => Promise<void>;
  updateQuantity: (id: string | number, quantidade: number) => Promise<void>;
  clearCart: () => Promise<void>;
  resetLocal: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

// Serializa cliques no mesmo navegador, sem descartar cliques rápidos.
let fila: Promise<void> = Promise.resolve();
let pendentes = 0;

export const useCartStore = create<CartStore>((set, get) => {
  async function executar(operacao: (headers: { Authorization: string }) => Promise<CarrinhoApi>) {
    const { customer, token } = sessionStore.getState();
    if (!customer || !token) {
      if (typeof window !== 'undefined') window.location.assign('/customer/login');
      return;
    }
    const sessaoAtual = () => sessionStore.getState().token === token && sessionStore.getState().customer?.id === customer.id;
    pendentes++;
    set({ carregando: true, erro: '' });
    const tarefa = fila.then(async () => {
      if (!sessaoAtual()) return;
      try {
        const carrinho = await operacao({ Authorization: `Bearer ${token}` });
        if (sessaoAtual()) set({ ownerId: customer.id, versao: carrinho.versao,
          totalCentavos: carrinho.totalCentavos,
          items: carrinho.itens.map(item => ({ product: converterProduto(item.produto), quantity: item.quantidade })), erro: '',
        });
      } catch (error) {
        if (sessaoAtual()) set({ erro: mensagemErro(error) });
      }
    }).finally(() => {
      pendentes--;
      set({ carregando: pendentes > 0 });
    });
    fila = tarefa;
    await tarefa;
  }

  async function definir(id: string | number, quantidade: number, headers: { Authorization: string }) {
    if (quantidade <= 0) return (await backendApi.delete<CarrinhoApi>(`/carrinho/itens/${id}`, { headers })).data;
    return (await backendApi.put<CarrinhoApi>(`/carrinho/itens/${id}`, { quantidade }, { headers })).data;
  }

  return {
    items: [], ownerId: null, versao: 0, totalCentavos: 0, carregando: false, erro: '',
    sincronizar: () => executar(async headers => (await backendApi.get<CarrinhoApi>('/carrinho', { headers })).data),
    addItem: produto => executar(headers => {
      const quantidade = (get().items.find(item => item.product.id === produto.id)?.quantity ?? 0) + 1;
      return definir(produto.id, quantidade, headers);
    }),
    removeItem: id => executar(headers => definir(id, 0, headers)),
    updateQuantity: (id, quantidade) => executar(headers => definir(id, quantidade, headers)),
    clearCart: () => executar(async headers => (await backendApi.delete<CarrinhoApi>('/carrinho', { headers })).data),
    resetLocal: () => set({ items: [], ownerId: null, versao: 0, totalCentavos: 0, erro: '' }),
    totalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
    totalPrice: () => get().totalCentavos / 100,
  };
});
