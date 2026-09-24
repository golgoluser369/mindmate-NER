import { en } from './en';
import { hi } from './hi';
import { regional } from './regional';
import { as } from './as';
import { brx } from './brx';
import { mni } from './mni';
import { kha } from './kha';
import { grt } from './grt';
import { lus } from './lus';
import { kok } from './kok';
import { nag } from './nag';
import { ne } from './ne';
import { adi } from './adi';
import { bn } from './bn';
import { mjw } from './mjw';
import { mif } from './mif';
import { LanguageCode } from '../models/types';

export const locales = {
  en,
  hi,
  regional,
  as,
  brx,
  mni,
  kha,
  grt,
  lus,
  kok,
  nag,
  ne,
  adi,
  bn,
  mjw,
  mif
};

export type LocaleStrings = typeof en;

export function getStrings(lang: LanguageCode): LocaleStrings {
  let selected: Partial<LocaleStrings> = locales.en;
  if (lang === 'regional') {
    selected = locales.as || locales.regional || locales.en;
  } else if ((locales as any)[lang]) {
    selected = (locales as any)[lang];
  }
  return { ...en, ...selected } as LocaleStrings;
}
