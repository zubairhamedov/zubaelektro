import { supabase } from "./supabase";

let lessonsCache: any[] | null = null;
let testsCache: any[] | null = null;

export function getCachedLessons() {
  return lessonsCache;
}

export function getCachedTests() {
  return testsCache;
}

export async function fetchLessons() {
  const { data } = await supabase
    .from("lessons")
    .select("*")
    .order("order_index", { ascending: true });
  lessonsCache = data || [];
  return lessonsCache;
}

export async function fetchTests() {
  const { data } = await supabase.from("tests").select("*");
  testsCache = data || [];
  return testsCache;
}
