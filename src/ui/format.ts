export function formatDate(iso: string, now = new Date()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  if (d.getFullYear() !== now.getFullYear()) options.year = 'numeric';
  return d.toLocaleDateString('en-US', options);
}

export function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}

export function youglishUrl(phrase: string): string {
  return `https://youglish.com/pronounce/${encodeURIComponent(phrase)}/english/us`;
}
