/**
 * Image utilities for StayMate
 * Provides fallback logic and placeholder generation for all image types
 */

// Default property placeholder - simple gradient CSS that works without external URLs
export const PROPERTY_PLACEHOLDER = '/images/property-placeholder.svg'

// Generate initials from a name
export function getInitials(name: string): string {
    if (!name) return '?'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase()
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

// Generate a consistent color from a string (for avatar backgrounds)
export function getAvatarColor(name: string): string {
    if (!name) return 'hsl(220, 70%, 50%)'

    let hash = 0
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }

    // Generate a pleasing hue (avoid too-bright or too-dark colors)
    const hue = Math.abs(hash) % 360
    return `hsl(${hue}, 65%, 45%)`
}

// Check if a URL is a valid image URL from our backend (MinIO)
export function isValidImageUrl(url: string | undefined | null): boolean {
    if (!url) return false

    // Accept MinIO/backend URLs
    const validPatterns = [
        '/api/uploads/',
        'localhost:8080',
        'localhost:9005',
        // '/api/uploads/',
        // 'api.staymate.puspo.online',
        'minio',
        // process.env.NEXT_PUBLIC_API_URL?.replace('https://', '').replace('http://', '') || 'localhost',
    ]

    return validPatterns.some(pattern => url.includes(pattern))
}

// Get a safe image URL with fallback
export function getSafeImageUrl(
    url: string | undefined | null,
    fallback: string = PROPERTY_PLACEHOLDER
): string {
    if (isValidImageUrl(url)) {
        return url!
    }
    return fallback
}

// Handle image error event - sets a data attribute for CSS styling
export function handleImageError(event: React.SyntheticEvent<HTMLImageElement, Event>) {
    const target = event.currentTarget
    target.style.display = 'none'
    // Try to show the parent's fallback
    const parent = target.parentElement
    if (parent) {
        parent.setAttribute('data-image-failed', 'true')
    }
}
