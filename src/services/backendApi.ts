import axios from 'axios';
import { sessionStore } from '@/store/sessionStore';

export const backendApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3003/api',
  timeout: 20000,
});

backendApi.interceptors.request.use(config => {
  const token = sessionStore.getState().token;
  if (token && !config.headers.Authorization) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

backendApi.interceptors.response.use(response => response, error => {
  const tokenAtual = sessionStore.getState().token;
  const pertenceASessaoAtual = tokenAtual && error.config?.headers?.Authorization === `Bearer ${tokenAtual}`;
  if (error.response?.status === 401 && pertenceASessaoAtual && !error.config?.url?.startsWith('/auth/')) {
    sessionStore.getState().logoutAll();
  }
  return Promise.reject(error);
});

export function mensagemErro(error: unknown, padrao = 'Não foi possível concluir a operação.') {
  if (!axios.isAxiosError(error)) return padrao;
  const dados = error.response?.data;
  if (Array.isArray(dados?.campos)) {
    const mensagens = dados.campos.map((campo: { mensagem?: unknown }) => campo.mensagem)
      .filter((mensagem: unknown): mensagem is string => typeof mensagem === 'string');
    if (mensagens.length) return mensagens.join(' ');
  }
  return typeof dados?.erro === 'string' ? dados.erro : padrao;
}
