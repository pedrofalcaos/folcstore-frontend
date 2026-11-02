import { redirect } from 'next/navigation';

// Links antigos passam a usar o único fluxo de checkout mantido pela aplicação.
export default function PagamentoPage() {
  redirect('/customer/checkout');
}
