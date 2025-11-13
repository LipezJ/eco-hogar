import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface UseDeleteResourceOptions {
  queryKeysToInvalidate?: Array<unknown[]>;
}

export function useDeleteResource({ queryKeysToInvalidate = [] }: UseDeleteResourceOptions = {}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();

  const deleteResource = async (url: string) => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'No se pudo eliminar el registro');
      }

      await Promise.all(
        queryKeysToInvalidate.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey })
        )
      );
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteResource, isDeleting, error };
}
