export interface BookLink {
  label: string;
  url: string;
  topPick?: boolean;
  rating?: number;
  reviews?: number;
  price?: string;
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
    { label: 'Doctor\'s Best', url: 'https://www.amazon.com/dp/B000BD0RT0', topPick: true, rating: 4.7, reviews: 89400, price: '$9.99' },
    { label: 'Nature Made', url: 'https://www.amazon.com/dp/B004U3Y9FU', rating: 4.6, reviews: 24300, price: '$7.49' },
    { label: 'Natural Vitality Calm', url: 'https://www.amazon.com/dp/B00BPUY3W0', rating: 4.6, reviews: 52100, price: '$23.99' },
  ],
  'nutr-3': [ // Omega-3
    { label: 'Nordic Naturals', url: 'https://www.amazon.com/dp/B002CQU564', topPick: true, rating: 4.7, reviews: 31200, price: '$27.99' },
    { label: 'Nature Made Fish Oil', url: 'https://www.amazon.com/dp/B005GG0MN4', rating: 4.6, reviews: 18700, price: '$11.49' },
    { label: 'Viva Naturals', url: 'https://www.amazon.com/dp/B011LUK3AC', rating: 4.5, reviews: 42600, price: '$24.99' },
  ],
  'nutr-5': [ // Vitamin D
    { label: 'NatureWise D3', url: 'https://www.amazon.com/dp/B00GB85JR4', topPick: true, rating: 4.8, reviews: 112000, price: '$13.99' },
    { label: 'Sports Research D3', url: 'https://www.amazon.com/dp/B00JGCBGZQ', rating: 4.7, reviews: 67400, price: '$16.95' },
    { label: 'Nature Made D3', url: 'https://www.amazon.com/dp/B004U3Y894', rating: 4.7, reviews: 28900, price: '$8.99' },
  ],
  'nutr-8': [ // Zinc
    { label: 'Thorne Zinc Picolinate', url: 'https://www.amazon.com/dp/B0797DMJCF', topPick: true, rating: 4.7, reviews: 18200, price: '$14.00' },
    { label: 'Garden of Life', url: 'https://www.amazon.com/dp/B07GBSP7R3', rating: 4.5, reviews: 9800, price: '$11.99' },
    { label: 'Nature Made Zinc', url: 'https://www.amazon.com/dp/B0000DJBBV', rating: 4.6, reviews: 35100, price: '$5.49' },
  ],
  'nutr-9': [ // B-Complex
    { label: 'Thorne B-Complex', url: 'https://www.amazon.com/dp/B000FGWDTK', topPick: true, rating: 4.7, reviews: 14600, price: '$21.00' },
    { label: 'Garden of Life B-Complex', url: 'https://www.amazon.com/dp/B00K5NEPJY', rating: 4.5, reviews: 11200, price: '$24.99' },
    { label: 'Nature Made Super B', url: 'https://www.amazon.com/dp/B001F71XAI', rating: 4.6, reviews: 22800, price: '$9.99' },
  ],
  'nutr-10': [ // Probiotics
    { label: 'Garden of Life Women\'s', url: 'https://www.amazon.com/dp/B00Y8MP4G6', topPick: true, rating: 4.6, reviews: 47300, price: '$29.99' },
    { label: 'Culturelle Daily', url: 'https://www.amazon.com/dp/B071DZQLPQ', rating: 4.5, reviews: 19400, price: '$18.99' },
    { label: 'Renew Life Women\'s', url: 'https://www.amazon.com/dp/B002ECUJDC', rating: 4.5, reviews: 28600, price: '$23.49' },
  ],
  'nutr-11': [ // Iron
    { label: 'MegaFood Blood Builder', url: 'https://www.amazon.com/dp/B009NH8QDG', topPick: true, rating: 4.7, reviews: 26800, price: '$19.97' },
    { label: 'Garden of Life Iron', url: 'https://www.amazon.com/dp/B019GN70QE', rating: 4.5, reviews: 8900, price: '$14.99' },
    { label: 'Nature Made Iron', url: 'https://www.amazon.com/dp/B0000DJBKK', rating: 4.6, reviews: 15200, price: '$4.99' },
  ],
  'nutr-12': [ // Collagen
    { label: 'Vital Proteins', url: 'https://www.amazon.com/dp/B00K6JUG4K', topPick: true, rating: 4.6, reviews: 83500, price: '$25.49' },
    { label: 'Sports Research', url: 'https://www.amazon.com/dp/B01BQX7GLC', rating: 4.6, reviews: 41200, price: '$29.95' },
    { label: 'Garden of Life Collagen', url: 'https://www.amazon.com/dp/B01LQZ7IS4', rating: 4.5, reviews: 12700, price: '$22.99' },
  ],

  // ── Hygiene & Self-Care ──
  'hyg-1': [ // Morning Shower Routine
    { label: 'Tree Hut Shea Sugar Scrub', url: 'https://www.amazon.com/dp/B001R2GF5K', topPick: true, rating: 4.7, reviews: 58200, price: '$8.99' },
    { label: 'Salux Nylon Washcloth', url: 'https://www.amazon.com/dp/B007IAE5WY', rating: 4.6, reviews: 31400, price: '$6.50' },
    { label: 'Bio-Oil Skincare Oil', url: 'https://www.amazon.com/dp/B004AI97MA', rating: 4.6, reviews: 42800, price: '$14.99' },
  ],
  'hyg-2': [ // Oral Care
    { label: 'Oral-B iO Series 5', url: 'https://www.amazon.com/dp/B0B4NBJNTD', topPick: true, rating: 4.6, reviews: 24300, price: '$89.99' },
    { label: 'Dr. Tung\'s Tongue Scraper', url: 'https://www.amazon.com/dp/B00064JGBO', rating: 4.6, reviews: 38700, price: '$7.99' },
    { label: 'Crest 3D Whitestrips', url: 'https://www.amazon.com/dp/B00336EUTK', rating: 4.4, reviews: 67200, price: '$29.99' },
  ],
  'hyg-3': [ // Body Odour Prevention
    { label: 'Native Deodorant', url: 'https://www.amazon.com/dp/B07B4X4JBL', topPick: true, rating: 4.4, reviews: 52100, price: '$12.99' },
    { label: 'Lume Whole Body Deodorant', url: 'https://www.amazon.com/dp/B0BGFX1WPC', rating: 4.3, reviews: 28400, price: '$14.99' },
    { label: 'Hibiclens Antiseptic Wash', url: 'https://www.amazon.com/dp/B00027CXLC', rating: 4.7, reviews: 19600, price: '$10.49' },
  ],
  'hyg-4': [ // Feminine Hygiene
    { label: 'Honey Pot Wash', url: 'https://www.amazon.com/dp/B07DCWQ11J', topPick: true, rating: 4.5, reviews: 16800, price: '$9.99' },
    { label: 'Saalt Menstrual Cup', url: 'https://www.amazon.com/dp/B07GRSKMQF', rating: 4.5, reviews: 14200, price: '$29.00' },
    { label: 'Love Wellness pH Balancing Wash', url: 'https://www.amazon.com/dp/B08F1BC4VR', rating: 4.4, reviews: 8900, price: '$14.99' },
  ],
  'hyg-5': [ // Hair Wash Day
    { label: 'Olaplex No.3 Hair Perfector', url: 'https://www.amazon.com/dp/B00SNM5US4', topPick: true, rating: 4.5, reviews: 71200, price: '$28.00' },
    { label: 'Shea Moisture Shampoo', url: 'https://www.amazon.com/dp/B0038TVHRI', rating: 4.5, reviews: 43600, price: '$10.99' },
    { label: 'Wet Brush Detangler', url: 'https://www.amazon.com/dp/B005LPN2E6', rating: 4.7, reviews: 89100, price: '$8.99' },
  ],
  'hyg-6': [ // Skincare Layering
    { label: 'CeraVe Hydrating Cleanser', url: 'https://www.amazon.com/dp/B01MSSDEPK', topPick: true, rating: 4.7, reviews: 93400, price: '$15.99' },
    { label: 'Paula\'s Choice BHA Exfoliant', url: 'https://www.amazon.com/dp/B00949CTQQ', rating: 4.5, reviews: 45200, price: '$32.00' },
    { label: 'La Roche-Posay SPF 60', url: 'https://www.amazon.com/dp/B002CML1XE', rating: 4.6, reviews: 28700, price: '$33.50' },
  ],
  'hyg-7': [ // Hand & Nail Care
    { label: 'CND SolarOil Cuticle Oil', url: 'https://www.amazon.com/dp/B001B2W930', topPick: true, rating: 4.7, reviews: 22300, price: '$8.50' },
    { label: 'O\'Keeffe\'s Working Hands', url: 'https://www.amazon.com/dp/B00121UVU0', rating: 4.7, reviews: 112000, price: '$7.99' },
    { label: 'Glass Nail File Set', url: 'https://www.amazon.com/dp/B07GN5W6ZS', rating: 4.6, reviews: 18400, price: '$6.99' },
  ],
  'hyg-8': [ // Foot Care
    { label: 'O\'Keeffe\'s Healthy Feet', url: 'https://www.amazon.com/dp/B0002QB9NE', topPick: true, rating: 4.6, reviews: 67800, price: '$8.99' },
    { label: 'Dr Teal\'s Epsom Salt Soak', url: 'https://www.amazon.com/dp/B001G7QMXM', rating: 4.7, reviews: 54300, price: '$5.97' },
    { label: 'Rikans Pumice Stone', url: 'https://www.amazon.com/dp/B01MYPNP3N', rating: 4.5, reviews: 31200, price: '$6.99' },
  ],
  'hyg-9': [ // Fragrance Layering
    { label: 'Sol de Janeiro Brazilian Bum Bum Cream', url: 'https://www.amazon.com/dp/B01EINM9PY', topPick: true, rating: 4.6, reviews: 34200, price: '$48.00' },
    { label: 'Moroccanoil Body Oil', url: 'https://www.amazon.com/dp/B07BTWGGMF', rating: 4.5, reviews: 8900, price: '$48.00' },
    { label: 'Dossier Floral Perfume', url: 'https://www.amazon.com/dp/B09QSZ8Y3K', rating: 4.3, reviews: 12400, price: '$29.00' },
  ],
  'hyg-10': [ // At-Home Facial
    { label: 'COSRX Snail Mucin Essence', url: 'https://www.amazon.com/dp/B00PBX3L7K', topPick: true, rating: 4.6, reviews: 67300, price: '$12.99' },
    { label: 'Aztec Secret Clay Mask', url: 'https://www.amazon.com/dp/B0014P8L9W', rating: 4.6, reviews: 98700, price: '$9.99' },
    { label: 'BAIMEI Jade Roller & Gua Sha', url: 'https://www.amazon.com/dp/B07GN5W6ZS', rating: 4.4, reviews: 42100, price: '$8.99' },
  ],
  'hyg-11': [ // Body Exfoliation
    { label: 'Tree Hut Shea Sugar Scrub', url: 'https://www.amazon.com/dp/B001R2GF5K', topPick: true, rating: 4.7, reviews: 58200, price: '$8.99' },
    { label: 'Pursonic Dry Brush', url: 'https://www.amazon.com/dp/B01B5IT400', rating: 4.5, reviews: 22800, price: '$7.99' },
    { label: 'Palmer\'s Cocoa Butter Body Oil', url: 'https://www.amazon.com/dp/B001G7PKT8', rating: 4.7, reviews: 31600, price: '$6.49' },
  ],
  'hyg-12': [ // Smooth Shaving
    { label: 'Billie Razor Starter Kit', url: 'https://www.amazon.com/dp/B0BVTZP4WR', topPick: true, rating: 4.5, reviews: 14200, price: '$10.00' },
    { label: 'EOS Shea Better Shave Cream', url: 'https://www.amazon.com/dp/B07FMDJQKL', rating: 4.6, reviews: 28300, price: '$4.49' },
    { label: 'Tend Skin Solution', url: 'https://www.amazon.com/dp/B001ECQ7G4', rating: 4.4, reviews: 19800, price: '$18.00' },
  ],
  'hyg-13': [ // Bedtime Ritual
    { label: 'SLIP Silk Pillowcase', url: 'https://www.amazon.com/dp/B00LH7MBCS', topPick: true, rating: 4.6, reviews: 16800, price: '$89.00' },
    { label: 'This Works Deep Sleep Pillow Spray', url: 'https://www.amazon.com/dp/B003TH5R30', rating: 4.4, reviews: 23400, price: '$29.00' },
    { label: 'Laneige Lip Sleeping Mask', url: 'https://www.amazon.com/dp/B07QBFGH9J', rating: 4.7, reviews: 72100, price: '$24.00' },
  ],
  'hyg-14': [ // Lip Care
    { label: 'Laneige Lip Sleeping Mask', url: 'https://www.amazon.com/dp/B07QBFGH9J', topPick: true, rating: 4.7, reviews: 72100, price: '$24.00' },
    { label: 'e.l.f. Lip Exfoliator', url: 'https://www.amazon.com/dp/B01N34WRJC', rating: 4.4, reviews: 18900, price: '$5.00' },
    { label: 'Aquaphor Lip Repair', url: 'https://www.amazon.com/dp/B006IB5T4W', rating: 4.7, reviews: 45600, price: '$4.49' },
  ],
};
