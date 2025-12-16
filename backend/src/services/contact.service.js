import { supabase } from '../lib/supabase.js';

export const submitContactService = async ({ name, email, subject, message }) => {
  const { data, error } = await supabase
    .from('contact_messages')
    .insert([{ name, email, subject, message }])
    .select()
    .single();

  if (error) throw error;

  return data;
};
