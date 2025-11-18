import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface UseDeleteResourceOptions {
  /** Query keys de React Query a invalidar tras borrar. */
  queryKeysToInvalidate?: Array<unknown[]>;
}

/**
 * Hook para eliminar recursos vía DELETE con invalidación de caché.
 * @param queryKeysToInvalidate listas de claves a refrescar tras el delete.
 * @returns deleteResource(url), isDeleting y error.
 */
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
