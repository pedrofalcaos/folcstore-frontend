export interface Artesao {
    id: string;
    nome: string;
    cpf: string;
    email: string;
    senha?: string;
    regiaoProducao: string;
    telefone: string;
    biografia: string;
    notaMedia?: number;
    totalAvaliacoes?: number;
}
