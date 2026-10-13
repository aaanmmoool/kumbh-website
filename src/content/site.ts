/**
 * All copy for the site lives here so it can be replaced in one place.
 *
 * Anything marked PLACEHOLDER describes the product itself (name, positioning,
 * promises). It is written to be replaced once the real product details exist.
 * Cultural and historical content about the Kumbh Mela is factual and sourced
 * from widely documented tradition — review it, but it is not product copy.
 */

export const brand = {
  /** PLACEHOLDER — product name. */
  name: 'Tirtha',
  /** PLACEHOLDER — product name in Devanagari, used as an ornamental accent. */
  nameDevanagari: 'तीर्थ',
  /** PLACEHOLDER — one-line description used in the footer and meta tags. */
  tagline: 'Riverside cottages for the Kumbh.',
  /** Optional contact address. Leave empty to hide the contact link. */
  contactEmail: '',
  /** Optional social profiles. Only entries listed here are rendered. */
  social: [] as { label: string; href: string }[],
}

export const meta = {
  title: `${brand.name} — riverside cottages for the Kumbh`,
  description:
    'Choose a Kumbh city and your check-in date to see the cottages opening for the Mela, then send a booking request.',
}

export const nav = [
  { label: 'Cottages', href: '#cottages' },
  { label: 'How it works', href: '#how' },
  { label: 'Legend', href: '#legend' },
  { label: 'Questions', href: '#questions' },
] as const

export const cta = {
  nav: { label: 'Book a stay', href: '#book' },
}

/** The four Kumbh cities. Remove or add entries to change where cottages can be searched. */
/** `photo` is the city's backdrop in the city picker (slugs from photos.json); `photoPosition` is its focal point there. */
export const places = [
  { id: 'prayagraj', name: 'Prayagraj', devanagari: 'प्रयागराज', river: 'Triveni Sangam', photo: 'sangam-sunset-boats', photoPosition: '50% 62%' },
  { id: 'haridwar', name: 'Haridwar', devanagari: 'हरिद्वार', river: 'Ganga', photo: 'aarti-fire-haridwar', photoPosition: '50% 40%' },
  { id: 'ujjain', name: 'Ujjain', devanagari: 'उज्जैन', river: 'Shipra', photo: 'ram-ghat-ujjain', photoPosition: '50% 50%' },
  { id: 'nashik', name: 'Nashik', devanagari: 'नाशिक', river: 'Godavari', photo: 'ramkund-nashik', photoPosition: '50% 55%' },
] as const

export type PlaceId = (typeof places)[number]['id']

export const hero = {
  headline: ['Every twelve years,', 'the river remembers.'],
  /** PLACEHOLDER — product positioning. */
  body: `${brand.name} cottages are opening by the river for the Kumbh. Choose a city and your check-in date to see where you could stay.`,
  scrollLabel: 'Scroll to the cottages',
}

export const search = {
  placeLabel: 'Place',
  placePrompt: 'Choose a city',
  allPlaces: 'All four cities',
  dateLabel: 'Check-in',
  submitLabel: 'Find cottages',
  errors: {
    place: 'Choose a city to search.',
    date: 'Choose your check-in date.',
    past: 'Choose a date from today onwards.',
  },
}

export const cottagesSection = {
  heading: 'Cottages for the Kumbh',
  intro: 'Each cottage is being readied for the Mela. Pick one and send a booking request for your dates.',
  /** Shown above the listing until real availability is connected. */
  notice:
    'Preview listings: cottage names and details are placeholders until each cottage opens. Prices and availability are confirmed with you after you send a booking request.',
  status: 'Opening soon',
  requestLabel: 'Request this cottage',
  emptyTitle: (place: string) => `No cottages in ${place} yet`,
  emptyBody: 'Cottages in this city are still being planned. See every cottage, or send a request and we will tell you when one opens.',
  showAll: 'Show all cities',
}

