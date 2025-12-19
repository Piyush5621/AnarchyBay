import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores').nullable().optional(),
    display_name: z.string().max(100).nullable().optional(),
    bio: z.string().max(500).nullable().optional(),
    social_links: z.object({
      instagram: z.string().url().or(z.literal('')).optional(),
      twitter: z.string().url().or(z.literal('')).optional(),
      facebook: z.string().url().or(z.literal('')).optional(),
      linkedin: z.string().url().or(z.literal('')).optional(),
      youtube: z.string().url().or(z.literal('')).optional(),
      tiktok: z.string().url().or(z.literal('')).optional(),
      website: z.string().url().or(z.literal('')).optional(),
      github: z.string().url().or(z.literal('')).optional(),
    }).optional(),
    preferred_payment_provider: z.enum(['stripe', 'razorpay']).optional(),
    stripe_customer_id: z.string().max(255).optional(),
    stripe_account_id: z.string().max(255).optional(),
  }).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
  ),
});

export const profileImageUploadSchema = z.object({
  file: z.object({
    mimetype: z.string().refine(
      (type) => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(type),
      { message: 'Only JPEG, PNG, WebP, and GIF images are allowed' }
    ),
    size: z.number().max(5 * 1024 * 1024, { message: 'Image size must be less than 5MB' }),
  }),
});