// CLIENTS
import { supabase } from "../lib/supabase.js";

export const createUserProfile = async ({ id, name, email, role }) => {
    return await supabase.from("profiles").insert([{id, name, email, role}]).select();
}

export const getUserProfile = async ({ userId }) => {
    return await supabase
        .from("profiles")
        .select("id, name, email, role, username, display_name, bio, preferred_payment_provider, stripe_customer_id, stripe_account_id, profile_image_url, created_at, updated_at")
        .eq("id", userId)
        .single();
}

export const getPublicProfile = async ({ userId }) => {
    return await supabase
        .from("profiles")
        .select("id, name, username, display_name, bio, profile_image_url, created_at")
        .eq("id", userId)
        .single();
}

export const getProfileByUsername = async (username) => {
    return await supabase
        .from("profiles")
        .select("id, name, username, display_name, bio, profile_image_url, created_at")
        .eq("username", username)
        .single();
}

export const searchProfiles = async (query, options = {}) => {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    return await supabase
        .from("profiles")
        .select("id, name, username, display_name, bio, profile_image_url, created_at, role", { count: "exact" })
        .or(`name.ilike.%${query}%,username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .eq("role", "seller")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
}

export const updateUserProfile = async ({ userId, updates }) => {
    const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
    };

    return await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", userId)
        .select("id, name, email, role, username, display_name, bio, preferred_payment_provider, stripe_customer_id, stripe_account_id, profile_image_url, created_at, updated_at")
        .single();
}

export const checkUsernameAvailable = async (username, excludeUserId = null) => {
    let query = supabase
        .from("profiles")
        .select("id")
        .eq("username", username);
    
    if (excludeUserId) {
        query = query.neq("id", excludeUserId);
    }
    
    const { data } = await query.maybeSingle();
    return !data;
}

export const getTotalUsers = async () => {
    return await supabase.from("profiles").select("*", { count: "exact", head: true });
}