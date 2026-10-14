/** Russian plural: 1 запись, 2 записи, 5 записей */
export function pluralRu(
  n: number,
  one: string,
  few: string,
  many: string,
): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

export function countLabel(
  n: number,
  one: string,
  few: string,
  many: string,
): string {
  return `${n} ${pluralRu(n, one, few, many)}`;
}
