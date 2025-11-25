import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  schema?: object;
  keywords?: string[];
}

export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  image = 'https://picsum.photos/800/450', 
  url = window.location.href, 
  type = 'website',
  schema,
  keywords = []
}) => {
  
  useEffect(() => {
    // 1. Update Title
    document.title = `${title} | مزاد بلس`;

    // 2. Update Meta Tags
    const updateMeta = (name: string, content: string, attribute: 'name' | 'property' = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    updateMeta('description', description);
    updateMeta('keywords', keywords.join(', '));

    // Open Graph / Facebook
    updateMeta('og:type', type, 'property');
    updateMeta('og:title', title, 'property');
    updateMeta('og:description', description, 'property');
    updateMeta('og:image', image, 'property');
    updateMeta('og:url', url, 'property');
    updateMeta('og:site_name', 'مزاد بلس', 'property');

    // Twitter
    updateMeta('twitter:card', 'summary_large_image', 'name');
    updateMeta('twitter:title', title, 'name');
    updateMeta('twitter:description', description, 'name');
    updateMeta('twitter:image', image, 'name');

    // 3. Update JSON-LD Schema
    if (schema) {
      let script = document.querySelector('#seo-schema');
      if (!script) {
        script = document.createElement('script');
        script.id = 'seo-schema';
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schema);
    }

    // Cleanup function (optional, strictly not removing tags to keep history, but ensuring updates)
    return () => {
      // We generally leave the tags for the next page to overwrite, 
      // but specific cleanup logic can go here if needed.
    };
  }, [title, description, image, url, type, schema, keywords]);

  return null;
};