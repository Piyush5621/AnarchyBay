import { supabase } from "../lib/supabase.js";

export const getProducts = async () => {
    return await supabase.from('products').select('*').order('created_at', { ascending: false });
}

export const totalProducts = async () => {
    return await supabase.from('products').select('*', { count: 'exact', head: true });
}