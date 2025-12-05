// CLIENTS
import { supabase } from "../lib/supabase.js";

export const createUserProfile = async ({ id, name, email, role }) => {
    return await supabase.from("profiles").insert([{id, name, email, role}]).select();
}

export const getUserProfile = async ({ userId }) => {
    return await supabase.from("profiles").select("name, role").eq("id", userId).single();
}

export const getTotalUsers = async () => {
    return await supabase.from("profiles").select("*", { count: "exact" });
}