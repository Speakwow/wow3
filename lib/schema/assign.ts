// Data Schema

import { ObjectId } from "mongodb"

export interface Assignment{
    _id?:ObjectId
    type:string,
    threadId:string,
    textbookId?:string,
    creatorId:string,
    orgId:string,
    createAt:Date,
    updateAt:Date,
    startAt:Date,
    endAt:Date
}