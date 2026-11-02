'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import { Container, Heading, Text, VStack, Button, Spinner } from '@chakra-ui/react';
import { sessionStore } from '@/store/sessionStore';
import { backendApi, mensagemErro } from '@/services/backendApi';
import type { Customer } from '@/types/customer';

export default function CustomerSecurityPage() {
  const router = useRouter();
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState('');
  const customer = sessionStore(state => state.customer);
  const token = sessionStore(state => state.token);
  useEffect(() => { setPronto(true); }, []);
  useEffect(() => {
    if (!pronto) return;
    if (!token || !customer) { router.replace('/customer/login'); return; }
    backendApi.get<Customer>('/auth/me').then(({ data }) => sessionStore.getState().salvarCustomer(data))
      .catch(error => setErro(mensagemErro(error)));
  }, [pronto, token, customer?.id, router]);
  if (!pronto || !customer) return <Spinner m={10} />;
  return <Container maxW="800px" py={8}>
    <VStack align="stretch" gap={4}>
      <Heading>Acesso e dados cadastrais</Heading>
      {erro && <Text role="alert" color="red.600">{erro}</Text>}
      <Text>Nome: {customer.nome}</Text>
      <Text>E-mail: {customer.email}</Text>
      <Text>CPF: {customer.cpf || 'Não informado'}</Text>
      <Text>Telefone: {customer.telefone || 'Não informado'}</Text>
      <Text>A senha não é exibida nem armazenada nesta página. Alteração cadastral e troca de senha serão disponibilizadas em outra etapa.</Text>
      <NextLink href="/customer/minha-conta"><Button variant="outline">Voltar para sua conta</Button></NextLink>
    </VStack>
  </Container>;
}
