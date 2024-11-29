export const normalizeTitle = (title?: string | null): string => {
  return (title || '')
    .replace(/( |\/)/g, '-') // Replace spaces and slashes with dashes
    .replace(/[^a-zA-Z0-9-\u4e00-\u9FFF\uAC00-\uD7AF\u3130-\u318F\u3041-\u3096\u30A1-\u30FC\u3000-\u303F]/g, '') // Retain Korean characters
    .replace(/--+/g, '-') // Replace multiple dashes with a single dash
    .replace(/^-+|-+$/g, '') // Trim leading and trailing dashes
    .trim()
    .toLowerCase()
}
