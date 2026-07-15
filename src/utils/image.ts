import driverPing from '../assets/Ping_driver.jpg'
import driverTaylormade from '../assets/Taylormade_driver.jpg'
import driverTitleist from '../assets/Titleist_driver.jpg'
import fairwayPing from '../assets/Ping_fairway.jpg'
import fairwayTaylormade from '../assets/TaylorMade_fairway.jpg'
import fairwayTitleist from '../assets/Titleist_fairway.jpg'
import golfBallTitleist from '../assets/Titleist_ball.jpg'
import golfBallCallaway from '../assets/Callaway_ball.jpg'
import golfBallTaylormade from '../assets/Taylormade_ball.jpg'
import ironPing from '../assets/Ping_irons.jpg'
import ironTaylormade from '../assets/Taylormade_irons.jpg'
import ironTitleist from '../assets/Titleist_irons.jpg'
import putterPing from '../assets/Ping_putter.jpg'
import putterTaylormade from '../assets/Taylormade_putter.jpg'
import putterScotty from '../assets/Scotty_putter.jpg'
import wedgePing from '../assets/Ping_wedge.jpg'
import wedgeTaylormade from '../assets/Taylormade_wedge.jpg'
import wedgeTitleist from '../assets/Titleist-wedge.jpg'

// Exact imageSeed -> photo, for products with their own dedicated image.
const SEED_IMAGES: Record<string, string> = {
  'driver-1': driverPing,
  'driver-2': driverTaylormade,
  'driver-3': driverTitleist,
  'fairway-1': fairwayPing,
  'fairway-2': fairwayTaylormade,
  'fairway-3': fairwayTitleist,
  'iron-1': ironPing,
  'iron-2': ironTaylormade,
  'iron-3': ironTitleist,
  'wedge-1': wedgePing,
  'wedge-2': wedgeTaylormade,
  'wedge-3': wedgeTitleist,
  'putter-1': putterPing,
  'putter-2': putterTaylormade,
  'putter-3': putterScotty,
  'golfball-1': golfBallTitleist,
  'golfball-2': golfBallCallaway,
  'golfball-3': golfBallTaylormade,
}

// Fallback by category prefix, for seeds without a dedicated photo above
// (including the home page's category-tile seed, e.g. "drivers").
const CATEGORY_ILLUSTRATIONS: { prefix: string; image: string }[] = [
  { prefix: 'driver', image: driverPing },
  { prefix: 'fairway', image: fairwayPing },
  { prefix: 'iron', image: ironPing },
  { prefix: 'wedge', image: wedgePing },
  { prefix: 'putter', image: putterPing },
  { prefix: 'golfball', image: golfBallTitleist },
  { prefix: 'golf-balls', image: golfBallTitleist },
]

export function buildImageUrl(seed: string, width: number, height: number) {
  if (SEED_IMAGES[seed]) return SEED_IMAGES[seed]
  const match = CATEGORY_ILLUSTRATIONS.find((c) => seed.startsWith(c.prefix))
  if (match) return match.image
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`
}
