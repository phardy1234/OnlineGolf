import driverImage from '../assets/driver.svg'
import fairwayWoodImage from '../assets/fairway-wood.svg'
import golfBallImage from '../assets/golf-ball.svg'
import ironImage from '../assets/iron.svg'
import putterImage from '../assets/putter.svg'
import wedgeImage from '../assets/wedge.svg'

const CATEGORY_ILLUSTRATIONS: { prefix: string; image: string }[] = [
  { prefix: 'driver', image: driverImage },
  { prefix: 'fairway', image: fairwayWoodImage },
  { prefix: 'iron', image: ironImage },
  { prefix: 'wedge', image: wedgeImage },
  { prefix: 'putter', image: putterImage },
  { prefix: 'golfball', image: golfBallImage },
  { prefix: 'golf-balls', image: golfBallImage },
]

export function buildImageUrl(seed: string, width: number, height: number) {
  const match = CATEGORY_ILLUSTRATIONS.find((c) => seed.startsWith(c.prefix))
  if (match) return match.image
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`
}
