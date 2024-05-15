'use server'
import { connect } from '@/lib/mongo'
import { C_CHARACTERS, C_REPEAT_PAGES, C_REPEAT_THREADS, C_SCENARIOS, DB } from '@/lib/constant'
import { ObjectId } from 'mongodb'

export async function updateScenario(name:string,content:any) {
  const mongo = await connect()
  const res = await mongo.db(DB)
  .collection(C_SCENARIOS)
  .updateOne(
    { name: name }, // 查询条件
    { $set: content }, // 更新操作
    { upsert: true } // 如果不存在则插入新文档
  );
}

export async function deleteScenario(name:string) {
  const mongo = await connect()
  const res = await mongo.db(DB)
  .collection(C_SCENARIOS)
  .deleteOne(
    { name: name }// 查询条件
  );
}

export async function getScenarioByName(name:string) {
  const mongo = await connect()
  const scenario = await mongo.db(DB).collection(C_SCENARIOS).findOne({name:name})
  return scenario
}

export async function getScenarioById(id:string) {
  const mongo = await connect()
  const scenario = await mongo.db(DB).collection(C_SCENARIOS).findOne({ _id: new ObjectId(id as string)})
  return scenario
}


export async function getCharacterById(id:string) {
  const mongo = await connect()
  const character= await mongo.db(DB).collection(C_CHARACTERS).findOne({ _id: new ObjectId(id as string)})
  return character
}

export async function getRepeatThreadById(threadId:string) {
  const mongo = await connect()
  const repeatThread = await mongo.db(DB).collection(C_REPEAT_THREADS).findOne({ _id: new ObjectId(threadId as string)})
  return repeatThread
}


export async function getRepeatPageByIndex(threadId:string,index:number) {
  const mongo = await connect()
  const repeatPage = await mongo.db(DB).collection(C_REPEAT_PAGES).findOne({ threadId: threadId, index:index})
  console.log(repeatPage)
  return repeatPage
}


export async function getAllLessons() {
  const mongo = await connect()
  const lessons = mongo.db(DB).collection('lessons').find()
  const res = await lessons.toArray()
  return res
}

export async function getLessonById(lessonId:string) {
  const mongo = await connect()
  const lesson = mongo.db(DB).collection('lessons').find({_id: new ObjectId(lessonId as string)})
  return lesson
}


export async function updateScenarioRecord(chatId:string,report:any) {
    const mongo = await connect()
    const now = Date.now(); // 获取当前时间的时间戳
    const date = new Date(now); // 将时间戳转换为 Date 对象
    const lesson = mongo.db(DB).collection('scenario_records')
    .updateOne({_id: new ObjectId(chatId as string)},{$set:{
        report,
        isFinished:true,
        finishAt:date.toLocaleString()
    }})
    return lesson
}

export async function createScenarioRecord(userId:string) {
    const mongo = await connect()
    const now = Date.now(); // 获取当前时间的时间戳
    const date = new Date(now); // 将时间戳转换为 Date 对象
    const res = await mongo.db(DB).collection('scenario_records').insertOne({
        userId:userId,
        isFinished:false,
        createAt:date.toLocaleString()
      });
    return res.insertedId.toString()
}


export async function getScenarioRecordByUserId(userId:string){
    const mongo = await connect()
    const res = await mongo.db(DB)
    .collection('scenario_records')
    .find({ userId:userId })
    .sort({ score: -1 }) // 按 createAt 字段降序排序
    .limit(1) // 只获取一条记录
    .toArray();
    return res[0]
}