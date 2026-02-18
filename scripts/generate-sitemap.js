import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';
const SITE_URL = process.env.SITE_URL || 'https://zulfiqar-computers.com';

const staticRoutes = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/products', priority: '0.9', changefreq: 'daily' },
  { url: '/pc-builder', priority: '0.8', changefreq: 'weekly' },
  { url: '/repair', priority: '0.8', changefreq: 'weekly' },
  { url: '/track-repair', priority: '0.7', changefreq: 'weekly' },
];

const generateSlug = (text = '') =>
  String(text)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();

const buildStaticSitemapXml = () => {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  for (const route of staticRoutes) {
    xml += `
  <url>
    <loc>${SITE_URL}${route.url}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
  }

  xml += `
</urlset>`;
  return xml;
};

async function fetchProducts() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return [];
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/products?select=id,name,updated_at`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function generateSitemap() {
  const publicDir = join(__dirname, '..', 'public');
  const sitemapPath = join(publicDir, 'sitemap.xml');
  let xml = buildStaticSitemapXml();

  try {
    const products = await fetchProducts();

    if (products.length > 0) {
      xml = xml.replace(
        '</urlset>',
        `${products
          .map((product) => {
            const slug = generateSlug(product.name);
            const lastMod = product.updated_at
              ? new Date(product.updated_at).toISOString().split('T')[0]
              : null;
            return `
  <url>
    <loc>${SITE_URL}/product/${product.id}/${slug}</loc>
    ${lastMod ? `<lastmod>${lastMod}</lastmod>` : ''}
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
          })
          .join('')}
</urlset>`
      );
    }
  } catch (error) {
    console.warn('[sitemap] Proceeding with static routes only:', error.message);
  }

  fs.writeFileSync(sitemapPath, xml);
  console.log(`[sitemap] Generated ${sitemapPath}`);
}

generateSitemap().catch((error) => {
  console.warn('[sitemap] Non-fatal error:', error.message);
});
