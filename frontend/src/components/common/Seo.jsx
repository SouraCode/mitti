import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { defaultOgImage, getSeoMetadata, siteUrl } from '../../data/seoMeta';

function setMetaContent(name, content) {
  let tag = document.head.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setPropertyContent(name, content) {
  let tag = document.head.querySelector(`meta[property="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setJsonLd(schema, id) {
  let tag = document.head.querySelector(`script[data-seo-schema="${id}"]`);
  if (!tag) {
    tag = document.createElement('script');
    tag.setAttribute('type', 'application/ld+json');
    tag.setAttribute('data-seo-schema', id);
    document.head.appendChild(tag);
  }
  tag.textContent = JSON.stringify(schema);
}

function buildProductSchema(product, reviews = []) {
  if (!product) return null;

  const averageRating = Number(product.rating?.average || 0);
  const reviewCount = Number(product.rating?.count || reviews.length || 0);
  const primaryImage = product.images?.[0]?.url || defaultOgImage;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images?.map((image) => image.url || primaryImage) || [primaryImage],
    description: product.description || product.shortDescription || '',
    brand: {
      '@type': 'Brand',
      name: 'Mitti Rituals',
    },
    category: product.category || 'Skincare',
    sku: product.id || product.slug,
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/products/${product.slug}`,
      priceCurrency: 'INR',
      price: Number(product.price || 0),
      itemCondition: 'https://schema.org/NewCondition',
      availability:
        product.stock?.state === 'out_of_stock'
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
    },
  };

  if (reviewCount > 0 || averageRating > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: averageRating,
      reviewCount,
      bestRating: 5,
      ratingCount: reviewCount,
    };
  }

  if (reviews?.length) {
    schema.review = reviews.slice(0, 5).map((review) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.customer?.name || 'Verified customer',
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: Number(review.rating || 0),
        bestRating: 5,
      },
      reviewBody: review.body || '',
    }));
  }

  return schema;
}

function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Mitti Rituals',
    url: siteUrl,
    logo: `${siteUrl}/og-image.svg`,
    sameAs: ['https://instagram.com', 'https://facebook.com'],
  };
}

export default function Seo() {
  const location = useLocation();

  useEffect(() => {
    const { pathname, search } = location;
    const product = typeof window !== 'undefined' ? window.__mittiProduct || null : null;
    const reviews = typeof window !== 'undefined' ? window.__mittiReviews || [] : [];
    const metadata = getSeoMetadata(pathname, product);
    const canonicalUrl = `${siteUrl}${pathname}${search || ''}`;

    document.title = metadata.title;
    setMetaContent('description', metadata.description);
    setMetaContent('robots', 'index,follow,max-image-preview:large');
    setMetaContent('theme-color', '#7f3f4d');
    setMetaContent('keywords', metadata.keywords || 'botanical skincare, organic rituals');

    setPropertyContent('og:title', metadata.title);
    setPropertyContent('og:description', metadata.description);
    setPropertyContent('og:type', 'website');
    setPropertyContent('og:url', canonicalUrl);
    setPropertyContent('og:image', defaultOgImage);
    setPropertyContent('og:site_name', 'Mitti Rituals');

    setMetaContent('twitter:card', 'summary_large_image');
    setMetaContent('twitter:title', metadata.title);
    setMetaContent('twitter:description', metadata.description);
    setMetaContent('twitter:image', defaultOgImage);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    if (pathname.startsWith('/products/')) {
      const productSchema = buildProductSchema(product, reviews);
      if (productSchema) setJsonLd(productSchema, 'mitti-product-schema');
      setJsonLd(buildOrganizationSchema(), 'mitti-organization-schema');
    } else {
      setJsonLd(buildOrganizationSchema(), 'mitti-organization-schema');
    }
  }, [location]);

  return null;
}
