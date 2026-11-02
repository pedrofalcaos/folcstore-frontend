'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { Box, Button, Container, Heading, Text, VStack, HStack, Spinner } from '@chakra-ui/react';
import { sessionStore } from '@/store/sessionStore';
import { useCartStore } from '@/store/cartStore';
import { backendApi, mensagemErro } from '@/services/backendApi';
import { orderService } from '@/services/orderService';
import type { ConfirmacaoCompra, PedidoApi } from '@/services/commerceTypes';
import type { Customer } from '@/types/customer';
import EnderecoManager from '../../components/EnderecoManager';

interface ConfirmacaoPendente { chave: string; dados: ConfirmacaoCompra }
const moeda = (centavos: number) => (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const chaveLocal = (id: string) => `checkout-pendente:${id}`;

export default function CheckoutPage() {
  const router = useRouter();
  const customer = sessionStore(state => state.customer);
  const token = sessionStore(state => state.token);
  const salvarCustomer = sessionStore(state => state.salvarCustomer);
  const { items, versao, totalCentavos, carregando, erro, sincronizar } = useCartStore();
  const [pronto, setPronto] = useState(false);
  const [enderecoId, setEnderecoId] = useState<string | null>(null);
  const [metodo, setMetodo] = useState<'PIX' | 'CARTAO'>('PIX');
  const [pendente, setPendente] = useState<ConfirmacaoPendente | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [pedido, setPedido] = useState<PedidoApi | null>(null);

  useEffect(() => { setPronto(true); }, []);

  useEffect(() => {
    if (!pronto) return;
    if (!customer || !token) { router.replace('/customer/login'); return; }
    let ativo = true;
    try {
      const salvo = localStorage.getItem(chaveLocal(customer.id));
      if (salvo) setPendente(JSON.parse(salvo));
    } catch { setMensagem('Não foi possível recuperar a confirmação anterior.'); }
    void sincronizar();
    backendApi.get<Customer>('/auth/me').then(({ data }) => { if (ativo) salvarCustomer(data); })
      .catch(error => { if (ativo) setMensagem(mensagemErro(error)); });
    return () => { ativo = false; };
  }, [pronto, customer?.id, token, router, salvarCustomer, sincronizar]);

  async function confirmar() {
    if (!customer || confirmando) return;
    setConfirmando(true);
    setMensagem('');
    try {
      const tentativa = pendente || { chave: crypto.randomUUID(), dados: {
        enderecoId: enderecoId!, metodoPagamento: metodo, versaoCarrinho: versao, totalEsperadoCentavos: totalCentavos,
      } };
      // Guarda a mesma chave e o mesmo corpo até ter resposta definitiva.
      localStorage.setItem(chaveLocal(customer.id), JSON.stringify(tentativa));
      setPendente(tentativa);
      const confirmado = await orderService.confirmar(tentativa.dados, tentativa.chave);
      setPedido(confirmado);
      localStorage.removeItem(chaveLocal(customer.id));
      setPendente(null);
      await sincronizar();
    } catch (error) {
      setMensagem(mensagemErro(error, 'Não recebemos a confirmação. Verifique a tentativa pendente antes de tentar outra compra.'));
      const status = (error as { response?: { status: number } }).response?.status;
      if (status && [400, 404, 409, 422].includes(status)) {
        localStorage.removeItem(chaveLocal(customer.id));
        setPendente(null);
        await sincronizar();
      }
    } finally { setConfirmando(false); }
  }

  if (!pronto || !customer || !token) return <Spinner m={10} />;
  if (pedido) return (
    <Container maxW="800px" py={10}>
      <VStack align="stretch" gap={4} p={6} bg="white" borderWidth="1px" rounded="lg">
        <Heading>Pedido confirmado!</Heading>
        <Text>Pedido: {pedido.id}</Text>
        <Text>Total confirmado: {moeda(pedido.totalCentavos)}</Text>
        <Text>Compra de demonstração: nenhum pagamento real foi cobrado.</Text>
        <NextLink href="/customer/pedidos"><Button colorPalette="brand">Ver meus pedidos</Button></NextLink>
        <NextLink href="/"><Button variant="outline">Continuar comprando</Button></NextLink>
      </VStack>
    </Container>
  );
  return (
    <Container maxW="900px" py={8}>
      <VStack align="stretch" gap={6}>
        <Heading>Finalizar compra</Heading>
        {(mensagem || erro) && <Text role="alert" color="red.600">{mensagem || erro}</Text>}
        {pendente ? (
          <Box p={5} borderWidth="1px" rounded="lg">
            <Text>Existe uma confirmação pendente. Verifique o resultado para evitar uma compra duplicada.</Text>
            <Button mt={4} colorPalette="brand" loading={confirmando} onClick={confirmar}>Verificar confirmação pendente</Button>
          </Box>
        ) : items.length === 0 ? (
          <Box><Text>Seu carrinho está vazio.</Text><NextLink href="/">Voltar ao catálogo</NextLink></Box>
        ) : (
          <>
            <Box p={5} borderWidth="1px" rounded="lg">
              {items.map(item => <HStack key={item.product.id} justify="space-between" py={2}>
                <Text>{item.product.titulo} × {item.quantity}</Text>
                <Text>{moeda(Math.round(item.product.preco * 100) * item.quantity)}</Text>
              </HStack>)}
              <Heading size="md" mt={4}>Total: {moeda(totalCentavos)}</Heading>
              <Text fontSize="sm">O estoque e os preços serão conferidos na confirmação.</Text>
            </Box>
            <Box p={5} borderWidth="1px" rounded="lg">
              <EnderecoManager modoSelecao enderecoSelecionadoId={enderecoId} onSelectEndereco={setEnderecoId} />
            </Box>
            <Box>
              <label htmlFor="metodo-pagamento">Forma de pagamento (simulação)</label>
              <select id="metodo-pagamento" value={metodo} onChange={e => setMetodo(e.target.value as 'PIX' | 'CARTAO')}
                style={{ display: 'block', padding: 12, border: '1px solid #ccc', borderRadius: 6, marginTop: 8 }}>
                <option value="PIX">Pix</option><option value="CARTAO">Cartão</option>
              </select>
              <Text mt={2}>Não informe dados de cartão. Esta compra é apenas de demonstração.</Text>
            </Box>
            <Button colorPalette="brand" loading={confirmando} disabled={!enderecoId || carregando || !!erro}
              onClick={confirmar}>Confirmar pedido</Button>
            <Button variant="outline" disabled={confirmando || carregando} onClick={() => void sincronizar()}>Atualizar carrinho</Button>
          </>
        )}
      </VStack>
    </Container>
  );
}
