import { createClient } from "@supabase/supabase-js";

export function getImageFromSupabase (filePath:string):string {
    const {data} = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL??'', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY??'')
        .storage
        .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET_STORAGE??'')
        .getPublicUrl(filePath);
    return data.publicUrl;
}


