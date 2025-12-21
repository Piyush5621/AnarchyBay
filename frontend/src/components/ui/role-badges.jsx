import React from 'react';
import { Shield, CheckCircle, Star, User } from 'lucide-react';

/**
 * Badge component for displaying user roles and verification status
 */
export const RoleBadge = ({ role, className = '' }) => {
  const badgeConfig = {
    admin: {
      icon: Shield,
      label: 'Admin',
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
      borderColor: 'border-red-300'
    },
    creator: {
      icon: Star,
      label: 'Creator',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-300'
    },
    seller: {
      icon: User,
      label: 'Seller',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-300'
    },
    customer: {
      icon: User,
      label: 'Customer',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-300'
    }
  };

  const config = badgeConfig[role] || badgeConfig.customer;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${config.bgColor} ${config.textColor} ${config.borderColor} ${className}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

/**
 * Verified seller badge with green checkmark
 */
export const VerifiedBadge = ({ className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border bg-green-100 text-green-700 border-green-300 ${className}`}
      title="Verified Seller"
    >
      <CheckCircle className="w-3 h-3 fill-current" />
      Verified
    </span>
  );
};

/**
 * Display all badges for a user profile
 */
export const UserBadges = ({ 
  roles = [], 
  isVerifiedSeller = false, 
  showAdminBadge = false,
  className = '' 
}) => {
  // Handle legacy single role field
  const rolesArray = Array.isArray(roles) ? roles : [roles];
  
  // Filter roles to display
  const displayRoles = rolesArray.filter(role => {
    // Always show non-admin roles
    if (role !== 'admin') return true;
    // Only show admin if showAdminBadge is true
    return showAdminBadge;
  });

  // Don't show customer badge if user has other roles
  const shouldShowCustomer = displayRoles.length === 1 && displayRoles[0] === 'customer';
  const rolesToShow = shouldShowCustomer ? displayRoles : displayRoles.filter(r => r !== 'customer');

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {rolesToShow.map((role) => (
        <RoleBadge key={role} role={role} />
      ))}
      {isVerifiedSeller && rolesArray.includes('seller') && (
        <VerifiedBadge />
      )}
    </div>
  );
};

/**
 * Compact badge display for search results and listings
 */
export const CompactUserBadges = ({ 
  roles = [], 
  isVerifiedSeller = false, 
  showAdminBadge = false 
}) => {
  const rolesArray = Array.isArray(roles) ? roles : [roles];
  
  // Determine primary role to display
  let primaryRole = 'customer';
  if (showAdminBadge && rolesArray.includes('admin')) {
    primaryRole = 'admin';
  } else if (rolesArray.includes('creator')) {
    primaryRole = 'creator';
  } else if (rolesArray.includes('seller')) {
    primaryRole = 'seller';
  }

  return (
    <div className="inline-flex items-center gap-1">
      {primaryRole !== 'customer' && <RoleBadge role={primaryRole} />}
      {isVerifiedSeller && rolesArray.includes('seller') && (
        <CheckCircle className="w-4 h-4 text-green-600 fill-current" title="Verified Seller" />
      )}
    </div>
  );
};
