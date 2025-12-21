import { 
    updateUserRoles, 
    setVerifiedSeller, 
    toggleAdminBadge,
    addRoleToUser,
    removeRoleFromUser,
    getAllUsersWithRoles
} from "../services/admin.service.js";

/**
 * Update user roles
 * PUT /api/admin/users/:userId/roles
 */
export const updateUserRolesController = async (req, res) => {
    try {
        const { userId } = req.params;
        const { roles } = req.body;

        if (!roles || !Array.isArray(roles)) {
            return res.status(400).json({ 
                success: false, 
                message: "Roles must be an array" 
            });
        }

        const { data, error } = await updateUserRoles({ userId, roles });

        if (error) {
            return res.status(400).json({ 
                success: false, 
                message: error.message 
            });
        }

        res.json({ 
            success: true, 
            user: data 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

/**
 * Add role to user
 * POST /api/admin/users/:userId/roles/:role
 */
export const addRoleController = async (req, res) => {
    try {
        const { userId, role } = req.params;

        const { data, error } = await addRoleToUser({ userId, role });

        if (error) {
            return res.status(400).json({ 
                success: false, 
                message: error.message 
            });
        }

        res.json({ 
            success: true, 
            user: data 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

/**
 * Remove role from user
 * DELETE /api/admin/users/:userId/roles/:role
 */
export const removeRoleController = async (req, res) => {
    try {
        const { userId, role } = req.params;

        const { data, error } = await removeRoleFromUser({ userId, role });

        if (error) {
            return res.status(400).json({ 
                success: false, 
                message: error.message 
            });
        }

        res.json({ 
            success: true, 
            user: data 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

/**
 * Set verified seller badge
 * PUT /api/admin/users/:userId/verified-seller
 */
export const setVerifiedSellerController = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isVerified } = req.body;

        if (typeof isVerified !== 'boolean') {
            return res.status(400).json({ 
                success: false, 
                message: "isVerified must be a boolean" 
            });
        }

        const { data, error } = await setVerifiedSeller({ userId, isVerified });

        if (error) {
            return res.status(400).json({ 
                success: false, 
                message: error.message 
            });
        }

        res.json({ 
            success: true, 
            user: data 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

/**
 * Toggle admin badge visibility
 * PUT /api/admin/users/:userId/admin-badge
 */
export const toggleAdminBadgeController = async (req, res) => {
    try {
        const { userId } = req.params;
        const { showBadge } = req.body;

        if (typeof showBadge !== 'boolean') {
            return res.status(400).json({ 
                success: false, 
                message: "showBadge must be a boolean" 
            });
        }

        const { data, error } = await toggleAdminBadge({ userId, showBadge });

        if (error) {
            return res.status(400).json({ 
                success: false, 
                message: error.message 
            });
        }

        res.json({ 
            success: true, 
            user: data 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

/**
 * Get all users with roles
 * GET /api/admin/users
 */
export const getAllUsersController = async (req, res) => {
    try {
        const { page = 1, limit = 20, role } = req.query;

        const { data, error, count } = await getAllUsersWithRoles({ 
            page: parseInt(page), 
            limit: parseInt(limit),
            roleFilter: role 
        });

        if (error) {
            return res.status(400).json({ 
                success: false, 
                message: error.message 
            });
        }

        res.json({ 
            success: true, 
            users: data,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};
