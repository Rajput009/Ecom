import React from 'react';
import { Helmet } from 'react-helmet-async';
import { getCanonicalUrl } from '../utils/seo';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    canonical?: string;
    type?: 'website' | 'product';
    schema?: any;
}

export const SEO: React.FC<SEOProps> = ({
    title,
    description = 'Zulfiqar Computers - Premium PC components and expert repair services in Pakistan.',
    image = '/og-image.jpg', // Default OG image
    canonical,
    type = 'website',
    schema,
}) => {
    const siteTitle = 'Zulfiqar Computers';
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const canonicalUrl = getCanonicalUrl(canonical || window.location.pathname);

    return (
        <Helmet>
            {/* Basic Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={canonicalUrl} />

            {/* OpenGraph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:site_name" content={siteTitle} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Schema.org / JSON-LD */}
            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            )}
        </Helmet>
    );
};
