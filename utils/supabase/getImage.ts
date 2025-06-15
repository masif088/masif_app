import {createClient} from "@/utils/supabase/client";

export function getImageFromSupabase (filePath:string):string {
    const {data} = createClient()
        .storage
        .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET_STORAGE??'')
        .getPublicUrl(filePath);
    return data.publicUrl;
}


