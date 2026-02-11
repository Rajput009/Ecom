import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase Configuration (Using the values from the environment or falling back to the project defaults)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://yanpbthptucrpwdpguos.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_bc5VzTD0vS4fmUhG1dn0aA_kiyIkYB_';
const SITE_URL = 'https://zulfiqar-computers.com';

const generateSlug = (text) => {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();
};

async function generateSitemap() {
    console.log('🚀 Starting dynamic sitemap generation...');

    try {
        // 1. Fetch products from Supabase
        // We use the REST API directly to avoid extra dependencies in this script
        const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,name,updated_at`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch products: ${response.statusText}`);
        }

        const products = await response.json();
        console.log(`📦 Fetched ${products.length} products from database.`);

        // 2. Define static routes
        const staticRoutes = [
            { url: '/', priority: '1.0', changefreq: 'daily' },
            { url: '/products', priority: '0.9', changefreq: 'daily' },
            { url: '/pc-builder', priority: '0.8', changefreq: 'weekly' },
            { url: '/repair', priority: '0.8', changefreq: 'weekly' },
        ];

        // 3. Construct XML
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        // Add static routes
        staticRoutes.forEach(route => {
            xml += `
  <url>
    <loc>${SITE_URL}${route.url}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
        });

        // Add dynamic product routes
        products.forEach(product => {
            const slug = generateSlug(product.name);
            const lastMod = new Date(product.updated_at).toISOString().split('T')[0];
            xml += `
  <url>
    <loc>${SITE_URL}/product/${product.id}/${slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
        });

        xml += `
</urlset>`;

        // 4. Write to public directory
        const publicDir = join(__dirname, '..', 'public');
        const sitemapPath = join(publicDir, 'sitemap.xml');

        fs.writeFileSync(sitemapPath, xml);
        console.log(`✅ Sitemap successfully generated at ${sitemapPath}`);

    } catch (error) {
        console.error('❌ Error generating sitemap:', error.message);
        process.exit(1);
    }
}

generateSitemap();
