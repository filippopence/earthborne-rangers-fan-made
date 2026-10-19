import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import adventures from './adventures.json';

// An adventure's data in the current language. `translations.<locale>` holds the translated
// title and summary; when it also has `cards`, the card images of that language are in
// static/cards/<slug>/<locale>/ and use the translated names.
export function useAdventure(slug) {
  const {i18n} = useDocusaurusContext();
  const adventure = adventures[slug];
  if (!adventure) throw new Error(`Unknown adventure "${slug}"`);
  const t = adventure.translations?.[i18n.currentLocale];
  return {
    ...adventure,
    title: t?.title ?? adventure.title,
    summary: t?.summary ?? adventure.summary,
    cards: t?.cards ?? adventure.cards,
    cardFolder: t?.cards ? `${i18n.currentLocale}/` : '',
  };
}

export function useAdventures() {
  return Object.keys(adventures).map((slug) => [slug, useAdventure(slug)]);
}
