import { backendApi } from './backendApi';
import { sessionStore } from '@/store/sessionStore';
import type { Customer, Artesao, Admin, Endereco } from '@/types';

interface UsuarioApi {
  id: string; nome: string; email: string; cpf: string; telefone: string;
  perfil: 'COMPRADOR' | 'ARTESAO' | 'ADMIN'; enderecos: Endereco[];
}
interface SessaoApi { token: string; usuario: UsuarioApi }

async function login(email: string, senha: string, perfil: UsuarioApi['perfil']) {
  try {
    const { data } = await backendApi.post<SessaoApi>('/auth/login', { email, senha });
    if (data.usuario.perfil !== perfil) return null;
    sessionStore.setState({ token: data.token, customer: null, artesao: null, admin: null });
    return data.usuario;
  } catch (error) {
    if ((error as { response?: { status: number } }).response?.status === 401) return null;
    throw error;
  }
}

async function cadastrar(dados: Omit<Customer, 'id'> | Omit<Artesao, 'id'>, perfil: 'COMPRADOR' | 'ARTESAO') {
  const payload = { nome: dados.nome.trim(), email: dados.email.trim(), senha: dados.senha, cpf: dados.cpf || undefined,
    telefone: dados.telefone.trim(), perfil,
    enderecos: 'enderecos' in dados ? dados.enderecos.map(({ id: _id, ...endereco }) => ({
      ...endereco, cep: endereco.cep.replace(/\D/g, ''), estado: endereco.estado.trim().toUpperCase(),
    })) : [],
  };
  try {
    const { data } = await backendApi.post<SessaoApi>('/auth/register', payload);
    sessionStore.setState({ token: data.token, customer: null, artesao: null, admin: null });
    return data.usuario;
  } catch (error) {
    const resposta = (error as { response?: { status: number; data: { erro: string; codigo?: string } } }).response;
    if (resposta?.status === 409) throw new Error(resposta.data.codigo === 'CPF_EXISTS' ? 'CPF_EXISTS' : 'EMAIL_EXISTS');
    throw error;
  }
}

const artesao = (usuario: { id: string; nome: string; email?: string }): Artesao => ({
  ...usuario, email: usuario.email ?? '', cpf: '', telefone: '', regiaoProducao: '', biografia: '',
});

export const userService = {
  loginCustomer: (email: string, senha: string): Promise<Customer | null> => login(email, senha, 'COMPRADOR'),
  async loginArtesao(email: string, senha: string): Promise<Artesao | null> {
    const usuario = await login(email, senha, 'ARTESAO');
    return usuario ? artesao(usuario) : null;
  },
  loginAdmin: (email: string, senha: string): Promise<Admin | null> => login(email, senha, 'ADMIN'),
  registerCustomer: (dados: Omit<Customer, 'id'>): Promise<Customer> => cadastrar(dados, 'COMPRADOR'),
  async registerArtesao(dados: Omit<Artesao, 'id'>): Promise<Artesao> {
    return artesao(await cadastrar(dados, 'ARTESAO'));
  },
  async getArtesaoById(id: string): Promise<Artesao> {
    return artesao((await backendApi.get(`/artesaos/${id}`)).data);
  },
  async getAllArtesaos(): Promise<Artesao[]> {
    return (await backendApi.get<UsuarioApi[]>('/artesaos')).data.map(artesao);
  },
};
