"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { userService } from "@/services/userService";
import { mensagemErro } from '@/services/backendApi';
import { validarCadastro } from '@/services/cadastroValidation';
import { sessionStore } from "@/store/sessionStore";
import NextLink from 'next/link';
import { Customer } from "@/types";
import {
  Box,
  Button,
  Flex,
  Field,
  Heading,
  Input,
  Text,
  VStack,
  Grid,
  GridItem,
  IconButton
} from "@chakra-ui/react";
import { LuHouse } from 'react-icons/lu';


export default function CustomerRegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    email: "",
    senha: "",
    telefone: "",
    cep: "",
    rua: "",
    numero: "",
    bairro: "",
    complemento: "",
    cidade: "",
    estado: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Função genérica para atualizar os campos do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const salvarCustomer = sessionStore((state) => state.salvarCustomer);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const problema = validarCadastro(formData);
    if (problema) { setError(problema); return; }
    setIsLoading(true);
    setError("");

    // Transformamos os dados simples do form no formato exato que a interface Customer exige
    const customerPayload: Omit<Customer, "id"> = {
      nome: formData.nome,
      cpf: formData.cpf,
      email: formData.email,
      senha: formData.senha,
      telefone: formData.telefone,
      enderecos: [
        {
          id: crypto.randomUUID(),
          cep: formData.cep,
          rua: formData.rua,
          numero: formData.numero,
          bairro: formData.bairro,
          complemento: formData.complemento,
          cidade: formData.cidade,
          estado: formData.estado,
        },
      ],
    };

    try {
      const novoCustomer = await userService.registerCustomer(customerPayload);
      salvarCustomer(novoCustomer);
      router.push("/customer");
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "EMAIL_EXISTS") {
        setError("Este e-mail já está cadastrado.");
      } else if (err instanceof Error && err.message === "CPF_EXISTS") {
        setError("Este CPF já está cadastrado.");
      } else {
        setError(mensagemErro(err, 'Não foi possível cadastrar. Confira os dados ou a conexão com a API.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH="80vh" align="center" justify="center" py={8}>
      <Box
        bg="white"
        p={8}
        rounded="lg"
        shadow="sm"
        border="1px solid"
        borderColor="gray.200"
        w="full"
        maxW="2xl"
      >
        <VStack gap={6} align="stretch">
          <Flex justify="center" mb={-2}>
            <NextLink href="/">
              <IconButton
                aria-label="Voltar para a página inicial"
                variant="ghost"
                size="lg"
                borderRadius="full"
              >
                <LuHouse size={24} />
              </IconButton>
            </NextLink>
          </Flex>
          <Heading size="lg" textAlign="center" color="brand.500">
            Registro de Comprador
          </Heading>

          <Text textAlign="center" color="gray.600" fontSize="sm">
            Crie sua conta para começar a comprar produtos artesanais.
          </Text>

          {error && (
            <Text
              role="alert"
              color="red.500"
              fontSize="sm"
              textAlign="center"
              fontWeight="500"
            >
              {error}
            </Text>
          )}

          <form noValidate onSubmit={handleSubmit} style={{ width: "100%" }}>
            <Grid
              templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
              gap={4}
            >
              <GridItem colSpan={{ base: 1, md: 2 }}>
                <Field.Root required>
                  <Field.Label>Nome Completo</Field.Label>
                  <Input
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Seu nome completo"
                  />
                </Field.Root>
              </GridItem>

              <GridItem colSpan={1}>
                <Field.Root required>
                  <Field.Label>CPF</Field.Label>
                  <Input
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleChange}
                    placeholder="000.000.000-00"
                  />
                </Field.Root>
              </GridItem>

              <GridItem colSpan={1}>
                <Field.Root required>
                  <Field.Label>Telefone</Field.Label>
                  <Input
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                  />
                </Field.Root>
              </GridItem>

              <GridItem colSpan={1}>
                <Field.Root required>
                  <Field.Label>E-mail</Field.Label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                  />
                </Field.Root>
              </GridItem>

              <GridItem colSpan={1}>
                <Field.Root required>
                  <Field.Label>Senha</Field.Label>
                  <Input
                    type="password"
                    name="senha"
                    value={formData.senha}
                    onChange={handleChange}
                    placeholder="********"
                    aria-describedby="ajuda-senha"
                  />
                  <Text id="ajuda-senha" fontSize="xs" color="gray.600">Use pelo menos 8 caracteres.</Text>
                </Field.Root>
              </GridItem>

              <GridItem colSpan={{ base: 1, md: 2 }} mt={2}>
                <Heading
                  size="sm"
                  color="gray.700"
                  borderBottom="1px solid"
                  borderColor="gray.100"
                  pb={2}
                >
                  Endereço Principal
                </Heading>
              </GridItem>

              <GridItem colSpan={1}>
                <Field.Root required>
                  <Field.Label>CEP</Field.Label>
                  <Input
                    name="cep"
                    value={formData.cep}
                    onChange={handleChange}
                    placeholder="00000-000"
                  />
                </Field.Root>
              </GridItem>

              <GridItem colSpan={{ base: 1, md: 2 }}>
                <Field.Root required>
                  <Field.Label>Rua / Logradouro</Field.Label>
                  <Input
                    name="rua"
                    value={formData.rua}
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
                    value={formData.numero}
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
                    value={formData.bairro}
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
                    value={formData.complemento}
                    onChange={handleChange}
                    placeholder="Apto 101, Bloco B"
                  />
                </Field.Root>
              </GridItem>

              <GridItem colSpan={1}>
                <Field.Root required>
                  <Field.Label>Cidade</Field.Label>
                  <Input
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleChange}
                    placeholder="Ex: São Paulo"
                  />
                </Field.Root>
              </GridItem>

              <GridItem colSpan={{ base: 1, md: 2 }}>
                <Field.Root required>
                  <Field.Label>Estado (UF)</Field.Label>
                  <Input
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    placeholder="Ex: SP"
                    maxLength={2}
                  />
                </Field.Root>
              </GridItem>

              <GridItem colSpan={{ base: 1, md: 2 }}>
                <VStack gap={3} mt={4}>
                  <Button
                    type="submit"
                    colorPalette="brand"
                    w="full"
                    loading={isLoading}
                    loadingText="Registrando..."
                  >
                    Criar conta de Comprador
                  </Button>

                  <Button
                    variant="ghost"
                    colorPalette="brand"
                    w="full"
                    onClick={() => router.push("/customer/login")}
                  >
                    Já tem uma conta? Faça login
                  </Button>
                </VStack>
              </GridItem>
            </Grid>
          </form>
        </VStack>
      </Box>
    </Flex>
  );
}
