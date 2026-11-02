// src/app/layout.tsx
import { Provider } from "./provider";
import { CommerceSession } from './components/CommerceSession';
import { ConditionalHeader } from "../app/components/ConditionalHeader";
import { Footer } from "@/app/components/Footer";

export const metadata = {
    title: "FolcStore - Marketplace de Artesanato de Pernambuco",
    description: "Plataforma dedicada à valorização cultural e comercialização sustentável do artesanato autêntico pernambucano.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR">
            <body suppressHydrationWarning={true} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', margin: 0 }}>
                <Provider>
                    <CommerceSession />
                    {/* Cabeçalho Inteligente que muda conforme a rota (Cliente, Artesão ou Admin) */}
                    <ConditionalHeader />

                    {/* Conteúdo Dinâmico */}
                    <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {children}
                    </main>

                    {/* Rodapé Global em todas as páginas */}
                    <Footer />
                </Provider>
            </body>
        </html>
    );
}
