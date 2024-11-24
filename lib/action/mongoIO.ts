'use server'
import { connect, connectCore } from '@/lib/mongo'
import { C_CHARACTERS, C_REPEAT_PAGES, C_REPEAT_THREADS, C_SCENARIOS, DB, DB_CORE, lesson_collections } from '@/lib/constant'
import { ObjectId } from 'mongodb'
import { unstable_noStore as noStore } from 'next/cache';
import { collection2type, Type2Collection, typeMap, Type2Tag } from '../db/db';
import { Assignment } from '../schema/assign';
import { clerkClient } from '@clerk/nextjs/server';
import { logger } from '../logger';
import { getCurrentTextbook } from './kv';
import { getChineseName } from '../tools';


export async function updateScenario(name: string, content: any) {
  const mongo = await connectCore()
  const res = await mongo.db(DB_CORE)
    .collection(C_SCENARIOS)
    .updateOne(
      { name: name }, // 查询条件
      { $set: content }, // 更新操作
      { upsert: true } // 如果不存在则插入新文档
    );
}
export async function createScenario(userId: string, content: any) {
  const mongo = await connectCore()
  const res = await mongo.db(DB_CORE)
    .collection(C_SCENARIOS)
    .insertOne({
      creator: userId,
      ...content,
      appData: {
        click: 0,
        like: 0,
        star: 0
      }
    });
  await addToUserLessonList(userId, res.insertedId.toString(), content.name, 'scenario')
  return res.insertedId.toString()
}

export async function createTalkabout(userId: string, content: any) {
  const mongo = await connectCore()
  const res = await mongo.db(DB_CORE)
    .collection('talkabouts')
    .insertOne({
      creator: userId,
      ...content,
      appData: {
        click: 0,
        like: 0,
        star: 0
      }
    });
  await addToUserLessonList(userId, res.insertedId.toString(), content.name, 'talkabout')
  return res.insertedId.toString()
}



export async function addToUserLessonList(userId: string, lessonId: string, name: string, type: string) {
  const mongo = await connect()
  const newLesson = {
    _id: new ObjectId(lessonId),
    name: name,
    type: type,
    lastModified: new Date()
  }
  const res = await mongo.db(DB)
    .collection('users')
    .updateOne(
      { userId: userId },
      {
        //@ts-ignore
        $push: {
          "lessonList": newLesson
        }
      });
  return res.acknowledged
}


export async function delFromUserLessonList(userId: string, lessonId: string) {
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection('users')
    .updateOne(
      { userId: userId },
      {
        //@ts-ignore
        $pull: {
          "lessonList": { _id: new ObjectId(lessonId) }
        }
      });
  return res.acknowledged
}

export async function deleteLesson(userId: string, lessonId: string, type: string) {
  const mongo = await connectCore()
  const collection = Type2Collection(type)
  const res = await mongo.db(DB_CORE)
    .collection(collection)
    .deleteOne(
      { creator: userId, _id: new ObjectId(lessonId) });
  return res.acknowledged
}

export async function getUserData(userId: string) {
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection('users')
    .findOne(
      { userId: userId })
  if (!res) {
    const res = await mongo.db(DB)
      .collection('users')
      .insertOne(
        {
          userId: userId,
          lessonList: [],
          favourite: []
        })
    return { _id: res.insertedId, userId: userId, lessonList: [], favourite: [] }
  }

  return JSON.parse(JSON.stringify(res))
}

export async function getPublicData() {
  const mongo = await connectCore()
  let publicLessons = [] as any[]
  const collections = lesson_collections
  const promises = typeMap.map(item => {
    return mongo.db(DB_CORE)
      .collection(item.collection)
      .find({ access: 'public' })
      .limit(10)
      .toArray()
      .then(result => result.map(lesson => ({ type: item.type, tag: item.tag, ...lesson })));
  });

  // 使用 Promise.all 并行执行所有查询
  const results = await Promise.all(promises);
  // 将结果平铺到 publicLessons 数组中
  results.forEach(result => publicLessons.push(...result));
  return JSON.parse(JSON.stringify(publicLessons))
}

