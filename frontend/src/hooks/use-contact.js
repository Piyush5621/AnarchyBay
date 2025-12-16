import { useMutation } from '@tanstack/react-query';
import { submitContact } from '../services/contact.service.js';

export const useContact = () => {
  const mutation = useMutation({
    mutationFn: submitContact,
  });

  return {
    submit: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    isSuccess: mutation.isSuccess,
  };
};
