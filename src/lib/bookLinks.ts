export interface BookLink {
  label: string;
  url: string;
  topPick?: boolean;
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
    { label: 'Doctor\'s Best', url: 'https://www.amazon.com/dp/B000BD0RT0', topPick: true },
    { label: 'Nature Made', url: 'https://www.amazon.com/dp/B004U3Y9FU' },
    { label: 'Natural Vitality Calm', url: 'https://www.amazon.com/dp/B00BPUY3W0' },
  ],
  'nutr-3': [ // Omega-3
    { label: 'Nordic Naturals', url: 'https://www.amazon.com/dp/B002CQU564', topPick: true },
    { label: 'Nature Made Fish Oil', url: 'https://www.amazon.com/dp/B005GG0MN4' },
    { label: 'Viva Naturals', url: 'https://www.amazon.com/dp/B011LUK3AC' },
  ],
  'nutr-5': [ // Vitamin D
    { label: 'NatureWise D3', url: 'https://www.amazon.com/dp/B00GB85JR4', topPick: true },
    { label: 'Sports Research D3', url: 'https://www.amazon.com/dp/B00JGCBGZQ' },
    { label: 'Nature Made D3', url: 'https://www.amazon.com/dp/B004U3Y894' },
  ],
  'nutr-8': [ // Zinc
    { label: 'Thorne Zinc Picolinate', url: 'https://www.amazon.com/dp/B0797DMJCF', topPick: true },
    { label: 'Garden of Life', url: 'https://www.amazon.com/dp/B07GBSP7R3' },
    { label: 'Nature Made Zinc', url: 'https://www.amazon.com/dp/B0000DJBBV' },
  ],
  'nutr-9': [ // B-Complex
    { label: 'Thorne B-Complex', url: 'https://www.amazon.com/dp/B000FGWDTK', topPick: true },
    { label: 'Garden of Life B-Complex', url: 'https://www.amazon.com/dp/B00K5NEPJY' },
    { label: 'Nature Made Super B', url: 'https://www.amazon.com/dp/B001F71XAI' },
  ],
  'nutr-10': [ // Probiotics
    { label: 'Garden of Life Women\'s', url: 'https://www.amazon.com/dp/B00Y8MP4G6', topPick: true },
    { label: 'Culturelle Daily', url: 'https://www.amazon.com/dp/B071DZQLPQ' },
    { label: 'Renew Life Women\'s', url: 'https://www.amazon.com/dp/B002ECUJDC' },
  ],
  'nutr-11': [ // Iron
    { label: 'MegaFood Blood Builder', url: 'https://www.amazon.com/dp/B009NH8QDG', topPick: true },
    { label: 'Garden of Life Iron', url: 'https://www.amazon.com/dp/B019GN70QE' },
    { label: 'Nature Made Iron', url: 'https://www.amazon.com/dp/B0000DJBKK' },
  ],
  'nutr-12': [ // Collagen
    { label: 'Vital Proteins', url: 'https://www.amazon.com/dp/B00K6JUG4K', topPick: true },
    { label: 'Sports Research', url: 'https://www.amazon.com/dp/B01BQX7GLC' },
    { label: 'Garden of Life Collagen', url: 'https://www.amazon.com/dp/B01LQZ7IS4' },
  ],
};
