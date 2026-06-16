import { getHashPermalink, getPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Live',
      href: getHashPermalink('#live'),
    },
    {
      text: 'World Cup',
      href: getPermalink('/world-cup'),
    },
    {
      text: 'Seasons',
      href: getHashPermalink('#seasons'),
    },
    {
      text: 'Insights',
      href: getPermalink('/insights'),
    },
  ],
  actions: [],
};

export const footerData = {
  links: [
    {
      title: 'Syndicate',
      links: [
        { text: 'Live tracker', href: getHashPermalink('#live') },
        { text: 'World Cup 2026', href: getPermalink('/world-cup') },
        { text: '2025-26 season', href: getPermalink('/seasons/2025-26') },
        { text: '2024-25 season', href: getPermalink('/seasons/2024-25') },
        { text: 'Insights', href: getPermalink('/insights') },
        { text: 'Admin', href: getPermalink('/admin') },
      ],
    },
  ],
  secondaryLinks: [],
  socialLinks: [],
  footNote: `
    Syndicate betting tracker for Steven, Luke and Jamie.
  `,
};
