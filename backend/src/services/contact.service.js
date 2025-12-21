import { supabase } from "../lib/supabase.js";

export const submitContactService = async ({
  name,
  email,
  subject,
  message,
}) => {
  const { data, error } = await supabase
    .from("contact_messages")
    .insert([{
        name,
        email,
        subject: subject || null,
        message,
      }])
    .select()
    .single();

  if (error) {
    console.error("Supabase contact insert error:", error);
    throw new Error(error.message || "Failed to save contact message");
  }

  return data;
};

// ✅ UPGRADED: Now handles Pagination!
export const getContactMessagesService = async ({ page, limit } = {}) => {
  let query = supabase
    .from("contact_messages")
    .select("*", { count: 'exact' }) // Get total count too
    .order("created_at", { ascending: false });

  // Apply pagination only if page/limit are provided
  if (page && limit) {
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("Supabase fetch contacts error:", error);
    throw new Error(error.message);
  }

  return { data, count };
};

// New Service for replying (Moved logic from controller to here)
export const replyToMessageService = async (id, replyMessage) => {
   // Update DB
   const { error } = await supabase
    .from("contact_messages")
    .update({
      replied_at: new Date().toISOString(),
      reply_message: replyMessage,
    })
    .eq("id", id);

    if (error) throw new Error(error.message);
    return true;
}