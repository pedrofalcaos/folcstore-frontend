import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validarCadastro } from '../src/services/cadastroValidation.ts';

const cadastro = { nome: 'Pessoa Teste', telefone: '81999990000', cpf: '111.222.333-44', email: 'pessoa@example.com',
  senha: 'SenhaTeste123', cep: '50000-000', rua: 'Rua de teste', numero: '10', bairro: 'Centro', cidade: 'Recife', estado: 'pe', complemento: '' };

test('cadastro aceita CPF/CEP formatados e UF minúscula', () => {
  assert.equal(validarCadastro(cadastro), null);
});
test('senha curta e senha multibyte longa recebem mensagem específica', () => {
  assert.match(validarCadastro({ ...cadastro, senha: '123456' }), /pelo menos 8/);
  assert.match(validarCadastro({ ...cadastro, senha: 'á'.repeat(37) }), /72 bytes/);
});
test('CPF, CEP e UF inválidos são identificados antes do envio', () => {
  assert.match(validarCadastro({ ...cadastro, cpf: '123' }), /CPF/);
  assert.match(validarCadastro({ ...cadastro, cep: '123' }), /CEP/);
  assert.match(validarCadastro({ ...cadastro, estado: 'XX' }), /UF válida/);
});
test('campos de endereço e nome com poucos caracteres são identificados', () => {
  assert.match(validarCadastro({ ...cadastro, nome: 'A' }), /Nome completo/);
  assert.match(validarCadastro({ ...cadastro, rua: 'A' }), /Rua/);
});
