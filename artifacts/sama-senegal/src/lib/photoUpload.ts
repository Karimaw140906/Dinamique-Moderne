import { useRef } from "react";

export function usePhotoUpload(onResult: (base64: string) => void) {
  const fileRef = useRef<HTMLInputElement>(null);
  const trigger = () => fileRef.current?.click();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onResult(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };
  return { fileRef, trigger, handleChange };
}
