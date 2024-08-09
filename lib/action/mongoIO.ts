'use server'
import { connect } from '@/lib/mongo'
import { C_CHARACTERS, C_REPEAT_PAGES, C_REPEAT_THREADS, C_SCENARIOS, DB, lesson_collections } from '@/lib/constant'
import { ObjectId } from 'mongodb'
import { unstable_noStore as noStore } from 'next/cache';
import { collection2type, Type2Collection, typeMap, Type2Tag } from '../db/db';
import { Assignment } from '../schema/assign';
import { assign } from 'lodash';
import { clerkClient } from '@clerk/nextjs/server';
import { logger } from '../logger';
import { getBeijingTime } from '../tools';

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
export async function createScenario(userId: string, content: any) {
  const mongo = await connect()
  const res = await mongo.db(DB)
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
  const mongo = await connect()
  const res = await mongo.db(DB)
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
  const mongo = await connect()
  const collection = Type2Collection(type)
  const res = await mongo.db(DB)
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
  const mongo = await connect()
  let publicLessons = [] as any[]
  const collections = lesson_collections
  const promises = collections.map(item => {
    return mongo.db(DB)
      .collection(item)
      .find({ access: 'public' })
      .toArray()
      .then(result => result.map(lesson => ({ type: collection2type(item), tag: Type2Tag(collection2type(item)), ...lesson })));
  });

  // 使用 Promise.all 并行执行所有查询
  const results = await Promise.all(promises);
  // 将结果平铺到 publicLessons 数组中
  results.forEach(result => publicLessons.push(...result));
  return JSON.parse(JSON.stringify(publicLessons))
}

export async function getLessonsByCreator(userId: string) {
  const mongo = await connect()
  let resultLessons = [] as any[]
  const collections = lesson_collections
  const promises = collections.map(item => {
    return mongo.db(DB)
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
  const mongo = await connect()
  let resultLessons = [] as any[]
  const userData = await getUserData(userId)
  const favouriteList = userData.favourite
  const promises = favouriteList.map((item: any) => {
    return mongo.db(DB)
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
  return scenario
}


export async function getCharacterById(id: string) {
  const mongo = await connect()
  const character = await mongo.db(DB).collection(C_CHARACTERS).findOne({ _id: new ObjectId(id as string) })
  return character
}


export async function getStoryById(threadId: string) {
  const mongo = await connect()
  const threadPromise = mongo.db(DB).collection('story_threads').findOne({ _id: new ObjectId(threadId as string) })
  const pagesPromise = mongo.db(DB).collection('story_pages').find({ _id: new ObjectId(threadId as string) })
  const [thread, pages] = await Promise.all([threadPromise, pagesPromise.toArray()])
  const res = { ...thread, pages: pages }
  return JSON.parse(JSON.stringify(res))
}

export async function getStoryThreadById(threadId: string) {
  const mongo = await connect()
  const repeatThread = await mongo.db(DB).collection('story_threads').findOne({ _id: new ObjectId(threadId as string) })
  return repeatThread
}


export async function getStoryPageByIndex(threadId: string, index: number) {
  const mongo = await connect()
  const repeatPage = await mongo.db(DB).collection('story_pages').findOne({ threadId: new ObjectId(threadId), index: index })
  return repeatPage
}


export async function getRepeatThreadById(threadId: string) {
  const mongo = await connect()
  const repeatThread = await mongo.db(DB).collection(C_REPEAT_THREADS).findOne({ _id: new ObjectId(threadId as string) })
  return repeatThread
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
          finishAt: getBeijingTime(),
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
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection('characters')
    .insertOne(character)
  return res.insertedId.toString()
}

export async function getAllCharacters() {
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection('characters')
    .find({ isPublic: true })
    .toArray();
  return JSON.parse(JSON.stringify(res))
}

//Talk about
export async function getTalkaboutById(threadId: string) {
  const mongo = await connect()
  const repeatThread = await mongo.db(DB).collection("talkabouts").findOne({ _id: new ObjectId(threadId as string) })
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
      createAt: getBeijingTime(),
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
          finishAt: new Date(getBeijingTime()),
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
  const mongo = await connect()
  const repeatThread = await mongo.db(DB).collection("word_threads").findOne({ _id: new ObjectId(threadId as string) })
  return JSON.parse(JSON.stringify(repeatThread))
}


export async function getWordPageByIndex(threadId: string, index: number) {
  const mongo = await connect()
  const repeatPage = await mongo.db(DB).collection("word_pages").findOne({ threadId: threadId, index: index })
  return repeatPage
}

export async function getWordById(threadId: string) {
  const mongo = await connect()
  const threadPromise = mongo.db(DB).collection("word_threads").findOne({ _id: new ObjectId(threadId) })
  const pagesPromise = mongo.db(DB).collection("word_pages").find({ threadId: threadId }).sort({ index: 1 }).toArray()
  const [thread, pages] = await Promise.all([threadPromise, pagesPromise])
  const repeatData = { ...thread, content: pages }
  return repeatData
}



export async function createWordRecord(threadId: string, userId: string) {
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection('word_records')
    .insertOne({
      threadId: threadId,
      userId: userId,
      isFinished: false,
      createAt: new Date(getBeijingTime()),
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
          finishAt: getBeijingTime(),
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

      {
        //@ts-ignore
        $push: { record: newRecord }
      })
  return res
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
      finishAt: getBeijingTime(),
    })
  return res.insertedId.toString()
}



export async function getAllLessons() {
  noStore()
  const mongo = await connect()
  const lessons = mongo.db(DB).collection('lessons').find()
  const res = await lessons.toArray()
  return res
}

export async function getMyLessons(userId: string) {
  noStore()
  const mongo = await connect()
  const lessons = mongo.db(DB).collection('lessons').find({ userId: userId })
  const res = await lessons.toArray()
  return JSON.parse(JSON.stringify(res))
}

export async function getLessonListById(lessonId: string) {
  noStore()
  const mongo = await connect()
  const lesson = mongo.db(DB).collection('lessons').find({ _id: new ObjectId(lessonId as string) })
  return lesson
}

export async function getImgtalkById(id: string) {
  const mongo = await connect()
  const scenario = await mongo.db(DB).collection('imgtalks').findOne({ _id: new ObjectId(id as string) })
  return scenario
}

export async function createImgtalkRecord(userId: string) {
  const mongo = await connect()
  const now = Date.now(); // 获取当前时间的时间戳
  const date = new Date(now); // 将时间戳转换为 Date 对象
  const res = await mongo.db(DB).collection('imgtalk_records').insertOne({
    userId: userId,
    isFinished: false,
    createAt: getBeijingTime()
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
        finishAt: getBeijingTime()
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
    createAt: getBeijingTime()
  });
  return res.insertedId.toString()
}


export async function getScenarioRecordByUserId(userId: string) {
  noStore()
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection('scenario_records')
    .find({ userId: userId })
    .sort({ score: -1 }) // 按 createAt 字段降序排序
    .limit(1) // 只获取一条记录
    .toArray();
  return res[0]
}


export async function createWrite(userId: string, values: any) {
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection('writes')
    .insertOne({ creator: userId, ...values })
  await addToUserLessonList(userId, res.insertedId.toString(), values.name, 'write')
  return res.insertedId.toString()
}

export async function getWriteById(Id: string) {
  const mongo = await connect()
  const res = await mongo.db(DB)
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
      finishAt: getBeijingTime()
    })

  return JSON.parse(JSON.stringify(res))
}


export async function createRepeat(userId: string, name: string, content: string[], access: string) {
  const mongo = await connect()
  const trimed_content = content.filter(item => item.trim() !== "");
  const res = await mongo.db(DB)
    .collection('repeats')
    .insertOne({ creator: userId, name: name, content: trimed_content, access: access })
  await addToUserLessonList(userId, res.insertedId.toString(), name, 'repeat')
  return res.insertedId.toString()
}


export async function getRepeatById(threadId: string) {
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection('repeats')
    .findOne({ _id: new ObjectId(threadId) })
  return JSON.parse(JSON.stringify(res))
}

// export async function saveRepeatRecord(userId: string, name: string, content: string[]) {
//   const mongo = await connect()
//   const res = await mongo.db(DB)
//     .collection('repeats')
//     .insertOne({ creator: userId, name: name, content: content })
//   await addToUserLessonList(userId, res.insertedId.toString(), name, 'repeat')
//   return res.insertedId.toString()
// }


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
      finishAt: new Date(getBeijingTime()),
    })
  return res.insertedId.toString()
}


