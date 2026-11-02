'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Artesao, Customer, Admin } from '@/types';

interface SessionState {
    token: string | null;
    customer: Customer | null;
    artesao: Artesao | null;
    admin: Admin | null;

    isCustomerLogged: () => boolean;
    salvarCustomer: (customer: Customer) => void;
    logoutCustomer: () => void;

    isArtesaoLogged: () => boolean;
    salvarArtesao: (artesao: Artesao) => void;
    logoutArtesao: () => void;

    isAdminLogged: () => boolean;
    salvarAdmin: (admin: Admin) => void;
    logoutAdmin: () => void;

    logoutAll: () => void;
}

export const sessionStore = create<SessionState>()(
    persist(
        (set, get) => ({
            token: null,
            customer: null,
            artesao: null,
            admin: null,

            isCustomerLogged: () => get().token !== null && get().customer !== null,
            salvarCustomer: (customer) => set({ customer }),
            logoutCustomer: () => get().logoutAll(),

            isArtesaoLogged: () => get().token !== null && get().artesao !== null,
            salvarArtesao: (artesao) => set({ artesao }),
            logoutArtesao: () => get().logoutAll(),

            isAdminLogged: () => get().token !== null && get().admin !== null,
            salvarAdmin: (admin) => set({ admin }),
            logoutAdmin: () => get().logoutAll(),

            logoutAll: () => set({ token: null, customer: null, artesao: null, admin: null }),
        }),
        {
            name: 'session-jwt-storage',
        }
    )
);