export async function getLessonsByCreator(userId: string) {
  const mongo = await connectCore()
  let resultLessons = [] as any[]
  const collections = lesson_collections
  const promises = collections.map(item => {
    return mongo.db(DB_CORE)
      .collection(item)
      .find({ creator: userId })
      .toArray()
      .then(result => result.map(lesson => ({ type: collection2type(item), tag: Type2Tag(collection2type(item)), ...lesson })));
  });

  // 使用 Promise.all 并行执行所有查询
  const results = await Promise.all(promises);
  // 将结果平铺到 publicLessons 数组中
  results.forEach(result => resultLessons.push(...result));
  return JSON.parse(JSON.stringify(resultLessons))
}



export async function addFavourite(userId: string, lessonId: string, name: string, type: string) {
  const mongo = await connect()
  const newLesson = {
    id: lessonId,
    name: name,
    type: type,
    lastModified: new Date()
  }
  const res = await mongo.db(DB)
    .collection('users')
    .updateOne(
      { userId: userId },
      {
        //@ts-ignore
        $push: {
          "favourite": newLesson
        }
      });
  return res.acknowledged
}

export async function deleteFavourite(userId: string, lessonId: string) {
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection('users')
    .updateOne(
      { userId: userId },
      {
        //@ts-ignore
        $pull: {
          "favourite": { id: lessonId }
        }
      });
  return res.acknowledged
}

export async function getFavouriteLessons(userId: string) {
  const mongo = await connectCore()
  let resultLessons = [] as any[]
  const userData = await getUserData(userId)
  const favouriteList = userData.favourite
  const promises = favouriteList.map((item: any) => {
    return mongo.db(DB_CORE)
      .collection(Type2Collection(item.type))
      .findOne({ _id: new ObjectId(item.id as string) })
      .then(lesson => ({ type: item.type, tag: Type2Tag(item.type), ...lesson }));
  });

  // 使用 Promise.all 并行执行所有查询
  const results = await Promise.all(promises);
  // 将结果平铺到 publicLessons 数组中
  results.forEach(result => { if (result._id) { resultLessons.push(result) } });
  console.log(resultLessons)
  return JSON.parse(JSON.stringify(resultLessons))
}



export async function deleteScenario(name: string) {
  const mongo = await connectCore()
  const res = await mongo.db(DB_CORE)
    .collection(C_SCENARIOS)
    .deleteOne(
      { name: name }// 查询条件
    );
}

export async function getScenarioByName(name: string) {
  const mongo = await connectCore()
  const scenario = await mongo.db(DB_CORE).collection(C_SCENARIOS).findOne({ name: name })
  return scenario
}

export async function getScenarioById(id: string) {
  const mongo = await connectCore()
  const scenario = await mongo.db(DB_CORE).collection(C_SCENARIOS).findOne({ _id: new ObjectId(id as string) })
  return scenario
}


export async function getCharacterById(id: string) {
  const mongo = await connectCore()
  const character = await mongo.db(DB_CORE).collection(C_CHARACTERS).findOne({ _id: new ObjectId(id as string) })
  return character
}


export async function getStoryById(threadId: string) {
  const mongo = await connectCore()
  const threadPromise = mongo.db(DB_CORE).collection('story_threads').findOne({ _id: new ObjectId(threadId as string) })
  const pagesPromise = mongo.db(DB_CORE).collection('story_pages').find({ _id: new ObjectId(threadId as string) })
  const [thread, pages] = await Promise.all([threadPromise, pagesPromise.toArray()])
  const res = { ...thread, pages: pages }
  return JSON.parse(JSON.stringify(res))
}