export async function getTextbookData(id: string) {
  const mongo = await connect()
  const res = await mongo.db(DB)
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
        const lessonData = await mongo.db(DB).collection(collectionName as string).findOne({ _id: new ObjectId(lesson.id as string) })
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
    .updateOne({ threadId: assignment.threadId,orgId:assignment.orgId },
      {
        $set: {
          ...assignment,
          updateAt:getBeijingTime()
        }
      })
      console.log(res)
    
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
  const allAssignments = await mongo.db(DB)
    .collection('assignments')
    .find({
      orgId: orgId
    })
    .toArray()

  const assignmentsWithDetails = await Promise.all(
    allAssignments.map(async (assignment) => {
      const collectionName = Type2Collection(assignment.type)
      const lesson_promise = mongo.db(DB).collection(collectionName).findOne({ _id: new ObjectId(assignment.threadId as string) })
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

  const infoPromise = mongo.db(DB).collection(Type2Collection(assignment?.type)).findOne({ _id: new ObjectId(threadId) })
  const [info, records] = await Promise.all([infoPromise, recordPromise]);
  const assignmentData = { ...assignment, info: info, records: records }
  return JSON.parse(JSON.stringify(assignmentData))
}


export async function getBriefForAssignment(threadId: string, orgId: string) {
  const mongo = await connect()
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


  const infoPromise = mongo.db(DB).collection(Type2Collection(assignment?.type)).findOne({ _id: new ObjectId(threadId) })
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
  console.log(userId)
  const collectionName = Type2Collection(type)
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection(collectionName)
    .find({ userId: userId, threadId: threadId })
    .sort({ score: -1 }) // 按 createAt 字段降序排序
    .limit(1) // 只获取一条记录
    .toArray();
  console.log('Find result:')
  console.log(res[0])
  if (res[0]) {
    return JSON.parse(JSON.stringify(res[0]))
  } else {
    return null
  }
}

export async function getAnyLesson(threadId: string, type: string) {
  const collectionName = Type2Collection(type)
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection(collectionName)
    .findOne({ _id: new ObjectId(threadId) })
  if (res) {
    return JSON.parse(JSON.stringify({ type: type, ...res }))
  } else {
    return null
  }
}

export async function getAllLessonsByLessonId(lessonId: string) {
  const mongo = await connect()
  const lessonList = await mongo.db(DB).collection('lessons').findOne({ _id: new ObjectId(lessonId as string) })
  if (!lessonList) {
    return null
  }
  //@ts-ignore
  const promises = lessonList.chapters.map(items => getAnyLesson(items.id, items.type));
  const results = await Promise.all(promises);
  return JSON.parse(JSON.stringify(results));
}


