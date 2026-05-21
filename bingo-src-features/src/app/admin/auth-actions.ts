'use server';

import { cookies } from 'next/headers';
import sql from '@/lib/db';
import { redirect } from 'next/navigation';

export async function login(companyId: number, passwordInput: string) {
  try {
    const companies = await sql`SELECT * FROM companies WHERE id = ${companyId} LIMIT 1`;
    
    if (companies.length === 0) {
      return { success: false, error: 'Empresa no encontrada' };
    }

    const company = companies[0] as Record<string, unknown>;
    const actualPassword = String(company.password || '1234'); // Default to 1234 if null

    if (passwordInput === actualPassword) {
      const cookieStore = await cookies();
      // Guardamos la cookie de sesión (en producción idealmente cifrada, aquí usamos un id simple para facilidad)
      cookieStore.set('bingo_admin_company_id', String(companyId), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/admin',
        maxAge: 60 * 60 * 24 * 7 // 1 semana
      });
      return { success: true };
    } else {
      return { success: false, error: 'Contraseña incorrecta' };
    }
  } catch (err) {
    console.error("Login Error:", err);
    return { success: false, error: 'Error del servidor al iniciar sesión' };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('bingo_admin_company_id');
  redirect('/admin/login');
}
