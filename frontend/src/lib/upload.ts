import { API_ENDPOINTS } from "@/lib/api-config";

export interface UploadResponse {
  url: string;
  path: string;
  filename: string;
}

export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(API_ENDPOINTS.uploads, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? 'No se pudo subir el archivo.');
  }

  return await res.json();
}
