import { supabase } from "../lib/supabase.js";

export const submitContactService = async ({
  name,
  email,
  subject,
  message,
}) => {
  const { data, error } = await supabase
    .from("contact_messages")
    .insert([
      {
        name,
        email,
        subject: subject || null, // ✅ important
        message,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Supabase contact insert error:", error);
    throw new Error(error.message || "Failed to save contact message");
  }

  return data;
};


export const getAllContactMessagesService = async () => {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase fetch contacts error:", error);
    throw new Error(error.message);
  }

  return data;
};
