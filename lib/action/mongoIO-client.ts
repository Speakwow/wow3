'use server'
import { connect } from '@/lib/mongo'
import { C_CHARACTERS, C_REPEAT_PAGES, C_REPEAT_THREADS, C_SCENARIOS, DB } from '@/lib/constant'
import { ObjectId } from 'mongodb'
import { unstable_noStore as noStore } from 'next/cache';

export async function updateScenario(name: string, content: any) {
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection(C_SCENARIOS)
    .updateOne(
      { name: name }, // 查询条件
      { $set: content }, // 更新操作
      { upsert: true } // 如果不存在则插入新文档
    );
}

export async function deleteScenario(name: string) {
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection(C_SCENARIOS)
    .deleteOne(
      { name: name }// 查询条件
    );
}

export async function getScenarioByName(name: string) {
  const mongo = await connect()
  const scenario = await mongo.db(DB).collection(C_SCENARIOS).findOne({ name: name })
  return scenario
}

export async function getScenarioById(id: string) {
  const mongo = await connect()
  const scenario = await mongo.db(DB).collection(C_SCENARIOS).findOne({ _id: new ObjectId(id as string) })
  return JSON.parse(JSON.stringify(scenario))
}


export async function getCharacterById(id: string) {
  const mongo = await connect()
  const character = await mongo.db(DB).collection(C_CHARACTERS).findOne({ _id: new ObjectId(id as string) })
  return JSON.parse(JSON.stringify(character))
}

export async function getRepeatThreadById(threadId: string) {
  const mongo = await connect()
  const repeatThread = await mongo.db(DB).collection(C_REPEAT_THREADS).findOne({ _id: new ObjectId(threadId as string) })
  return JSON.parse(JSON.stringify(repeatThread))
}


export async function getRepeatPageByIndex(threadId: string, index: number) {
  const mongo = await connect()
  const repeatPage = await mongo.db(DB).collection(C_REPEAT_PAGES).findOne({ threadId: threadId, index: index })
  return repeatPage
}


export async function createRepeatRecord(threadId: string, userId: string) {
  const now = Date.now(); // 获取当前时间的时间戳
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection('repeat_records')
    .insertOne({
      threadId: threadId,
      userId: userId,
      isFinished: false,
      createAt: now,
      score: 0,
      record: []
    });
  return res.insertedId.toString()
}

export async function finishRepeatRecord(recordId: string) {
  const now = Date.now(); // 获取当前时间的时间戳
  const mongo = await connect()
  const current = await mongo.db(DB)
    .collection('repeat_records')
    .findOne({ _id: new ObjectId(recordId) })
  const final_score = (current?.record.reduce((sum: number, record: any) => sum + parseFloat(record.score), 0)) / current?.record.length;
  const duration = (now - current?.createAt) / 60000
  const res = await mongo.db(DB)
    .collection('repeat_records')
    .updateOne(
      { _id: new ObjectId(recordId) },
      {
        $set: {
          isFinished: true,
          finishAt: now,
          score: final_score,
        }
      });
  return { final_score, current, duration }
}


export async function updateRepeatRecord(recordId: string, index: number, score: number, text: string) {
  const newRecord = {
    text: text,
    score: score,
    index: index
  }
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection('repeat_records')
    .updateOne(
      { _id: new ObjectId(recordId) },
      //@ts-ignore
      { $push: { record: newRecord } })
  return res
}

export async function getRepeatRecordByUserId(userId: string) {
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection('repeat_records')
    .find({ userId: userId })
    .sort({ score: -1 }) // 按 createAt 字段降序排序
    .limit(1) // 只获取一条记录
    .toArray();
  return JSON.parse(JSON.stringify(res[0]))
}

//Talk about
export async function getTalkaboutById(threadId: string) {
  const mongo = await connect()
  const repeatThread = await mongo.db(DB).collection("talkabouts").findOne({ _id: new ObjectId(threadId as string) })
  return JSON.parse(JSON.stringify(repeatThread))
}

export async function createTalkaboutRecord(threadId: string, userId: string) {
  const now = Date.now(); // 获取当前时间的时间戳
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection('talkabout_records')
    .insertOne({
      threadId: threadId,
      userId: userId,
      isFinished: false,
      createAt: now,
      score: 0,
    });
  return res.insertedId.toString()
}

export async function finishTalkaboutRecord(recordId: string, score: number, result: any) {
  const now = Date.now(); // 获取当前时间的时间戳
  const mongo = await connect()
  const current = await mongo.db(DB)
    .collection('talkabout_records')
    .findOne({ _id: new ObjectId(recordId) })
  const duration = (now - current?.createAt) / 60000
  const res = await mongo.db(DB)
    .collection('talkabout_records')
    .updateOne(
      { _id: new ObjectId(recordId) },
      {
        $set: {
          isFinished: true,
          finishAt: now,
          score: score,
          ...result
        }
      });
}

export async function getTalkaboutRecordByUserId(userId: string, threadId: string) {
  noStore()
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection('talkabout_records')
    .find({ userId: userId, threadId: threadId })
    .sort({ score: -1 }) // 按 createAt 字段降序排序
    .limit(1) // 只获取一条记录
    .toArray();
  return JSON.parse(JSON.stringify(res[0]))
}


