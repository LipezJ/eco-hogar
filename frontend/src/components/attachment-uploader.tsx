import type { ChangeEvent } from "react";
import { Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from "@/lib/api-config";

type AttachmentValue = string | File | null | undefined;

interface AttachmentUploaderProps {
  value?: AttachmentValue;
  onChange: (value?: AttachmentValue) => void;
  placeholder?: string;
}

/**
 * Uploader control que acepta imágenes/PDF y muestra estado del adjunto.
 * @param value string (URL), File o null.
 * @param onChange callback al seleccionar/limpiar.
 * @param placeholder texto opcional.
 */
export function AttachmentUploader({ value, onChange, placeholder }: AttachmentUploaderProps) {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    onChange(file);
    event.target.value = '';
  };

  const handleClear = () => onChange(undefined);

  const hasSavedFile = typeof value === 'string' && value.length > 0;
  const savedValue = hasSavedFile ? value as string : undefined;
  const fileUrl = savedValue
    ? (savedValue.startsWith('http') ? savedValue : `${API_BASE_URL}${savedValue}`)
    : null;
  const isFileValue = typeof File !== "undefined" && value instanceof File;
  const fileLabel = isFileValue ? value.name : (savedValue ?? '');
  const displayLabel = fileLabel.length > 36
    ? `${fileLabel.slice(0, 18)}…${fileLabel.slice(-12)}`
    : fileLabel;

  return (
    <div className="space-y-2">
      <Input
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileChange}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
      />
      {placeholder && (
        <p className="text-xs text-muted-foreground">{placeholder}</p>
      )}

      {(isFileValue || hasSavedFile) && (
        <div className="flex items-center justify-between rounded-md border p-2 text-sm">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Paperclip className="h-4 w-4" />
              {displayLabel}
            </div>
            {isFileValue && (
              <span className="text-[11px] text-muted-foreground">
                Se subirá cuando guardes el formulario
              </span>
            )}
            {!isFileValue && fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary hover:underline"
              >
                Ver comprobante
              </a>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={handleClear}>
            <X className="h-4 w-4" />
            <span className="sr-only">Eliminar adjunto</span>
          </Button>
        </div>
      )}
    </div>
  );
}
