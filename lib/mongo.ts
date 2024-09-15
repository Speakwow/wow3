import { MongoClient } from 'mongodb'

let uri = process.env.MONGODB_URI

let core_uri = process.env.MONGODB_URI_CORE
// let uri = process.env.MONGODB_URI_TBDS

let mongo: MongoClient | null = null

if (!uri) throw new Error('Missing environment variable MONGODB_URI')

export async function connect() {
  if (mongo) return mongo
  mongo = await MongoClient.connect(uri as string)
  return mongo
}

let mongo_core: MongoClient | null = null

export async function connectCore() {
  if (mongo_core) return mongo_core
  mongo_core = await MongoClient.connect(core_uri as string)
  return mongo_core
}