//Word
export async function getWordThreadById(threadId: string) {
  const mongo = await connect()
  const repeatThread = await mongo.db(DB).collection("word_threads").findOne({ _id: new ObjectId(threadId as string) })
  return JSON.parse(JSON.stringify(repeatThread))
}


export async function getWordPageByIndex(threadId: string, index: number) {
  const mongo = await connect()
  const repeatPage = await mongo.db(DB).collection("word_pages").findOne({ threadId: threadId, index: index })
  return repeatPage
}

export async function createWordRecord(threadId: string, userId: string) {
  const now = Date.now(); // 获取当前时间的时间戳
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection('word_records')
    .insertOne({
      threadId: threadId,
      userId: userId,
      isFinished: false,
      createAt: now,
      score: 0,
      record: []
    });
  return res.insertedId.toString()
}

export async function finishWordRecord(recordId: string) {
  const now = Date.now(); // 获取当前时间的时间戳
  const mongo = await connect()
  const current = await mongo.db(DB)
    .collection('word_records')
    .findOne({ _id: new ObjectId(recordId) })
  const final_score = (current?.record.reduce((sum: number, record: any) => sum + parseFloat(record.score), 0)) / current?.record.length;
  const duration = (now - current?.createAt) / 60000
  const res = await mongo.db(DB)
    .collection('word_records')
    .updateOne(
      { _id: new ObjectId(recordId) },
      {
        $set: {
          isFinished: true,
          finishAt: now,
          score: final_score,
        }
      });
  return { final_score, current, duration }
}


export async function updateWordRecord(recordId: string, index: number, score: number, text: string) {
  const newRecord = {
    text: text,
    score: score,
    index: index
  }
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection('word_records')
    .updateOne(
      { _id: new ObjectId(recordId) },
      //@ts-ignore
      { $push: { record: newRecord } })
  return res
}
export async function getWordRecordByUserId(userId: string, threadId: string) {
  noStore()
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection('word_records')
    .find({ userId: userId, threadId: threadId })
    .sort({ score: -1 }) // 按 createAt 字段降序排序
    .limit(1) // 只获取一条记录
    .toArray();
  return JSON.parse(JSON.stringify(res[0]))
}



export async function getAllLessons() {
  noStore()
  const mongo = await connect()
  const lessons = mongo.db(DB).collection('lessons').find()
  const res = await lessons.toArray()
  return res
}

export async function getLessonListById(lessonId: string) {
  noStore()
  const mongo = await connect()
  const lesson = mongo.db(DB).collection('lessons').find({ _id: new ObjectId(lessonId as string) })
  return JSON.parse(JSON.stringify(lesson))
}


export async function updateScenarioRecord(chatId: string, report: any) {
  const mongo = await connect()
  const now = Date.now(); // 获取当前时间的时间戳
  const date = new Date(now); // 将时间戳转换为 Date 对象
  const lesson = await mongo.db(DB).collection('scenario_records')
    .updateOne({ _id: new ObjectId(chatId as string) }, {
      $set: {
        report,
        isFinished: true,
        finishAt: date.toLocaleString()
      }
    })
  return lesson
}

export async function createScenarioRecord(userId: string) {
  const mongo = await connect()
  const now = Date.now(); // 获取当前时间的时间戳
  const date = new Date(now); // 将时间戳转换为 Date 对象
  const res = await mongo.db(DB).collection('scenario_records').insertOne({
    userId: userId,
    isFinished: false,
    createAt: date.toLocaleString()
  });
  return res.insertedId.toString()
}


export async function getScenarioRecordByUserId(userId: string, threadId: string) {
  noStore()
  console.log(userId)
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection('scenario_records')
    .find({ userId: userId, threadId: threadId })
    .sort({ score: -1 }) // 按 createAt 字段降序排序
    .limit(1) // 只获取一条记录
    .toArray();
  console.log('Find result:')
  console.log(res[0])
  return JSON.parse(JSON.stringify(res[0]))
}


export async function getAnyRecord(userId: string, threadId: string, type: string) {
  noStore()
  console.log(userId)
  const collectionName =findCollectinByType(type)
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection(collectionName)
    .find({ userId: userId, threadId: threadId })
    .sort({ score: -1 }) // 按 createAt 字段降序排序
    .limit(1) // 只获取一条记录
    .toArray();
  console.log('Find result:')
  console.log(res[0])
  if(res[0]){
  return JSON.parse(JSON.stringify(res[0]))
  }else{
    return null
  }
}

export async function getAnyLesson(threadId: string, type: string) {
  noStore()
  const collectionName =findCollectinByType(type)
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection(collectionName)
    .find({ _id: new ObjectId(threadId) })
    .sort({ score: -1 }) // 按 createAt 字段降序排序
    .limit(1) // 只获取一条记录
    .toArray();
  console.log('Find result:')
  console.log(res[0])
  if(res[0]){
    return JSON.parse(JSON.stringify(res[0]))
    }else{
      return null
    }
}

function findCollectinByType(type: string) {
  let collection = ''
  type == "talkabout" ? collection = "talkabouts"
    :
    type == "word" ? collection = "word_threads"
      :
      type == "scenario" ? collection = "scenarios"
        :
        type == "repeat" ? collection = 'repeat_threads'
          :
          collection = type + '_threads'
  console.log('find collection:',collection)
  return collection
}