/** Photo-led highlights shown after the cottage listing. Photos are set in photos.json. */
export const experiences = {
  heading: 'Things to see at the Kumbh',
  intro: 'Each Kumbh city has its own river, its own ghats and its own rituals. These are a few of the moments pilgrims travel for.',
  items: [
    {
      photo: 'aarti-fire-haridwar',
      place: 'Haridwar',
      title: 'Ganga Aarti at Har Ki Pauri',
      text: 'Every evening at sunset, priests raise great brass lamps to the river while bells ring along the ghat.',
    },
    {
      photo: 'sangam-sunset-boats',
      place: 'Prayagraj',
      title: 'Boats on the Sangam',
      text: 'Boatmen row pilgrims out to the meeting of the Ganga and Yamuna, to bathe where the rivers join.',
    },
    {
      photo: 'procession-pontoon',
      place: 'Prayagraj',
      title: 'Processions to the water',
      text: 'On Amrit Snan days the akharas cross the pontoon bridges in procession, flags raised, before the bathing begins.',
    },
    {
      photo: 'tent-city-night',
      place: 'Prayagraj',
      title: 'The tent city by night',
      text: 'Camps stretch for kilometres along the riverbank, and after dark the whole Mela glows.',
    },
    {
      photo: 'ram-ghat-ujjain',
      place: 'Ujjain',
      title: 'Ram Ghat on the Shipra',
      text: 'Ujjain’s best-known bathing ghat, and the heart of the Simhastha’s main baths.',
    },
    {
      photo: 'ramkund-nashik',
      place: 'Nashik',
      title: 'Ramkund on the Godavari',
      text: 'The sacred tank where pilgrims bathe and leave marigolds during the Nashik Kumbh.',
    },
  ],
} as const

export const how = {
  heading: 'Booking a stay, step by step',
  body: 'Booking takes four simple steps, and nothing is charged on this site.',
  steps: [
    {
      title: 'Choose a city and a date',
      text: 'Pick the Kumbh city and the day you want to arrive. The cottages for that city appear below.',
    },
    {
      title: 'Pick a cottage',
      text: 'Compare the cottages opening there and choose the one that suits your group.',
    },
    {
      title: 'Send a booking request',
      text: 'Share your name, contact details and how many of you are travelling. No payment is taken here.',
    },
    {
      /** PLACEHOLDER — describe your real confirmation process. */
      title: 'Hear back to confirm',
      text: 'We confirm availability, the price and the next steps with you directly.',
    },
  ],
}

/**
 * Which backdrop sits where.
 * 'original': the illustrated night river behind the hero, the aarti photo behind the statement.
 * 'swapped': the aarti photo behind the hero, the illustrated night river behind the statement.
 */
export const backdrops = 'swapped' as 'original' | 'swapped'

export const promise = {
  photo: 'aarti-evening-haridwar',
  /** PLACEHOLDER — core value proposition. */
  statement: 'A quiet cottage to return to after the crowds, so you can be present for the moment you came for.',
  /** PLACEHOLDER — name story. Accurate for the Sanskrit word tīrtha. */
  note: 'In Sanskrit, tīrtha is a crossing place — a ford in the river where the sacred can be reached. Our cottages are meant to be that resting place.',
}

export const journey = {
  heading: 'Four movements of a pilgrimage',
  intro: 'Every journey to the Kumbh moves through the same quiet arc. Where you stay shapes every part of it.',
  stages: [
    {
      id: 'arrive',
      photo: 'pontoon-walkers',
      word: 'आगमन',
      translit: 'Āgaman',
      title: 'Arrive',
      subtitle: 'Before the river',
      text: 'Choosing your city and your days. Knowing what to carry, what to leave behind, and where the first night will be.',
    },
    {
      id: 'dwell',
      photo: 'tents-prayagraj',
      word: 'वास',
      translit: 'Vās',
      title: 'Dwell',
      subtitle: 'Living by the water',
      text: 'Settling into the rhythm of the camps — the discourses, the shared kitchens, the hours that belong to no one.',
    },
    {
      id: 'immerse',
      photo: 'shahi-snan-ujjain',
      word: 'स्नान',
      translit: 'Snān',
      title: 'Immerse',
      subtitle: 'The bath',
      text: 'The dip at first light on an auspicious day — the moment the whole journey turns on.',
    },
    {
      id: 'depart',
      photo: 'sangam-sun-boats',
      word: 'प्रस्थान',
      translit: 'Prasthān',
      title: 'Depart',
      subtitle: 'Carrying it home',
      text: 'Leaving the ghats with what you came for, and a way to hold on to it after the tents come down.',
    },
  ],
} as const

export type StageId = (typeof journey.stages)[number]['id']

