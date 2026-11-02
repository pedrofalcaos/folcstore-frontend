const estados = new Set('AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' '));

export function validarSenha(senha: string): string | null {
  if (senha.length < 8) return 'A senha precisa ter pelo menos 8 caracteres.';
  if (new TextEncoder().encode(senha).length > 72) return 'A senha ultrapassa o limite de 72 bytes. Use uma senha mais curta.';
  return null;
}

export function validarCadastro(dados: Record<string, string>): string | null {
  const textos: [string, string, number, number][] = [
    ['nome', 'Nome completo', 2, 100], ['telefone', 'Telefone', 1, 30],
    ['rua', 'Rua', 2, 150], ['numero', 'Número', 1, 20],
    ['bairro', 'Bairro', 2, 100], ['cidade', 'Cidade', 2, 100],
  ];
  for (const [campo, nome, minimo, maximo] of textos) {
    const tamanho = dados[campo]?.trim().length ?? 0;
    if (tamanho < minimo) return `${nome}: informe pelo menos ${minimo} caractere(s).`;
    if (tamanho > maximo) return `${nome}: use no máximo ${maximo} caracteres.`;
  }
  if (!/^\d{11}$/.test(dados.cpf.replace(/\D/g, ''))) return 'CPF: informe os 11 dígitos.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email.trim()) || dados.email.trim().length > 254) return 'Informe um e-mail válido.';
  const erroSenha = validarSenha(dados.senha);
  if (erroSenha) return erroSenha;
  if (!/^\d{8}$/.test(dados.cep.replace(/\D/g, ''))) return 'CEP: informe os 8 dígitos.';
  if (!estados.has(dados.estado.trim().toUpperCase())) return 'Estado: informe uma UF válida, como PE.';
  if (dados.complemento.length > 100) return 'Complemento: use no máximo 100 caracteres.';
  return null;
}
