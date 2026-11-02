"use client";

import { useState } from "react";
import { sessionStore } from "@/store/sessionStore";
import { addressService } from "@/services/addressService";
import {
  Box,
  Button,
  Field,
  Flex,
  Grid,
  GridItem,
  HStack,
  Heading,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FiTrash2 } from "react-icons/fi";

const ENDERECO_VAZIO = {
  cep: "",
  rua: "",
  numero: "",
  bairro: "",
  complemento: "",
  cidade: "",
  estado: "",
};

interface EnderecoManagerProps {
  onSelectEndereco?: (enderecoId: string) => void;
  enderecoSelecionadoId?: string | null;
  /** true: foca em selecionar um endereço (checkout). false: foca em gerenciar (conta). */
  modoSelecao?: boolean;
}

export default function EnderecoManager({
  onSelectEndereco,
  enderecoSelecionadoId,
  modoSelecao = false,
}: EnderecoManagerProps) {
  const customer = sessionStore((state) => state.customer);
  const salvarCustomer = sessionStore((state) => state.salvarCustomer);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [novoEndereco, setNovoEndereco] = useState(ENDERECO_VAZIO);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!customer) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNovoEndereco((prev) => ({ ...prev, [name]: value }));
  };

  const handleSalvarEndereco = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);
    try {
      const customerAtualizado = await addressService.addEndereco(customer, novoEndereco);
      salvarCustomer(customerAtualizado);

      // No checkout, o endereço recém-criado já fica selecionado
      const enderecoCriado = customerAtualizado.enderecos[customerAtualizado.enderecos.length - 1];
      if (modoSelecao && enderecoCriado) {
        onSelectEndereco?.(enderecoCriado.id);
      }

      setNovoEndereco(ENDERECO_VAZIO);
      setMostrarForm(false);
    } catch (err) {
      console.error(err);
      setErrorMsg("Não foi possível salvar o endereço. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoverEndereco = async (enderecoId: string) => {
    try {
      salvarCustomer(await addressService.removeEndereco(customer, enderecoId));
    } catch {
      setErrorMsg('Não foi possível remover o endereço.');
    }
  };

  return (
    <VStack align="stretch" gap={5}>
      <Flex justify="space-between" align="center">
        <Heading size="md">Endereço de Entrega</Heading>
        {!modoSelecao && !mostrarForm && (
          <Button colorPalette="brand" size="sm" onClick={() => setMostrarForm(true)}>
            + Adicionar endereço
          </Button>
        )}
      </Flex>

      {customer.enderecos.length === 0 && (
        <Text color="gray.500" fontSize="sm">
          Você ainda não tem endereços salvos. Cadastre um endereço para continuar.
        </Text>
      )}

      {/* Lista de endereços */}
      {customer.enderecos.length > 0 && !mostrarForm && (
        <VStack align="stretch" gap={3}>
          {customer.enderecos.map((endereco) => {
            const isSelected = modoSelecao && enderecoSelecionadoId === endereco.id;
            return (
              <Box
                key={endereco.id}
                p={4}
                borderWidth="2px"
                borderRadius="md"
                borderColor={isSelected ? "brand.500" : "gray.200"}
                bg={isSelected ? "brand.50" : "white"}
                cursor={modoSelecao ? "pointer" : "default"}
                onClick={() => modoSelecao && onSelectEndereco?.(endereco.id)}
              >
                <Flex justify="space-between" align="flex-start">
                  <VStack align="start" gap={1}>
                    <Text fontWeight="semibold">
                      {endereco.rua}, {endereco.numero}
                      {endereco.complemento ? ` - ${endereco.complemento}` : ""}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {endereco.bairro} — {endereco.cidade}/{endereco.estado} — CEP {endereco.cep}
                    </Text>
                  </VStack>

                  {!modoSelecao && (
                    <Button
                      size="sm"
                      variant="ghost"
                      colorPalette="red"
                      aria-label="Remover endereço"
                      onClick={() => handleRemoverEndereco(endereco.id)}
                    >
                      <FiTrash2 />
                    </Button>
                  )}
                </Flex>
              </Box>
            );
          })}
        </VStack>
      )}

      {/* No checkout o botão de adicionar fica abaixo da lista */}
      {modoSelecao && !mostrarForm && (
        <Button
          variant="outline"
          colorPalette="brand"
          alignSelf="start"
          onClick={() => setMostrarForm(true)}
        >
          + Adicionar novo endereço
        </Button>
      )}

      {/* Formulário de cadastro (usado na conta e no checkout) */}
      {mostrarForm && (
        <Box borderTopWidth="1px" borderColor="gray.100" pt={5}>
          {errorMsg && (
            <Text color="red.500" fontSize="sm" mb={3}>
              {errorMsg}
            </Text>
          )}
          <form onSubmit={handleSalvarEndereco}>
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
              <GridItem colSpan={1}>
                <Field.Root required>
                  <Field.Label>CEP</Field.Label>
                  <Input
                    name="cep"
                    value={novoEndereco.cep}
                    onChange={handleChange}
                    placeholder="00000-000"
                  />
                </Field.Root>
              </GridItem>
              <GridItem colSpan={1}>
                <Field.Root required>
                  <Field.Label>Estado (UF)</Field.Label>
                  <Input
                    name="estado"
                    value={novoEndereco.estado}
                    onChange={handleChange}
                    placeholder="Ex: PE"
                    maxLength={2}
                  />
                </Field.Root>
              </GridItem>
              <GridItem colSpan={{ base: 1, md: 2 }}>
                <Field.Root required>
                  <Field.Label>Rua / Logradouro</Field.Label>
                  <Input
                    name="rua"
                    value={novoEndereco.rua}
                    onChange={handleChange}
                    placeholder="Ex: Rua das Flores"
                  />
                </Field.Root>
              </GridItem>
              <GridItem colSpan={1}>
                <Field.Root required>
                  <Field.Label>Número</Field.Label>
                  <Input
                    name="numero"
                    value={novoEndereco.numero}
                    onChange={handleChange}
                    placeholder="123"
                  />
                </Field.Root>
              </GridItem>
              <GridItem colSpan={1}>
                <Field.Root required>
                  <Field.Label>Bairro</Field.Label>
                  <Input
                    name="bairro"
                    value={novoEndereco.bairro}
                    onChange={handleChange}
                    placeholder="Ex: Centro"
                  />
                </Field.Root>
              </GridItem>
              <GridItem colSpan={1}>
                <Field.Root>
                  <Field.Label>Complemento (Opcional)</Field.Label>
                  <Input
                    name="complemento"
                    value={novoEndereco.complemento}
                    onChange={handleChange}
                    placeholder="Apto 101"
                  />
                </Field.Root>
              </GridItem>
              <GridItem colSpan={1}>
                <Field.Root required>
                  <Field.Label>Cidade</Field.Label>
                  <Input
                    name="cidade"
                    value={novoEndereco.cidade}
                    onChange={handleChange}
                    placeholder="Ex: Recife"
                  />
                </Field.Root>
              </GridItem>
            </Grid>

            <HStack gap={3} mt={4}>
              <Button type="submit" colorPalette="brand" loading={isLoading} loadingText="Salvando...">
                Salvar endereço
              </Button>
              <Button type="button" variant="ghost" onClick={() => setMostrarForm(false)}>
                Cancelar
              </Button>
            </HStack>
          </form>
        </Box>
      )}
    </VStack>
  );
}
