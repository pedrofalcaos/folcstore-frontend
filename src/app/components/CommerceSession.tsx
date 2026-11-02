'use client';

import { useEffect } from 'react';
import { sessionStore } from '@/store/sessionStore';
import { useCartStore } from '@/store/cartStore';

export function CommerceSession() {
  const token = sessionStore(state => state.token);
  const compradorId = sessionStore(state => state.customer?.id);
  useEffect(() => {
    useCartStore.getState().resetLocal();
    if (token && compradorId) void useCartStore.getState().sincronizar();
  }, [token, compradorId]);
  return null;
}
