import { supabase } from "../lib/supabase.js";

/**
 * Update user roles (admin only)
 */
export const updateUserRoles = async ({ userId, roles }) => {
    // Validate roles
    const validRoles = ['customer', 'seller', 'creator', 'admin'];
    const invalidRoles = roles.filter(role => !validRoles.includes(role));
    
    if (invalidRoles.length > 0) {
        throw new Error(`Invalid roles: ${invalidRoles.join(', ')}`);
    }

    return await supabase
        .from("profiles")
        .update({ 
            roles,
            updated_at: new Date().toISOString()
        })
        .eq("id", userId)
        .select("id, name, email, roles, is_verified_seller, show_admin_badge")
        .single();
};

/**
 * Set verified seller badge
 */
export const setVerifiedSeller = async ({ userId, isVerified }) => {
    return await supabase
        .from("profiles")
        .update({ 
            is_verified_seller: isVerified,
            updated_at: new Date().toISOString()
        })
        .eq("id", userId)
        .select("id, name, email, roles, is_verified_seller")
        .single();
};

/**
 * Toggle admin badge visibility
 */
export const toggleAdminBadge = async ({ userId, showBadge }) => {
    return await supabase
        .from("profiles")
        .update({ 
            show_admin_badge: showBadge,
            updated_at: new Date().toISOString()
        })
        .eq("id", userId)
        .select("id, name, email, roles, show_admin_badge")
        .single();
};

/**
 * Add role to user
 */
export const addRoleToUser = async ({ userId, role }) => {
    const validRoles = ['customer', 'seller', 'creator', 'admin'];
    
    if (!validRoles.includes(role)) {
        throw new Error(`Invalid role: ${role}`);
    }

    // Get current roles
    const { data: profile } = await supabase
        .from("profiles")
        .select("roles")
        .eq("id", userId)
        .single();

    if (!profile) {
        throw new Error('User not found');
    }

    const currentRoles = profile.roles || ['customer'];
    
    // Don't add if already exists
    if (currentRoles.includes(role)) {
        return { data: profile, error: null };
    }

    const newRoles = [...currentRoles, role];

    return await supabase
        .from("profiles")
        .update({ 
            roles: newRoles,
            updated_at: new Date().toISOString()
        })
        .eq("id", userId)
        .select("id, name, email, roles, is_verified_seller, show_admin_badge")
        .single();
};

/**
 * Remove role from user
 */
export const removeRoleFromUser = async ({ userId, role }) => {
    // Get current roles
    const { data: profile } = await supabase
        .from("profiles")
        .select("roles")
        .eq("id", userId)
        .single();

    if (!profile) {
        throw new Error('User not found');
    }

    const currentRoles = profile.roles || ['customer'];
    const newRoles = currentRoles.filter(r => r !== role);

    // Always keep at least 'customer' role
    if (newRoles.length === 0) {
        newRoles.push('customer');
    }

    return await supabase
        .from("profiles")
        .update({ 
            roles: newRoles,
            updated_at: new Date().toISOString()
        })
        .eq("id", userId)
        .select("id, name, email, roles, is_verified_seller, show_admin_badge")
        .single();
};

/**
 * Get all users with their roles (admin only)
 */
export const getAllUsersWithRoles = async ({ page = 1, limit = 20, roleFilter = null }) => {
    const offset = (page - 1) * limit;
    
    let query = supabase
        .from("profiles")
        .select("id, name, email, username, display_name, roles, is_verified_seller, show_admin_badge, created_at", { count: "exact" });

    // Filter by role if specified
    if (roleFilter) {
        query = query.contains('roles', [roleFilter]);
    }

    return await query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
};
