import type { PlaceId } from './site'

/**
 * The cottage listing. Add, remove or edit entries here — the cards, the city
 * filter and the booking form's cottage picker all read from this list.
 *
 * SAMPLE DATA: these entries are placeholders for the cottages being planned.
 * Replace names, sizes and descriptions with the real ones before launch, and
 * only add prices or amenities once they are confirmed.
 */

export type CottageArt = 'riverside' | 'garden' | 'tent' | 'family'

export type Cottage = {
  id: string
  name: string
  /** Name in Devanagari, shown as a small accent. */
  nameDevanagari: string
  place: PlaceId
  kind: string
  sleeps: number
  summary: string
  art: CottageArt
}

export const cottages: Cottage[] = [
  {
    id: 'ganga-kutir',
    name: 'Ganga Kutir',
    nameDevanagari: 'गंगा कुटीर',
    place: 'haridwar',
    kind: 'Riverside cottage',
    sleeps: 2,
    summary: 'A small cottage for two, facing the river path.',
    art: 'riverside',
  },
  {
    id: 'parvat-kutir',
    name: 'Parvat Kutir',
    nameDevanagari: 'पर्वत कुटीर',
    place: 'haridwar',
    kind: 'Family cottage',
    sleeps: 5,
    summary: 'Two rooms for a family travelling together, with the hills behind.',
    art: 'family',
  },
  {
    id: 'sangam-kutir',
    name: 'Sangam Kutir',
    nameDevanagari: 'संगम कुटीर',
    place: 'prayagraj',
    kind: 'Tent cottage',
    sleeps: 3,
    summary: 'A canvas cottage on a raised deck, in the spirit of the Mela’s tent city.',
    art: 'tent',
  },
  {
    id: 'triveni-kutir',
    name: 'Triveni Kutir',
    nameDevanagari: 'त्रिवेणी कुटीर',
    place: 'prayagraj',
    kind: 'Garden cottage',
    sleeps: 4,
    summary: 'A garden cottage set back from the crowds, for longer stays.',
    art: 'garden',
  },
  {
    id: 'shipra-kutir',
    name: 'Shipra Kutir',
    nameDevanagari: 'शिप्रा कुटीर',
    place: 'ujjain',
    kind: 'Riverside cottage',
    sleeps: 2,
    summary: 'A quiet cottage for two on the way to the ghats.',
    art: 'riverside',
  },
  {
    id: 'godavari-kutir',
    name: 'Godavari Kutir',
    nameDevanagari: 'गोदावरी कुटीर',
    place: 'nashik',
    kind: 'Family cottage',
    sleeps: 6,
    summary: 'A larger cottage for a family or a small group of friends.',
    art: 'family',
  },
]
