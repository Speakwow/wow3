import { MongoClient } from 'mongodb'

let uri = process.env.MONGODB_URI_TEST
// let uri = process.env.MONGODB_URI_TBDS

let mongo: MongoClient | null = null

if (!uri) throw new Error('Missing environment variable MONGODB_URI')

export async function connect() {
  if (mongo) return mongo
  mongo = await MongoClient.connect(uri as string)
  return mongo
}