export const legend = {
  heading: 'A pot, four drops and a clock in the sky',
  intro: 'Why the Kumbh moves between four cities, and why it returns when it does.',
  chapters: [
    {
      title: 'The churning',
      text: 'In the Puranic telling, gods and asuras churn the cosmic ocean together, with a mountain for a rod and the serpent Vasuki for a rope. From the depths rises a kumbh — a pot — holding amrit, the nectar of immortality.',
    },
    {
      title: 'Four drops',
      text: 'In the struggle over the pot, drops of amrit fall to earth at four places. Each sits on a sacred river, and each became a home of the Kumbh.',
      places: [
        { city: 'Prayagraj', river: 'Ganga, Yamuna and the unseen Saraswati meet at the Triveni Sangam' },
        { city: 'Haridwar', river: 'The Ganga, where it leaves the mountains for the plains' },
        { city: 'Ujjain', river: 'The Shipra' },
        { city: 'Nashik', river: 'The Godavari' },
      ],
    },
    {
      title: 'A clock in the sky',
      text: 'Where and when the Kumbh gathers is set by the positions of Jupiter, the sun and the moon. Each city hosts the full Kumbh roughly once in twelve years — about the time Jupiter takes to circle the zodiac. In Ujjain and Nashik it is called Simhastha, after Jupiter’s place in Simha, the lion.',
    },
    {
      title: 'The gathering',
      text: 'On the most auspicious days, ascetics of the akharas lead processions to the water, and pilgrims follow in their millions. In 2017 UNESCO recognised the Kumbh Mela as Intangible Cultural Heritage of Humanity.',
    },
  ],
} as const

export const day = {
  heading: 'A day on the ghat',
  intro: 'The Kumbh keeps its own hours. Move through a single day by the water.',
  moments: [
    {
      id: 'brahma',
      label: 'Before dawn',
      name: 'Brahma muhurta',
      text: 'In the hour and a half before sunrise, the first bathers step into cold water by lamplight.',
    },
    {
      id: 'sunrise',
      label: 'Sunrise',
      name: 'Pratah',
      text: 'Conch shells, marigolds on the current, and the great rush to the water as light reaches the river.',
    },
    {
      id: 'midday',
      label: 'Midday',
      name: 'Madhyahna',
      text: 'In the camps, discourses and kirtan fill the tents, and bhandara kitchens feed whoever sits down.',
    },
    {
      id: 'dusk',
      label: 'Dusk',
      name: 'Sandhya',
      text: 'Aarti on the ghats: brass lamps raised to the river, and leaf boats carrying diyas downstream.',
    },
    {
      id: 'night',
      label: 'Night',
      name: 'Ratri',
      text: 'Bhajans drift between camps, and the tent city glows until the early hours.',
    },
  ],
} as const

export type MomentId = (typeof day.moments)[number]['id']

export const questions = {
  heading: 'Questions, answered plainly',
  items: [
    {
      /** PLACEHOLDER */
      q: 'When can I book a cottage?',
      a: 'The cottages are opening soon. Send a booking request now with your city and dates, and we will contact you to confirm as soon as booking opens.',
    },
    {
      q: 'Do I pay anything when I send a request?',
      a: 'No. This site does not take payments. A request only shares your details and preferred dates with us.',
    },
    {
      /** PLACEHOLDER — keep in step with src/content/cottages.ts */
      q: 'Which cities will have cottages?',
      a: 'We are preparing cottages in Prayagraj, Haridwar, Ujjain and Nashik — the four cities of the Kumbh.',
    },
    {
      q: 'What is the Kumbh Mela?',
      a: 'A Hindu pilgrimage and festival in which pilgrims gather to bathe in a sacred river on auspicious days. It is often described as the largest peaceful gathering of people anywhere in the world.',
    },
    {
      q: 'How often does it happen?',
      a: 'The festival rotates between the four cities, so each one hosts the full Kumbh roughly every twelve years. Haridwar and Prayagraj also hold an Ardh (half) Kumbh in between. Exact dates are set by astrological calculation and announced officially ahead of each Mela.',
    },
    {
      q: 'What is the Amrit Snan?',
      a: 'The principal bathing days of the Mela, also known as Shahi Snan. Processions of the akharas — orders of ascetics — enter the river first, and pilgrims follow.',
    },
  ],
}

export const book = {
  heading: 'Request your stay.',
  /** PLACEHOLDER */
  body: 'Tell us where and when. We will confirm availability and the price with you before anything is booked.',
  guestOptions: [1, 2, 3, 4, 5, 6, 7, 8],
  anyCottage: 'Any cottage in this city',
  submitLabel: 'Send booking request',
  submittingLabel: 'Sending your request',
  successTitle: 'Request sent.',
  successBody: 'Thank you. We will contact you to confirm availability and the next steps.',
  privacyNote: 'We use your details only to respond to this booking request.',
}

export const footer = {
  closing: 'Made with respect for the traditions of the Kumbh.',
}
