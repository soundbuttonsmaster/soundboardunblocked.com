import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_BASE_URL || "https://play-v1.soundboard.cloud/media";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function resolveMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null

  try {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      // If backend is still sending full S3 URLs, extract the path and force MEDIA_BASE_URL
      if (path.includes('amazonaws.com') || path.includes('soundboard.cloud')) {
        const urlObj = new URL(path)
        let pathname = urlObj.pathname
        // Strip duplicate /media prefix if present
        if (pathname.startsWith('/media')) {
          pathname = pathname.substring(6)
        }
        return `${MEDIA_BASE_URL}${pathname}`
      }
      console.log('final path', path)
      return path
    }
  } catch (e) {
    // Ignore URL parsing errors
  }

  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${MEDIA_BASE_URL}${normalized}`
}


