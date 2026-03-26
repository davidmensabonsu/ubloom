export interface BookLink {
  label: string;
  /** Optional icon hint for rendering */
  url: string;
}

/** Purchase / listen links for each book resource */
export const bookLinks: Record<string, BookLink[]> = {
  'mind-2': [ // You Are a Badass
    { label: 'Apple Books', url: 'https://books.apple.com/us/book/you-are-a-badass/id602392690' },
    { label: 'Audible', url: 'https://www.audible.com/pd/You-Are-a-Badass-Audiobook/B00B3YS5EM' },
    { label: 'Amazon', url: 'https://www.amazon.com/dp/0762447699' },
  ],
  'mind-4': [ // The Gifts of Imperfection
    { label: 'Apple Books', url: 'https://books.apple.com/us/book/the-gifts-of-imperfection/id377448497' },
    { label: 'Audible', url: 'https://www.audible.com/pd/The-Gifts-of-Imperfection-Audiobook/B004GKMZ1O' },
    { label: 'Amazon', url: 'https://www.amazon.com/dp/159285849X' },
  ],
  'mind-6': [ // Atomic Habits
    { label: 'Apple Books', url: 'https://books.apple.com/us/book/atomic-habits/id1364532120' },
    { label: 'Audible', url: 'https://www.audible.com/pd/Atomic-Habits-Audiobook/1524779261' },
    { label: 'Amazon', url: 'https://www.amazon.com/dp/0735211299' },
  ],
  'well-4': [ // The Body Keeps the Score
    { label: 'Apple Books', url: 'https://books.apple.com/us/book/the-body-keeps-the-score/id821046099' },
    { label: 'Audible', url: 'https://www.audible.com/pd/The-Body-Keeps-the-Score-Audiobook/B00OAOQJXY' },
    { label: 'Amazon', url: 'https://www.amazon.com/dp/0143127748' },
  ],
  'life-3': [ // Slow Living
    { label: 'Apple Books', url: 'https://books.apple.com/us/search?term=slow+living' },
    { label: 'Amazon', url: 'https://www.amazon.com/s?k=slow+living+book' },
  ],
  'calm-4': [ // The Untethered Soul
    { label: 'Apple Books', url: 'https://books.apple.com/us/book/the-untethered-soul/id421114582' },
    { label: 'Audible', url: 'https://www.audible.com/pd/The-Untethered-Soul-Audiobook/B006LSZBB4' },
    { label: 'Amazon', url: 'https://www.amazon.com/dp/1572245379' },
  ],

  // ── Vitamins & Supplements ──
  'nutr-2': [ // Magnesium
    { label: 'Amazon', url: 'https://www.amazon.com/s?k=magnesium+glycinate+supplement' },
  ],
  'nutr-3': [ // Omega-3
    { label: 'Amazon', url: 'https://www.amazon.com/s?k=omega+3+fish+oil+supplement' },
  ],
  'nutr-5': [ // Vitamin D
    { label: 'Amazon', url: 'https://www.amazon.com/s?k=vitamin+d3+supplement' },
  ],
  'nutr-8': [ // Zinc
    { label: 'Amazon', url: 'https://www.amazon.com/s?k=zinc+supplement' },
  ],
  'nutr-9': [ // B-Complex
    { label: 'Amazon', url: 'https://www.amazon.com/s?k=vitamin+b+complex+supplement' },
  ],
  'nutr-10': [ // Probiotics
    { label: 'Amazon', url: 'https://www.amazon.com/s?k=probiotics+supplement+women' },
  ],
  'nutr-11': [ // Iron
    { label: 'Amazon', url: 'https://www.amazon.com/s?k=iron+supplement+gentle' },
  ],
  'nutr-12': [ // Collagen
    { label: 'Amazon', url: 'https://www.amazon.com/s?k=collagen+peptides+powder' },
  ],
};
