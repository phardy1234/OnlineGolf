import { MongoMemoryServer } from 'mongodb-memory-server'

const mongod = await MongoMemoryServer.create({ instance: { port: 27117 } })
console.log('MONGO_URI=' + mongod.getUri('online-golf'))

process.on('SIGINT', async () => {
  await mongod.stop()
  process.exit(0)
})
