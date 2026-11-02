import { backendApi } from './backendApi';
import type { Customer, Endereco } from '@/types';

export const addressService = {
  async addEndereco(customer: Customer, endereco: Omit<Endereco, 'id'>): Promise<Customer> {
    await backendApi.post('/enderecos', endereco);
    const { data } = await backendApi.get<Endereco[]>('/enderecos');
    return { ...customer, enderecos: data };
  },
  async removeEndereco(customer: Customer, id: string): Promise<Customer> {
    await backendApi.delete(`/enderecos/${id}`);
    return { ...customer, enderecos: customer.enderecos.filter(e => e.id !== id) };
  },
};
