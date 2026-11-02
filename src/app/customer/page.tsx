"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { sessionStore } from "@/store/sessionStore";
import { productService } from "@/services/productService";
import { orderService } from "@/services/orderService";
import { recommendationService } from "@/services/recommendationService";
import { Product } from "@/types/product";
import NextLink from "next/link";
import { useCartStore } from "@/store/cartStore";
import { CartDrawer } from "../components/CartDrawer";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Spinner,
  Image,
  SimpleGrid,
  Card,
  Badge,
} from "@chakra-ui/react";
import { FiLogOut, FiShoppingCart } from "react-icons/fi";

// Auxiliares do useSyncExternalStore (definidos fora do componente para ficarem estáveis)
const subscribeVazio = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function CustomerDashboard() {
  // false no servidor e na hidratação; true depois que está no navegador
  const mounted = useSyncExternalStore(
    subscribeVazio,
    getClientSnapshot,
    getServerSnapshot
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [recomendados, setRecomendados] = useState<Product[]>([]);

  const router = useRouter();

  const logoutCustomer = sessionStore((state) => state.logoutCustomer);
  const isCustomerLogged = sessionStore((state) => state.isCustomerLogged);
  const customer = sessionStore((state) => state.customer);

  const addItem = useCartStore((state) => state.addItem);
  const totalItems = useCartStore((state) => state.totalItems)();

  useEffect(() => {
    if (mounted && !isCustomerLogged()) {
      router.push("/customer/login");
    }
  }, [mounted, isCustomerLogged, router]);

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoadingProducts(true);
        const data = await productService.getAll();
        setProducts(data);
      } catch (err) {
        console.error("Erro ao carregar produtos da API:", err);
      } finally {
        setIsLoadingProducts(false);
      }
    }

    if (isCustomerLogged()) {
      loadProducts();
    }
  }, [isCustomerLogged]);

  useEffect(() => {
    async function loadRecomendados() {
      if (!customer || products.length === 0) return;
      try {
        const todasCompras = await orderService.getTodasCompras();
        const historico = todasCompras.filter(
          (compra) => String(compra.idComprador) === String(customer.id),
        );
        const ids = recommendationService.getRecommendedIds(
          products,
          historico,
          todasCompras,
        );
        const produtosPorId = new Map(products.map((p) => [String(p.id), p]));
        setRecomendados(ids.map((id) => produtosPorId.get(id)).filter((p): p is Product => p !== undefined));
      } catch (err) {
        console.error("Erro ao carregar recomendações:", err);
      }
    }
    loadRecomendados();
  }, [customer, products]);

  if (!mounted || !isCustomerLogged()) {
    return (
      <Flex minH="80vh" align="center" justify="center">
        <Spinner size="xl" color="brand.500" />
      </Flex>
    );
  }

  const handleLogout = () => {
    logoutCustomer();
    router.push("/");
  };

  const handleCardClick = (productId: string | number) => {
    router.push(`/product/${productId}`);
  };

  return (
    <Box minH="100vh" bg="gray.50" pb={12}>
      {/* Header */}
      <Box
        as="header"
        bg="gray.900"
        color="white"
        py={4}
        px={{ base: 4, md: 8 }}
        shadow="sm"
        mb={8}
      >
        <Container maxW="1200px">
          <Flex justify="space-between" align="center">
            {/* Logo com ícone dourado e texto branco */}
            <NextLink href="/" style={{ textDecoration: "none" }}>
              <HStack gap={3} cursor="pointer">
                <Flex
                  w={7}
                  h={7}
                  borderRadius="md"
                  bg="brand.500"
                  color="gray.900"
                  align="center"
                  justify="center"
                  fontWeight="bold"
                >
                  ✦
                </Flex>
                <Text
                  fontWeight="bold"
                  fontSize={{ base: "sm", md: "md" }}
                  color="white"
                >
                  FolcStore
                </Text>
              </HStack>
            </NextLink>

            {/* Ações à Direita */}
            <HStack gap={{ base: 2, md: 4 }}>
              {/* Link "Sua Conta" */}
              <NextLink
                href="/customer/minha-conta"
                style={{ textDecoration: "none" }}
              >
                <Text
                  display={{ base: "none", sm: "block" }}
                  color="gray.300"
                  _hover={{ color: "white" }}
                  fontSize="sm"
                  fontWeight="medium"
                >
                  Sua Conta
                </Text>
              </NextLink>

              {/* Botão do Carrinho (mesmo estilo dos outros headers) */}
              <Button
                variant="outline"
                colorPalette="brand"
                size="sm"
                onClick={() => setIsCartOpen(true)}
              >
                <HStack gap={2}>
                  <FiShoppingCart />
                  <Text display={{ base: "none", sm: "inline" }}>Carrinho</Text>
                  {totalItems > 0 && (
                    <Badge bg="brand.500" color="gray.900" borderRadius="full">
                      {totalItems}
                    </Badge>
                  )}
                </HStack>
              </Button>

              {/* Botão Sair */}
              <Button
                variant="outline"
                colorPalette="brand"
                size="sm"
                onClick={handleLogout}
              >
                <FiLogOut /> Sair da Conta
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="1200px">
        {/* Perfil do Cliente */}
        <Box
          bg="white"
          p={6}
          rounded="lg"
          shadow="sm"
          mb={8}
          border="1px solid"
          borderColor="gray.200"
        >
          <VStack align="start" gap={2}>
            <Heading size="lg">
              Olá, {customer?.nome || "Comprador(a)"}!
            </Heading>
            <Text color="gray.600">
              E-mail: <b>{customer?.email}</b>
            </Text>
            <Text color="gray.500" fontSize="sm">
              Explore e adicione as melhores peças do artesanato pernambucano ao
              seu carrinho.
            </Text>
          </VStack>
        </Box>

        {/* Recomendados para Você */}
        {recomendados.length > 0 && (
          <Box mb={8}>
            <Heading size="md" mb={4}>
              Recomendados para Você
            </Heading>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap={4}>
              {recomendados.map((product) => (
                <Card.Root
                  key={product.id}
                  p={4}
                  borderWidth="1px"
                  borderRadius="lg"
                  bg="white"
                  cursor="pointer"
                  _hover={{
                    shadow: "md",
                    borderColor: "brand.500",
                    transform: "translateY(-2px)",
                  }}
                  transition="all 0.2s"
                  onClick={() => handleCardClick(product.id)}
                >
                  <Image
                    src={
                      product.imagem ||
                      "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400"
                    }
                    alt={product.titulo}
                    borderRadius="md"
                    h="140px"
                    objectFit="cover"
                    mb={2}
                  />
                  <Text fontWeight="bold" fontSize="sm" lineClamp={1}>
                    {product.titulo}
                  </Text>
                  <Text color="brand.600" fontWeight="semibold" fontSize="sm">
                    R$ {Number(product.preco || 0).toFixed(2)}
                  </Text>
                </Card.Root>
              ))}
            </SimpleGrid>
          </Box>
        )}

        {/* Listagem de Produtos */}
        {isLoadingProducts ? (
          <Flex justify="center" py={10}>
            <Spinner size="lg" color="brand.500" />
          </Flex>
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={6}>
            {products.map((product) => (
              <Card.Root
                key={product.id || product.titulo}
                p={4}
                borderWidth="1px"
                borderRadius="lg"
                bg="white"
                _hover={{
                  shadow: "md",
                  borderColor: "brand.500",
                  transform: "translateY(-2px)",
                }}
                transition="all 0.2s"
              >
                <Box
                  cursor="pointer"
                  onClick={() => handleCardClick(product.id)}
                >
                  <Image
                    src={
                      product.imagem ||
                      "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400"
                    }
                    alt={product.titulo}
                    borderRadius="md"
                    h="180px"
                    objectFit="cover"
                    mb={3}
                  />
                  <Text fontWeight="bold" fontSize="md">
                    {product.titulo}
                  </Text>
                  <Text color="brand.600" fontWeight="semibold" mt={1} mb={4}>
                    R$ {Number(product.preco || 0).toFixed(2)}
                  </Text>
                </Box>

                <Button
                  size="sm"
                  colorPalette="brand"
                  w="full"
                  onClick={() => addItem(product)}
                >
                  Adicionar ao Carrinho
                </Button>
              </Card.Root>
            ))}
          </SimpleGrid>
        )}
      </Container>

      {/* Drawer do Carrinho */}
      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </Box>
  );
}
