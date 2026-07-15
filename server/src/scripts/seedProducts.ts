// One-time script to populate the `products` collection with demo catalog
// data. Run with `npm run seed` (from server/, or `npm run seed --prefix
// server` from the repo root).
import { connectToDatabase } from '../config/db.js'
import { Product } from '../models/Product.js'
import mongoose from 'mongoose'

const products = [
  { name: 'Velocity Pro Driver', category: 'drivers', brand: 'Titan', price: 429.99, stock: 12, imageSeed: 'driver-1', description: 'Low-spin titanium driver built for maximum distance off the tee.' },
  { name: 'AeroStrike Driver', category: 'drivers', brand: 'Falcon', price: 349.0, stock: 8, imageSeed: 'driver-2', description: 'Adjustable-loft driver with a forgiving, high-launch face.' },
  { name: 'Summit X Driver', category: 'drivers', brand: 'Summit', price: 499.99, stock: 5, imageSeed: 'driver-3', description: 'Tour-level driver favoured for its workability and feel.' },

  { name: 'Ridgeline 3-Wood', category: 'fairway-woods', brand: 'Titan', price: 249.99, stock: 10, imageSeed: 'fairway-1', description: 'Versatile 3-wood that performs from the tee or the fairway.' },
  { name: 'GlidePath 5-Wood', category: 'fairway-woods', brand: 'Falcon', price: 219.0, stock: 9, imageSeed: 'fairway-2', description: 'Easy-launching 5-wood with a shallow face for tight lies.' },
  { name: 'Summit Tour Fairway', category: 'fairway-woods', brand: 'Summit', price: 279.99, stock: 6, imageSeed: 'fairway-3', description: 'Compact fairway wood built for shot-shaping control.' },

  { name: 'Precision Forged Irons (4-PW)', category: 'irons', brand: 'Titan', price: 899.99, stock: 4, imageSeed: 'iron-1', description: 'Forged carbon-steel iron set prized for its soft feel.' },
  { name: 'PowerCavity Irons (5-PW)', category: 'irons', brand: 'Falcon', price: 649.0, stock: 7, imageSeed: 'iron-2', description: 'Wide-sole game-improvement irons with high forgiveness.' },
  { name: 'Summit Players Irons (3-PW)', category: 'irons', brand: 'Summit', price: 999.99, stock: 3, imageSeed: 'iron-3', description: 'Compact players iron set for skilled ball-strikers.' },

  { name: 'SpinMax 56° Wedge', category: 'wedges', brand: 'Titan', price: 149.99, stock: 15, imageSeed: 'wedge-1', description: 'High-spin sand wedge with aggressive groove pattern.' },
  { name: 'TourGrind 60° Wedge', category: 'wedges', brand: 'Falcon', price: 159.0, stock: 11, imageSeed: 'wedge-2', description: 'Versatile lob wedge for delicate short-game shots.' },
  { name: 'Summit 52° Approach Wedge', category: 'wedges', brand: 'Summit', price: 139.99, stock: 13, imageSeed: 'wedge-3', description: 'Gap wedge that bridges the distance from irons to short game.' },

  { name: 'TrueRoll Blade Putter', category: 'putters', brand: 'Titan', price: 199.99, stock: 9, imageSeed: 'putter-1', description: 'Classic blade putter with a milled, soft-feel face.' },
  { name: 'BalanceMax Mallet Putter', category: 'putters', brand: 'Falcon', price: 229.0, stock: 8, imageSeed: 'putter-2', description: 'High-MOI mallet putter for a stable, consistent stroke.' },
  { name: 'Summit Tour Putter', category: 'putters', brand: 'Summit', price: 249.99, stock: 6, imageSeed: 'putter-3', description: 'Tour-proven putter shape with adjustable weighting.' },

  { name: 'Velocity Tour Golf Balls (Dozen)', category: 'golf-balls', brand: 'Titan', price: 44.99, stock: 40, imageSeed: 'golfball-1', description: 'Tour-level 3-piece ball with soft urethane cover for maximum spin control.' },
  { name: 'Falcon Distance Golf Balls (Dozen)', category: 'golf-balls', brand: 'Falcon', price: 24.99, stock: 60, imageSeed: 'golfball-2', description: 'Two-piece ball built for extra distance and durability.' },
  { name: 'Summit Soft Golf Balls (Dozen)', category: 'golf-balls', brand: 'Summit', price: 29.99, stock: 50, imageSeed: 'golfball-3', description: 'Low-compression ball designed for a softer feel at any swing speed.' },
]

async function seed() {
  await connectToDatabase()
  await Product.deleteMany({})
  await Product.insertMany(products)
  console.log(`Seeded ${products.length} products.`)
  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
