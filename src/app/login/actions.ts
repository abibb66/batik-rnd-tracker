"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { authenticate, setSessionCookie, clearSessionCookie } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Email wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
  next: z.string().trim().optional(),
});

export type LoginState = { error?: string };

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Email dan password wajib diisi." };
  const { email, password, next } = parsed.data;

  const session = await authenticate(email, password);
  if (!session) return { error: "Email atau password salah." };

  await setSessionCookie(session);

  const target = next && next.startsWith("/") ? next : "/";
  redirect(target);
}

export async function logout() {
  await clearSessionCookie();
  redirect("/login");
}
