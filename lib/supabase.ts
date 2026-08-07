import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

function phoneToInternalEmail(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `${digits}@zubaelektro.uz`;
}

export async function registerWithPhone(
  phone: string,
  password: string,
  fullName: string
) {
  const email = phoneToInternalEmail(phone);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone },
    },
  });

  if (data?.user && !error) {
    await supabase.from("user_profiles").insert({
      id: data.user.id,
      full_name: fullName,
      phone,
    });
  }

  return { data, error };
}

export async function loginWithPhone(phone: string, password: string) {
  const email = phoneToInternalEmail(phone);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function logout() {
  await supabase.auth.signOut();
}
