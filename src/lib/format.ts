import { site } from '@/content/site';

const number = new Intl.NumberFormat('ar-SA', {
  numberingSystem: 'latn',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const integer = new Intl.NumberFormat('ar-SA', { numberingSystem: 'latn' });

/** "5.00" — Latin digits, the convention on Saudi storefronts */
export const formatAmount = (value: number) => number.format(value);
export const formatSAR = (value: number) => `${number.format(value)} ${site.locale.currency.symbol}`;
export const formatInt = (value: number) => integer.format(value);

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));

export const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');
