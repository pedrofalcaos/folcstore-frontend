export interface Customer {
    id: string;
    nome: string;
    email: string;
    senha?: string;
    cpf: string;
    telefone: string;
    enderecos: Endereco[];
}

export interface Endereco {
    id: string;
    cep: string;
    bairro: string;
    rua: string;
    numero: string;
    complemento: string;
    cidade: string;
    estado: string;
}
