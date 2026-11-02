import { Endereco } from "./customer";

export type MetodoPagamento = "cartao" | "pix";

export interface Pagamento {
    metodo: MetodoPagamento;
    status: "aprovado";
    cartaoMascarado?: string;
}

export interface Order {
    id?: string;
    idArtesao: string;
    idComprador: string;
    nomeComprador: string;
    idProduto: string | number;
    tituloProduto: string;
    quantidade: number;
    precoUnitario: number;
    status: string;
    dataCompra: string;
    enderecoEntrega: Endereco;
    pagamento: Pagamento;
    situacaoEntrega: "aguardadoEnvio" | "Enviado" | "Entregue";
    codigoPostagem: string | null;
    avaliado?: boolean; 
}
