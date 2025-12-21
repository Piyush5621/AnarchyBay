import { supabase, handleSupabaseError } from "../lib/supabase.js";
import { createUserProfile, getUserProfile, updateUserProfile, getTotalUsers, getPublicProfile, getProfileByUsername, checkUsernameAvailable, searchProfiles } from "../services/profile.service.js";
import { findProductsByCreator } from "../repositories/product.repository.js";
import { v4 as uuidv4 } from 'uuid';

const SELLER_SECRET = process.env.SELLER_SECRET;

export const createUserProfileController = async (req, res) => {
    try{
        const {id, name, email, role="customer", sellerCode} = req.body;

        if (!id || !name || !email){
            return res.status(400).json({
                error: "Credentials are required"
            })
        }

        // Validate seller secret on backend
        let finalRole = role;
        if (role === "seller") {
            if (!sellerCode) {
                return res.status(400).json({
                    error: "Seller code is required for seller registration"
                });
            }
            if (sellerCode !== SELLER_SECRET) {
                return res.status(403).json({
                    error: "Invalid seller code"
                });
            }
        } else {
            // Ensure non-seller roles are set to customer
            finalRole = "customer";
        }

        const {data, error} = await createUserProfile({id, name, email, role: finalRole});

        if (error){
            return handleSupabaseError(res, error);
        }

        return res.status(201).json(data);
    }
    catch (error){
        console.error("Error in createUserProfile controller: ", error);
        return res.status(500).json({
            error: "Internal server error"
        })
    }
}

// Get current user's profile from authenticated context
export const getMyProfileController = async (req, res) => {
    try{
        const userId = req.user?.id;

        if (!userId){
            return res.status(401).json({
                error: "Unauthorized"
            });
        }
        const {data, error} = await getUserProfile({ userId });

        if (error){
            return handleSupabaseError(res, error);
        }

        return res.status(200).json(data);
    } catch (error){
        console.error("Error in getMyProfile controller: ", error);
        return res.status(500).json({
            error: "Internal server error"
        }) 
    }
}

// Get public profile by user ID
export const getPublicProfileController = async (req, res) => {
    try {
        const { userId } = req.params;
        const { data, error } = await getPublicProfile({ userId });

        if (error) {
            return res.status(404).json({ error: "Profile not found" });
        }

        return res.status(200).json({ profile: data });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Get public profile by username
export const getProfileByUsernameController = async (req, res) => {
    try {
        const { username } = req.params;
        const { data, error } = await getProfileByUsername(username);

        if (error) {
            return res.status(404).json({ error: "Profile not found" });
        }

        return res.status(200).json({ profile: data });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Get seller's products
export const getSellerProductsController = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20, sortBy = "created_at", sortOrder = "desc" } = req.query;

        const { data, count, error } = await findProductsByCreator(userId, {
            page: parseInt(page),
            limit: parseInt(limit),
            sortBy,
            sortOrder,
        });

        if (error) {
            return handleSupabaseError(res, error);
        }

        return res.status(200).json({ products: data || [], total: count || 0 });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
}

// Check username availability
export const checkUsernameController = async (req, res) => {
    try {
        const { username } = req.params;
        const userId = req.user?.id;

        if (!username || username.length < 3) {
            return res.status(400).json({ error: "Username must be at least 3 characters", available: false });
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return res.status(400).json({ error: "Username can only contain letters, numbers, and underscores", available: false });
        }

        const available = await checkUsernameAvailable(username, userId);
        return res.status(200).json({ available });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
}

export const getTotalUsersController = async (req, res) => {
    try{
        const {count, error} = await getTotalUsers();
        
        if (error){
            return handleSupabaseError(res, error);
        }

        res.status(200).json({ count });
    } catch (error){
        console.error("Error in getTotalUsers controller: ", error);
        return res.status(500).json({
            error: "Internal server error"
        })
    }
}

// Update current user's profile
export const updateMyProfileController = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }

        const updates = req.body;

        // Validate that at least one field is being updated
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                error: "At least one field must be provided for update"
            });
        }

        const { data, error } = await updateUserProfile({ userId, updates });

        if (error) {
            return handleSupabaseError(res, error);
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            profile: data
        });
    } catch (error) {
        console.error("Error in updateMyProfile controller: ", error);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
}

// Upload profile image
export const uploadProfileImageController = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                error: "No image file provided"
            });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                error: "Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed"
            });
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (req.file.size > maxSize) {
            return res.status(400).json({
                error: "File size exceeds 5MB limit"
            });
        }

        // Generate unique filename
        const fileExtension = req.file.originalname.split('.').pop();
        const fileName = `${userId}-${uuidv4()}.${fileExtension}`;
        const filePath = `profile-images/${fileName}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('gumroad')
            .upload(filePath, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: false
            });

        if (uploadError) {
            console.error("Error uploading to Supabase Storage:", uploadError);
            return res.status(500).json({
                error: "Failed to upload image"
            });
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('gumroad')
            .getPublicUrl(filePath);

        const imageUrl = urlData.publicUrl;

        // Update profile with image URL
        const { data: profileData, error: updateError } = await updateUserProfile({
            userId,
            updates: { profile_image_url: imageUrl }
        });

        if (updateError) {
            // If profile update fails, try to delete the uploaded image
            await supabase.storage
                .from('gumroad')
                .remove([filePath]);
            
            return handleSupabaseError(res, updateError);
        }

        return res.status(200).json({
            message: "Profile image uploaded successfully",
            imageUrl: imageUrl,
            profile: profileData
        });
    } catch (error) {
        console.error("Error in uploadProfileImage controller: ", error);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
}

export const searchProfilesController = async (req, res) => {
    try {
        // ✅ CHANGE 'q' TO 'search' to match frontend
        const { search } = req.query; 
        
        if (!search || search.trim() === "") {
            return res.status(200).json({ profiles: [] });
        }

        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 5, // Default to 5 for spotlight
        };

        // Pass 'search' variable to your service
        const { data, error, count } = await searchProfiles(search, options);
        
        if (error) {
            return handleSupabaseError(res, error);
        }

        return res.status(200).json({
            profiles: data || [], // Ensure this matches what frontend expects (data.profiles)
            total: count || 0,
            page: options.page,
            limit: options.limit,
            totalPages: Math.ceil((count || 0) / options.limit),
        });
    } catch (error) {
        console.error("Error in searchProfiles controller: ", error);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
}