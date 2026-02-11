/**
 * SEO Utility functions
 */

/**
 * Generates a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove non-word characters (except spaces and hyphens)
        .replace(/\s+/g, '-')      // Replace spaces with hyphens
        .replace(/--+/g, '-')      // Replace multiple hyphens with a single one
        .trim();                   // Trim leading/trailing whitespace
}

/**
 * Constructs a full canonical URL
 */
export function getCanonicalUrl(path: string): string {
    const baseUrl = 'https://zulfiqar-computers.com'; // Replace with actual domain
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
}
