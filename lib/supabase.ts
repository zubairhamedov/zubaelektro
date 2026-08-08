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

export async function getCurrentProfile() {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return null;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}

export async function getLearningProgress() {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, slug, title")
    .order("order_index", { ascending: true });

  const totalLessons = lessons?.length || 0;

  if (!user || !lessons) {
    return { totalLessons, completedCount: 0, nextLesson: lessons?.[0] || null };
  }

  const { data: progress } = await supabase
    .from("user_progress")
    .select("lesson_id, completed")
    .eq("user_id", user.id)
    .eq("completed", true);

  const completedIds = new Set((progress || []).map((p) => p.lesson_id));
  const completedCount = completedIds.size;
  const nextLesson =
    lessons.find((l) => !completedIds.has(l.id)) || lessons[lessons.length - 1] || null;

  return { totalLessons, completedCount, nextLesson };
}
