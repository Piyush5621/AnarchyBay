// CLIENTS
import { supabase } from "../lib/supabase.js";

export const signUp = async ({email, password}) => {
    return await supabase.auth.signUp({ email, password });
}

export const login = async ({email, password}) => {
    return await supabase.auth.signInWithPassword({ email, password });
}

export const getCurrentUser = async (token) => {
    return await supabase.auth.getUser(token);
}