export async function getStoryThreadById(threadId: string) {
  const mongo = await connectCore()
  const repeatThread = await mongo.db(DB_CORE).collection('story_threads').findOne({ _id: new ObjectId(threadId as string) })
  return repeatThread
}


export async function getStoryPageByIndex(threadId: string, index: number) {
  const mongo = await connectCore()
  const repeatPage = await mongo.db(DB_CORE).collection('story_pages').findOne({ threadId: new ObjectId(threadId), index: index })
  return repeatPage
}


export async function getRepeatThreadById(threadId: string) {
  const mongo = await connectCore()
  const repeatThread = await mongo.db(DB_CORE).collection(C_REPEAT_THREADS).findOne({ _id: new ObjectId(threadId as string) })
  return repeatThread
}


export async function getRepeatPageByIndex(threadId: string, index: number) {
  const mongo = await connectCore()
  const repeatPage = await mongo.db(DB_CORE).collection(C_REPEAT_PAGES).findOne({ threadId: threadId, index: index })
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
          finishAt: new Date(),
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
      {
        //@ts-ignore
        $push: { record: newRecord }
      })
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
  return res[0]
}

export async function createCharacter(character: any) {
  const mongo = await connectCore()
  const res = await mongo.db(DB_CORE)
    .collection('characters')
    .insertOne(character)
  return res.insertedId.toString()
}

export async function getAllCharacters() {
  const mongo = await connectCore()
  const res = await mongo.db(DB_CORE)
    .collection('characters')
    .find({ isPublic: true })
    .toArray();
  return JSON.parse(JSON.stringify(res))
}

//Talk about
export async function getTalkaboutById(threadId: string) {
  const mongo = await connectCore()
  const repeatThread = await mongo.db(DB_CORE).collection("talkabouts").findOne({ _id: new ObjectId(threadId as string) })
  return repeatThread
}

export async function createTalkaboutRecord(threadId: string, userId: string) {
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection('talkabout_records')
    .insertOne({
      threadId: threadId,
      userId: userId,
      isFinished: false,
      createAt: new Date(),
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
          finishAt: new Date(),
          score: score,
          report: result
        }
      });
  return res.upsertedId?.toString()
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



export async function getWordThreadById(threadId: string) {
  const mongo = await connectCore()
  const repeatThread = await mongo.db(DB_CORE).collection("word_threads").findOne({ _id: new ObjectId(threadId as string) })
  return JSON.parse(JSON.stringify(repeatThread))
}


export async function getWordPageByIndex(threadId: string, index: number) {
  const mongo = await connectCore()
  const repeatPage = await mongo.db(DB_CORE).collection("word_pages").findOne({ threadId: threadId, index: index })
  return repeatPage
}

export async function getWordById(threadId: string) {
  const mongo = await connectCore()
  const threadPromise = mongo.db(DB_CORE).collection("word_threads").findOne({ _id: new ObjectId(threadId) })
  const pagesPromise = mongo.db(DB_CORE).collection("word_pages").find({ threadId: threadId }).sort({ index: 1 }).toArray()
  const [thread, pages] = await Promise.all([threadPromise, pagesPromise])
  const repeatData = { ...thread, content: pages }
  return repeatData
}


export async function getWordRecordByUserId(userId: string) {
  noStore()
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection('word_records')
    .find({ userId: userId })
    .sort({ score: -1 }) // 按 createAt 字段降序排序
    .limit(1) // 只获取一条记录
    .toArray();
  return res[0]
}

export async function saveWordRecord(userId: string, threadId: string, score: number, report: any, record: any[]) {
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection('word_records')
    .insertOne({
      userId: userId,
      threadId: threadId,
      score: +score.toFixed(0),
      report: report,
      record: record,
      isFinished: true,
      finishAt: new Date()
    })
  return res.insertedId.toString()
}


