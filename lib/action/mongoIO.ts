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

export async function getUserData(userId: string) {
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection('users')
    .findOne(
      { userId: userId })
    if(!res){
    const res = await mongo.db(DB)
    .collection('users')
    .insertOne(
      { userId: userId ,
        lessonList:[]
      })
    return {_id:res.insertedId,userId:userId,lessonList:[]}
  }
  return JSON.parse(JSON.stringify(res))
}

function collection2type(collection:string) {
  switch (collection) {
    case 'scenarios':
      return 'scenario';
    case 'talkabouts':
      return 'talkabout';
    case 'repeat_threads':
      return 'repeat';
    case 'word_threads':
      return 'word';
      case 'story_threads':
        return 'story';
    default:
      return 'undefined';
  }
}

function type2tag(collection:string) {
  switch (collection) {
    case 'scenario':
      return '情景对话';
    case 'talkabout':
      return '看图说话';
    case 'repeat':
      return '跟读练习';
    case 'word':
      return '词汇强化';
      case 'story':
        return '绘本阅读';
    default:
      return '';
  }
}

export async function getPublicData() {
  const mongo = await connect()
  let publicLessons = [] as any[]
  const collections = ['scenarios', 'talkabouts', 'repeat_threads', 'word_threads','story_threads']
  const promises = collections.map(item => {
    return mongo.db(DB)
      .collection(item)
      .find({ access: 'public' })
      .toArray()
      .then(result => result.map(lesson => ({ type: collection2type(item), tag:type2tag(collection2type(item)), ...lesson })));
  });

  // 使用 Promise.all 并行执行所有查询
  const results = await Promise.all(promises);
  // 将结果平铺到 publicLessons 数组中
  results.forEach(result => publicLessons.push(...result));
  console.log(publicLessons)
  return JSON.parse(JSON.stringify(publicLessons))
}


// export async function addToFavourite(userId: string, content: any, type: string) {
//   console.log('saving')
//   const mongo = await connect()
//   const res = await mongo.db(DB)
//     .collection(C_SCENARIOS)
//     .insertOne({ creator: userId, ...content });
//   console.log('saved ok')
//   return res.insertedId.toString()
// }


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
  const threadPromise =  mongo.db(DB).collection('story_threads').findOne({ _id: new ObjectId(threadId as string) })
  const pagesPromise =  mongo.db(DB).collection('story_pages').find({ _id: new ObjectId(threadId as string) })
  const [thread,pages] = await Promise.all([threadPromise,pagesPromise.toArray()])
  const res =  {...thread,pages:pages}
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

export async function finishTalkaboutRecord(recordId: string, score: number, feedback: string) {
  const now = Date.now(); // 获取当前时间的时间戳
  const mongo = await connect()
  const current = await mongo.db(DB)
    .collection('talkabout_records')
    .findOne({ _id: new ObjectId(recordId) })
  const duration = (now - current?.createAt) / 60000
  const res = await mongo.db(DB)
    .collection('word_records')
    .updateOne(
      { _id: new ObjectId(recordId) },
      {
        $set: {
          isFinished: true,
          finishAt: now,
          score: score,
          feedback: feedback,
        }
      });
}

export async function getTalkaboutRecordByUserId(userId: string) {
  noStore()
  const mongo = await connect()
  const res = await mongo.db(DB)
    .collection('talkabout_records')
    .find({ userId: userId })
    .sort({ score: -1 }) // 按 createAt 字段降序排序
    .limit(1) // 只获取一条记录
    .toArray();
  return res[0]
}


//Word
export async function getWordThreadById(threadId: string) {
  const mongo = await connect()
  const repeatThread = await mongo.db(DB).collection("word_threads").findOne({ _id: new ObjectId(threadId as string) })
  return repeatThread
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
    createAt: date.toLocaleString()
  });
  return res.insertedId.toString()
}


export async function updateScenarioRecord(chatId: string, report: any) {
  const mongo = await connect()
  const now = Date.now(); // 获取当前时间的时间戳
  const date = new Date(now); // 将时间戳转换为 Date 对象
  const lesson = mongo.db(DB).collection('scenario_records')
    .updateOne({ _id: new ObjectId(chatId as string) }, {
      $set: {
        ...report,
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

