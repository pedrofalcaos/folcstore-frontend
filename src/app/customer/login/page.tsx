"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { sessionStore } from "@/store/sessionStore";
import { userService } from "@/services/userService";
import { mensagemErro } from '@/services/backendApi';
import { validarSenha } from '@/services/cadastroValidation';
import {
  Box,
  Button,
  Flex,
  Field,
  Heading,
  Input,
  Text,
  VStack,
  Spinner,
} from "@chakra-ui/react";

export default function CustomerLoginPage() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const salvarCustomer = sessionStore((state) => state.salvarCustomer);
  const isCustomerLogged = sessionStore((state) => state.isCustomerLogged);
  const register = () => router.push("/customer/register");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isCustomerLogged()) {
      router.push("/customer");
    }
  }, [isCustomerLogged, router]);

  if (!mounted || isCustomerLogged())
    return (
      <Flex minH="80vh" align="center" justify="center">
        <Spinner size="xl" color="brand.500" />
      </Flex>
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const problema = validarSenha(senha);
    if (problema) { setError(problema); return; }
    setIsLoading(true);
    setError("");

    try {
      const customer = await userService.loginCustomer(email, senha);

      if (customer) {
        salvarCustomer(customer);
        router.push("/customer");
      } else {
        setError("E-mail ou senha inválidos.");
      }
    } catch (err) {
      setError(mensagemErro(err, 'Não foi possível entrar. Verifique a conexão com a API.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH="80vh" align="center" justify="center" px={4}>
      <Box
        bg="white"
        p={8}
        rounded="lg"
        shadow="sm"
        border="1px solid"
        borderColor="gray.200"
        w="full"
        maxW="md"
      >
        <VStack align="stretch" gap={6}>
          <Heading size="lg" textAlign="center" color="brand.500">
            Login de Cliente
          </Heading>

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

          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <VStack gap={4}>
              <Field.Root required>
                <Field.Label>E-mail</Field.Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seunome@email.com"
                  bg="white"
                />
              </Field.Root>

              <Field.Root required>
                <Field.Label>Senha</Field.Label>
                <Input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="********"
                  bg="white"
                />
              </Field.Root>

              <Button
                type="submit"
                colorPalette="brand"
                w="full"
                loading={isLoading}
                loadingText="Entrando..."
                mt={2}
              >
                Entrar como Cliente
              </Button>
            </VStack>
          </form>

          <Button
            onClick={register}
            variant="ghost"
            colorPalette="brand"
            w="full"
          >
            Registrar como Cliente
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
}