export async function getDictationById(threadId: string) {
  const mongo = await connectCore()
  const threadPromise = mongo.db(DB_CORE).collection("dictation_threads").findOne({ _id: new ObjectId(threadId) })
  const pagesPromise = mongo.db(DB_CORE).collection("dictation_pages").find({ threadId: threadId }).sort({ index: 1 }).toArray()
  const [thread, pages] = await Promise.all([threadPromise, pagesPromise])
  const repeatData = { ...thread, content: pages }
  return repeatData
}

export async function saveDictationRecord(userId: string, threadId: string, score: number, report: any, record: any[]) {
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection('dictation_records')
    .insertOne({
      userId: userId,
      threadId: threadId,
      score: +score.toFixed(0),
      report: report,
      record: record,
      isFinished: true,
      finishAt: new Date()
    })
  return res.insertedId.toString()
}





export async function getImgtalkById(id: string) {
  const mongo = await connectCore()
  const scenario = await mongo.db(DB_CORE).collection('imgtalks').findOne({ _id: new ObjectId(id as string) })
  return scenario
}

export async function createImgtalkRecord(userId: string) {
  const mongo = await connect()
  const now = new Date(); // 获取当前时间的时间戳
  const res = await mongo.db(DB).collection('imgtalk_records').insertOne({
    userId: userId,
    isFinished: false,
    createAt: new Date()
  });
  return res.insertedId.toString()
}


export async function updateScenarioRecord(chatId: string, report: any) {
  const mongo = await connect()
  const now = Date.now(); // 获取当前时间的时间戳
  const lesson = mongo.db(DB).collection('scenario_records')
    .updateOne({ _id: new ObjectId(chatId as string) }, {
      $set: {
        score: +report.score ?? 0,
        report: report,
        isFinished: true,
        finishAt: new Date()
      }
    })
  return lesson
}


