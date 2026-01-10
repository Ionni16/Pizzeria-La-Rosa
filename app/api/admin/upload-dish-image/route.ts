// app/api/admin/upload-dish-image/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DISH_BUCKET, safeFilename } from "@/lib/supabase/storage";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();

  // auth
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,is_admin")
    .eq("id", u.user.id)
    .single();

  if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = new Uint8Array(bytes);

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const base = safeFilename(file.name.replace(/\.[^.]+$/, "")) || "dish";
  const stamp = Date.now();
  const path = `${u.user.id}/${base}-${stamp}.${ext}`;

  const { error: upErr } = await supabase.storage.from(DISH_BUCKET).upload(path, buffer, {
    contentType: file.type || "image/jpeg",
    upsert: true,
  });

  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  const { data: pub } = supabase.storage.from(DISH_BUCKET).getPublicUrl(path);

  return NextResponse.json({ url: pub.publicUrl });
}
