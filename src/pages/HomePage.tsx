import { Link } from 'react-router-dom'
import { CATEGORIES } from '../types'
import { buildImageUrl } from '../utils/image'

export function HomePage() {
  return (
    <div className="home-page">
      <section className="hero-banner">
        <h1>Gear up for your best round yet</h1>
        <p>Drivers, fairway woods, irons, wedges putters and balls from top brands.</p>
      </section>

      <section className="category-tiles">
        {CATEGORIES.map((c) => (
          <Link key={c.value} to={`/category/${c.value}`} className="category-tile">
            <img src={buildImageUrl(c.value, 500, 350)} alt={c.label} loading="lazy" />
            <span>{c.label}</span>
          </Link>
        ))}
      </section>
    </div>
  )
}