export async function createScenarioRecord(userId: string, threadId: string) {
  const mongo = await connect()
  const now = Date.now(); // 获取当前时间的时间戳
  const date = new Date(now); // 将时间戳转换为 Date 对象
  const res = await mongo.db(DB).collection('scenario_records').insertOne({
    userId: userId,
    isFinished: false,
    createAt: new Date(),
    threadId: threadId
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



export async function createWrite(userId: string, values: any) {
  const mongo = await connectCore()
  const res = await mongo.db(DB_CORE)
    .collection('writes')
    .insertOne({ creator: userId, ...values })
  await addToUserLessonList(userId, res.insertedId.toString(), values.name, 'write')
  return res.insertedId.toString()
}

export async function getWriteById(Id: string) {
  const mongo = await connectCore()
  const res = await mongo.db(DB_CORE)
    .collection('writes')
    .findOne({ _id: new ObjectId(Id) })
  return JSON.parse(JSON.stringify(res))
}

export async function createWriteRecord(userId: string, writeId: string) {
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection('write_records')
    .insertOne({
      writeId: writeId,
      userId: userId
    })

  return res.insertedId.toString()
}


export async function getWriteRecordById(Id: string) {
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection('write_records')
    .findOne({ _id: new ObjectId(Id) })

  return JSON.parse(JSON.stringify(res))
}


export async function saveWriteRecord(userId: string, writeId: string, content: string, feedback: any) {
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection('write_records')
    .insertOne({
      threadId: writeId,
      userId: userId,
      content: content,
      score: +feedback.score,
      report: feedback,
      isFinished: true,
      finishAt: new Date()
    })

  return JSON.parse(JSON.stringify(res))
}


export async function createRepeat(userId: string, name: string, content: string[], access: string) {
  const mongo = await connectCore()
  const trimed_content = content.filter(item => item.trim() !== "");
  const res = await mongo.db(DB_CORE)
    .collection('repeats')
    .insertOne({ creator: userId, name: name, content: trimed_content, access: access })
  await addToUserLessonList(userId, res.insertedId.toString(), name, 'repeat')
  return res.insertedId.toString()
}


export async function getRepeatById(threadId: string) {
  const mongo = await connectCore()
  const res = await mongo.db(DB_CORE)
    .collection('repeats')
    .findOne({ _id: new ObjectId(threadId) })
  return JSON.parse(JSON.stringify(res))
}


export async function saveRepeatRecord(userId: string, threadId: string, score: number, report: any, record: any[]) {
  const now = Date.now(); // 获取当前时间的时间戳
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection('repeat_records')
    .insertOne({
      userId: userId,
      threadId: threadId,
      score: +score.toFixed(0),
      report: report,
      record: record,
      isFinished: true,
      finishAt: new Date(),
    })
  return res.insertedId.toString()
}

export async function getReadingById(threadId: string) {
  const mongo = await connectCore()
  const res = await mongo.db(DB_CORE)
    .collection('readings')
    .findOne({ _id: new ObjectId(threadId) })
  return JSON.parse(JSON.stringify(res))
}

export async function saveReadingRecord(userId: string, threadId: string, score: number, report: any, record: any[]) { 
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection('reading_records')
    .insertOne({
      userId: userId,
      threadId: threadId,
      score: +score.toFixed(0),
      report: report,
      record: record,
      isFinished: true,
      finishAt: new Date(),
    })
  return res.insertedId.toString()
}


export async function getTextbookData(id: string) {
  const mongoCore = await connectCore()
  const res = await mongoCore.db(DB_CORE)
    .collection('textbooks')
    .findOne({
      _id: new ObjectId(id)
    })
  if (!res) {
    return null
  }
  for (const unit of res.units) {
    for (const lesson of unit.lessons) {
      const collectionName = (typeMap.find(item => item.type === lesson.type))?.collection
      try {
        const lessonData = await mongoCore.db(DB_CORE).collection(collectionName as string).findOne({ _id: new ObjectId(lesson.id as string) })
        lesson.data = lessonData;
      } catch (error) {
        logger.info(`Get lesson data error,${lesson.type}:${lesson.id}`)
        throw (error)
      }
    }
  }
  return JSON.parse(JSON.stringify(res))
}

export async function getCurrentTextbookData(userId: string) {
  const id = await getCurrentTextbook(userId) as string
  const mongo = await connectCore()
  const res = await mongo.db(DB_CORE)
    .collection('textbooks')
    .findOne({
      _id: new ObjectId(id)
    })
  if (!res) {
    return null
  }
  for (const unit of res.units) {
    for (const lesson of unit.lessons) {
      const collectionName = (typeMap.find(item => item.type === lesson.type))?.collection
      try {
        const lessonData = await mongo.db(DB_CORE).collection(collectionName as string).findOne({ _id: new ObjectId(lesson.id as string) })
        lesson.data = lessonData;
      } catch (error) {
        logger.info(`Get lesson data error,${lesson.type}:${lesson.id}`)
        throw (error)
      }
    }
  }
  return JSON.parse(JSON.stringify(res))
}



export async function createAssignment(assignment: Assignment) {
  const mongo = await connect()

  // 尝试更新一个文档，如果不存在则插入新文档
  const res = await mongo.db(DB)
    .collection('assignments')
    .updateOne(
      {
        threadId: assignment.threadId,
        orgId: assignment.orgId
      },
      {
        $setOnInsert: {
          ...assignment
        }
      },
      {
        upsert: true
      }
    )

  if (res.matchedCount > 0) {
    logger.info('Assignment already exists:', assignment.threadId, assignment.orgId)
    return null
  } else {
    logger.info('New Assignment Created:', assignment.threadId, assignment.orgId)
    return res.upsertedId?.toString()
  }
}

export async function updateAssignment(assignment: Assignment) {
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection('assignments')
    .updateOne({ threadId: assignment.threadId, orgId: assignment.orgId },
      {
        $set: {
          ...assignment,
          updateAt: new Date()
        }
      })
  return res.acknowledged
}

async function getAssignmentById(threadId: string, orgId: string) {
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection('assignments')
    .findOne({
      threadId: threadId,
      orgId: orgId
    },
      {
        sort: { createAt: -1 },
      })
  return res
}

export async function getAssignmentsByOrg(orgId: string) {
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection('assignments')
    .find({
      orgId: orgId
    })
    .toArray()
  return JSON.parse(JSON.stringify(res))
}

export async function getAssignmentsByCreator(creatorId: string, orgId: string) {
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection('assignments')
    .find({
      creatorId: creatorId
    })
    .toArray()
  return JSON.parse(JSON.stringify(res))
}

export async function getMyAssignments(orgId: string, userId: string) {
  const mongo = await connect()
  const core = await connectCore()
  const allAssignments = await mongo.db(DB)
    .collection('assignments')
    .find({
      orgId: orgId
    })
    .toArray()

  const assignmentsWithDetails = await Promise.all(
    allAssignments.map(async (assignment) => {
      const collectionName = Type2Collection(assignment.type)
      const lesson_promise = core.db(DB_CORE).collection(collectionName).findOne({ _id: new ObjectId(assignment.threadId as string) })
      const record_promise = mongo.db(DB).collection(assignment.type + '_records').findOne(
        {
          threadId: assignment.threadId,
          userId: userId,
          finishAt: { $gte: assignment.startAt, $lte: assignment.endAt }
        },
        {
          sort: { score: -1 },
        }
      );
      const [lesson, record] = await Promise.all([lesson_promise, record_promise])
      assignment.info = lesson
      assignment.record = record
      return assignment;
    })
  )
  return assignmentsWithDetails
}

export async function getOrgAssignments(orgId: string) {
  const mongo = await connect()
  const allAssignments = await mongo.db(DB)
    .collection('assignments')
    .find({
      orgId: orgId
    })
    .toArray()
  return JSON.parse(JSON.stringify(allAssignments))
}


export async function getRecordsForAssignment(threadId: string, orgId: string, studentIds: string[]) {
  const mongo = await connect()
  const core = await connectCore()
  const userIds = studentIds
  const [assignment] = await Promise.all([getAssignmentById(threadId, orgId)])
  if (!assignment) {
    return null
  }
  const recordPromise = mongo.db(DB).collection(assignment?.type + '_records').aggregate([
    {
      $match: {
        threadId: threadId,
        userId: { $in: userIds },
        isFinished: true,
        finishAt: { $gte: assignment?.startAt, $lte: assignment?.endAt },
        score: { $gte: 0, $lte: 100 }
      }
    },
    {
      $sort: { score: -1 } // 按照 score 降序排列
    },
    {
      $group: {
        _id: "$userId", // 以 userId 分组
        record: { $first: "$$ROOT" } // 选择每组中第一个记录（即得分最高的记录）
      }
    },
    {
      $replaceRoot: { newRoot: "$record" } // 替换根为记录内容
    }
  ]).toArray();

  const infoPromise = core.db(DB_CORE).collection(Type2Collection(assignment?.type)).findOne({ _id: new ObjectId(threadId) })
  const [info, records] = await Promise.all([infoPromise, recordPromise]);
  const assignmentData = { ...assignment, info: info, records: records }
  return JSON.parse(JSON.stringify(assignmentData))
}

// export async function getAllRecordsByUserId(userId: string) {
//   const mongo = await connect();
//   const promises = typeMap.map(typeEntry => {
//     const pipeline = [
//       {
//         $match: {
//           userId: userId,
//           isFinished: true
//         }
//       },
//       {
//         $sort: {
//           finishAt: -1  // 按finishAt字段倒序排序
//         }
//       },
//       {
//         $limit: 10  // 限制查询结果最多为10条
//       },
//       {
//         $addFields: {
//           type: typeEntry.type,
//           tag: typeEntry.tag,
//           convertedThreadId: { $toObjectId: "$threadId" } 
//         }
//       },
//       {
//         $lookup: {
//           from: Type2Collection(typeEntry.type),  // 关联详细信息集合
//           localField: 'convertedThreadId',  // 本集合的关联字段
//           foreignField: '_id',  // 目标集合的关联字段
//           as: 'info'  // 将结果存储到字段 "info"
//         }
//       },
//       {
//         $unwind: {
//           path: "$info",
//           preserveNullAndEmptyArrays: true  // 如果没有匹配到，也保持结果
//         }
//       }
//     ];
//     return mongo.db(DB).collection(typeEntry.type + '_records').aggregate(pipeline).toArray();
//   });

//   const records = await Promise.all(promises);
//   const mergedRecords = records.flat();


//   mergedRecords.sort((a, b) => new Date(b.finishAt).getTime() - new Date(a.finishAt).getTime());
//   return JSON.parse(JSON.stringify(mergedRecords));
// }
export async function getAllRecordsByUserId(userId: string) {
  const mongo = await connect();
  const core = await connectCore();
  const promises = typeMap.map(typeEntry => {
    const pipeline = [
      {
        $match: {
          userId: userId,
          isFinished: true
        }
      },
      {
        $sort: {
          finishAt: -1  // 按finishAt字段倒序排序
        }
      },
      {
        $limit: 10  // 限制查询结果最多为10条
      },
      {
        $addFields: {
          type: typeEntry.type,
          tag: typeEntry.tag
        }
      }
    ];
    return mongo.db(DB).collection(typeEntry.type + '_records').aggregate(pipeline).toArray();
  });

  const records = await Promise.all(promises);
  const mergedRecords = records.flat();

  // 获取每个record对应的thread信息
  const threadPromises = mergedRecords.map(async record => {
    const thread = await core.db(DB_CORE)
      .collection(Type2Collection(record.type))
      .findOne({ _id: new ObjectId(record.threadId as string) });
    if (thread) {
      return { ...record, info: thread };
    } else {
      logger.info(`找不到匹配的thread，${record.type}:${record.threadId}`)
      // 如果找不到匹配的thread，返回null
      return null;
    }
  });

  // 过滤掉返回null的记录
  const recordsWithInfo = (await Promise.all(threadPromises)).filter(record => record !== null);

  recordsWithInfo.sort((a:any, b:any) => new Date(b.finishAt).getTime() - new Date(a.finishAt).getTime());
  return JSON.parse(JSON.stringify(recordsWithInfo));
}


export async function getBriefForAssignment(threadId: string, orgId: string) {
  const mongo = await connect()
  const mongoCore = await connectCore()
  const [assignment, userIds] = await Promise.all([getAssignmentById(threadId, orgId), getOrgStudents(orgId)])

  const recordPromise = mongo.db(DB).collection(assignment?.type + '_records').aggregate([
    {
      $match: {
        threadId: threadId,
        userId: { $in: userIds },
        isFinished: true,
        finishAt: { $gte: assignment?.startAt, $lte: assignment?.endAt }
      }
    },
    {
      $sort: { score: -1 } // 按照 score 降序排列
    },
    {
      $group: {
        _id: "$userId", // 以 userId 分组
        record: { $first: "$$ROOT" } // 选择每组中第一个记录（即得分最高的记录）
      }
    },
    {
      $replaceRoot: { newRoot: "$record" } // 替换根为记录内容
    }
  ]).toArray();


  const infoPromise = mongoCore.db(DB_CORE).collection(Type2Collection(assignment?.type)).findOne({ _id: new ObjectId(threadId) })
  const [info, records] = await Promise.all([infoPromise, recordPromise]);
  const assignmentData = { assignment, info: info, records: records }
  return JSON.parse(JSON.stringify(assignmentData))
}



export async function getOrgStudents(organizationId: string) {
  const res = await clerkClient().organizations.getOrganizationMembershipList({ organizationId, limit: 100 });
  const newUserIds = res.data
    .filter(orgMem => orgMem.role === 'org:member' && orgMem.publicUserData?.userId)
    .map(orgMem => orgMem.publicUserData!.userId);
  return newUserIds
}



export async function getAnyRecord(userId: string, threadId: string, type: string) {
  noStore()
  const collectionName = Type2Collection(type)
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection(type+'_records')
    .find({ userId: userId, threadId: threadId })
    .sort({ score: -1 }) // 按 createAt 字段降序排序
    .limit(1) // 只获取一条记录
    .toArray();
  if (res[0]) {
    return JSON.parse(JSON.stringify(res[0]))
  } else {
    return null
  }
}

export async function getAnyLesson(threadId: string, type: string) {
  const collectionName = Type2Collection(type)
  const mongo = await connectCore()
  const res = await mongo.db(DB_CORE)
    .collection(collectionName)
    .findOne({ _id: new ObjectId(threadId) })
  if (res) {
    return JSON.parse(JSON.stringify({ type: type, ...res }))
  } else {
    return null
  }
}


export async function fetchRecordData(recordId: string, type: string) {
  // 连接到MongoDB数据库
  const client = await connect();
  const core = await connectCore();

  // 从指定集合中查找指定ID的记录
  const record = await client
      .db(DB)
      .collection(`${type}_records`)
      .findOne({ _id: new ObjectId(recordId) });
  console.log(record)
  // 如果记录不存在，返回nu ll
  if (record === null) return null;

  // 查找对应的typeMap条目
  const typeMapEntry = typeMap.find(entry => entry.type === type);
  if (!typeMapEntry) throw new Error(`Type ${type} not found in typeMap`);

  // 并行获取练习线程和用户信息
  const [info, user] = await Promise.all([
      // 从对应集合中查找练习线程
      core
          .db(DB_CORE)
          .collection(typeMapEntry.collection)
          .findOne({ _id: new ObjectId(record.threadId as string) }),
      // 获取用户信息
      clerkClient()
          .users
          .getUser(record.userId) ?? null
  ]);

  // 获取学生中文名等信息，如果不存在则使用默认名称
  const userData = {
    userName:user?.username,
    chineseName:getChineseName(user) ?? '未命名用户'
  }

  return { record, info, userData };
}



// Translation
export async function getTranslationById(id: string) {
  const mongo = await connectCore()
  const res = await mongo.db(DB_CORE).collection('translations').findOne({ _id: new ObjectId(id) })
  return JSON.parse(JSON.stringify(res))
}

export async function saveTranslationRecord(userId: string, threadId: string, content: string, feedback: any) {
  const mongo = await connect()
  const res = await mongo.db(DB).collection('translation_records').insertOne(
    { userId: userId, 
      threadId: threadId, 
      score:feedback.score,
      stu_answer: content, 
      report: feedback }
  )
  return res.insertedId.toString()
}

//Listening
export async function getListeningById(id: string) {
  const mongo = await connectCore()
  const res = await mongo.db(DB_CORE).collection('listenings').findOne({ _id: new ObjectId(id) })
  return JSON.parse(JSON.stringify(res))
}

export async function saveListeningRecord(userId: string, threadId: string, score: number, stu_answers: string[], result: any) {
  const mongo = await connect()
  const res = await mongo
  .db(DB)
  .collection('listening_records')
  .insertOne(
    { userId: userId, 
      threadId: threadId, 
      score:score, 
      stu_answers: stu_answers, 
      report: result
    })
  return res.insertedId.toString()
}


//Prompt
export async function getPrompt(id: string) {
  console.log('Fetching Prompt')
  const mongo = await connectCore()
  const res = await mongo.db(DB_CORE).collection('prompts').findOne({ _id: new ObjectId(id) })
  return JSON.parse(JSON.stringify(res))
}