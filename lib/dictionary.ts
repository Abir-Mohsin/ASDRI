import 'server-only';

const dictionaries = {
  en: () => import('../dictionaries/en.json').then((module) => module.default),
  bn: () => import('../dictionaries/bn.json').then((module) => module.default),
  ar: () => import('../dictionaries/ar.json').then((module) => module.default),
};

export type Locale = keyof typeof dictionaries;

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]?.() ?? dictionaries.en();
};
