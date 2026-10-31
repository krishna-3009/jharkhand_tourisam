import { useEffect } from 'react';

const homeTitle = 'Explore Jharkhand | Jharkhand Tourism';
const homeDescription = 'Discover Jharkhand: explore destinations, waterfalls, heritage and local crafts, then build a personal trip plan.';

export function usePageMeta(title, description) {
  useEffect(() => {
    const descriptionTag = document.querySelector('meta[name="description"]');
    document.title = title;
    if (descriptionTag) descriptionTag.content = description;
    return () => {
      document.title = homeTitle;
      if (descriptionTag) descriptionTag.content = homeDescription;
    };
  }, [title, description]);
}
