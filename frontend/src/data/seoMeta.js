export const siteUrl = 'https://www.mittirituals.com';
export const defaultOgImage = `${siteUrl}/og-image.svg`;

export const seoMetadata = {
  '/': {
    title: 'Mitti Rituals | Botanical Skincare & Organic Rituals',
    description:
      'Discover mindful botanical skincare, small-batch essentials, and calming daily rituals crafted for healthy, radiant skin.',
    keywords: 'botanical skincare, organic rituals, gentle skincare, self care products',
  },
  '/shop': {
    title: 'Shop Botanical Rituals | Mitti Rituals',
    description:
      'Explore plant-powered skincare essentials and daily rituals made with thoughtful ingredients and elevated self-care routines.',
    keywords: 'shop skincare, botanical products, self care routine, plant-based essentials',
  },
  '/our-story': {
    title: 'Our Story | Mitti Rituals',
    description:
      'Learn how Mitti Rituals blends gentle botanicals, slower rituals, and everyday luxury into thoughtful skincare for modern living.',
    keywords: 'our story, mindful skincare brand, botanical beauty brand',
  },
  '/ritual-guide': {
    title: 'Ritual Guide | Skin Care Recommendations | Mitti Rituals',
    description:
      'Find your ideal routine with easy skincare guidance, daily ritual recommendations, and gentle ingredient-driven self-care suggestions.',
    keywords: 'ritual guide, skincare routine, daily ritual, skin care recommendations',
  },
  '/faq': {
    title: 'Frequently Asked Questions | Mitti Rituals',
    description:
      'Browse common questions about shipping, product availability, gifting, and using Mitti Rituals skincare essentials.',
    keywords: 'FAQ skincare, shipping questions, mitti rituals support',
  },
  '/contact': {
    title: 'Contact Mitti Rituals | Customer Care',
    description:
      'Reach our customer care team for order support, skincare questions, and general enquiries about our botanical rituals.',
    keywords: 'contact mitti rituals, skincare support, customer care',
  },
  '/login': {
    title: 'Login | Mitti Rituals',
    description: 'Sign in to track orders, save wishlist items, and continue your ritual routine with ease.',
    keywords: 'login, skincare account, ritual account',
  },
  '/register': {
    title: 'Create an Account | Mitti Rituals',
    description: 'Create a Mitti Rituals account to save your routine, manage orders, and keep your favourite essentials close.',
    keywords: 'create account, skincare account sign up',
  },
  '/cart': {
    title: 'Shopping Bag | Mitti Rituals',
    description: 'Review your ritual essentials and prepare your order with a simple, premium shopping experience.',
    keywords: 'shopping bag, skincare cart, ritual cart',
  },
  '/wishlist': {
    title: 'Wishlist | Mitti Rituals',
    description: 'Keep your favourite rituals saved and ready to revisit whenever your next self-care ritual begins.',
    keywords: 'wishlist, saved skincare products',
  },
  '/checkout': {
    title: 'Secure Checkout | Mitti Rituals',
    description: 'Complete your ritual order with a smooth, secure checkout experience designed for everyday confidence.',
    keywords: 'secure checkout, skincare checkout',
  },
  '/account': {
    title: 'My Account | Mitti Rituals',
    description: 'Manage your profile, saved rituals, and order history in one easy, personal account dashboard.',
    keywords: 'account dashboard, skincare profile, order history',
  },
  '/verify-email': {
    title: 'Verify Email | Mitti Rituals',
    description: 'Verify your email to activate your account and keep your skincare purchases and preferences synced.',
    keywords: 'verify email, account verification',
  },
  '/reset-password': {
    title: 'Reset Password | Mitti Rituals',
    description: 'Reset your password and return to your ritual routine with secure account access.',
    keywords: 'reset password, skincare account recovery',
  },
  '/policies/privacy': {
    title: 'Privacy Policy | Mitti Rituals',
    description: 'Read how Mitti Rituals protects your personal information and uses data responsibly in our store experience.',
    keywords: 'privacy policy, skincare privacy',
  },
  '/policies/terms': {
    title: 'Terms of Service | Mitti Rituals',
    description: 'Review the website and purchase terms for shopping and using Mitti Rituals products and services.',
    keywords: 'terms of service, website terms',
  },
  '/policies/shipping': {
    title: 'Shipping & Returns | Mitti Rituals',
    description: 'Learn how shipping, delivery timing, and returns work for your order of botanical skin essentials.',
    keywords: 'shipping and returns, skincare delivery policy',
  },
};

export function getSeoMetadata(pathname, product = null) {
  const cleanedPath = pathname.replace(/\/+$/, '') || '/';
  const base = seoMetadata[cleanedPath] || seoMetadata['/'];

  if (product && cleanedPath.startsWith('/products/')) {
    return {
      ...base,
      title: `${product.name} | Mitti Rituals`,
      description:
        product.description ||
        product.shortDescription ||
        'Explore this botanical wellness essential from Mitti Rituals and discover a more mindful skincare ritual.',
      canonical: `${siteUrl}${cleanedPath}`,
    };
  }

  return {
    ...base,
    canonical: `${siteUrl}${cleanedPath}`,
  };
}
