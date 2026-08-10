import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { accessToken } = await req.json();
    if (!accessToken) {
      return NextResponse.json({ error: "Token topilmadi" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: userData, error: userError } = await adminClient.auth.getUser(
      accessToken
    );
    if (userError || !userData?.user) {
      return NextResponse.json(
        { error: "Foydalanuvchi tasdiqlanmadi" },
        { status: 401 }
      );
    }

    const userId = userData.user.id;

    await adminClient.from("user_progress").delete().eq("user_id", userId);
    await adminClient.from("user_profiles").delete().eq("id", userId);

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(
      userId
    );
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
