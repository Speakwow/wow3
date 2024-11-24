interface TypeMapEntry {
  type: string;
  collection: string;
  tag: string;
  intro: string;
  banner: string;
  icon: string;
}

export const typeMap: TypeMapEntry[] = [
  {
    type:"scenario",
    collection:"scenarios",
    tag:"情景对话",
    intro: 'AI助手引导学生进行特定主题的实时交流，提升口语能力的有趣语言冒险。',
    banner: 'https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/1d0c20b7-ac42-4961-b476-b1f769d5cd00/avatar',
    icon:"https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/1d0c20b7-ac42-4961-b476-b1f769d5cd00/avatar"
  },
  {
    type:"talkabout",
    collection:"talkabouts",
    tag:"看图说话",
    intro: '通过生动有趣的看图说话练习，激发学生想象力，提升口语表达能力。AI助手提供专业点评。',
    banner: 'https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/1d0c20b7-ac42-4961-b476-b1f769d5cd00/avatar',
    icon:"https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/1d0c20b7-ac42-4961-b476-b1f769d5cd00/avatar"

  },
  {
    type:"repeat",
    collection:"repeats",
    tag:"课文跟读",
    intro: '跟随AI导师的节奏，朗读课文，让发音和语调如音乐般优美。每次跟读都是一次突破，每个音节都是进步的音符。',
    banner: 'https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/1d0c20b7-ac42-4961-b476-b1f769d5cd00/avatar',
    icon:"https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/1d0c20b7-ac42-4961-b476-b1f769d5cd00/avatar"
  },
  {
    type:"word",
    collection:"word_threads",
    tag:"词汇强化",
    intro: '通过词汇强化练习，提高学生的词汇量和词汇运用能力。AI会评估学生的词汇掌握情况并提供反馈。',
    banner: 'https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/1d0c20b7-ac42-4961-b476-b1f769d5cd00/avatar',
    icon:"https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/1d0c20b7-ac42-4961-b476-b1f769d5cd00/avatar"
  },
  {
    type:"dictation",
    collection:"dictation_threads",
    tag:"听写练习",
    intro: '通过听音频内容进行写作练习，提高听力理解和拼写能力。AI会评估学生的听写结果并提供反馈。',
    banner: 'https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/1d0c20b7-ac42-4961-b476-b1f769d5cd00/avatar',
    icon:"https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/1d0c20b7-ac42-4961-b476-b1f769d5cd00/avatar"
  },
  {
    type:"write",
    collection:"writes",
    tag:"写作练习",
    intro: '通过精心设计的主题和提示，激发学生创意思维，引导深度写作。AI助手评估作品，提供个性化反馈。',
    banner: 'https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/1d0c20b7-ac42-4961-b476-b1f769d5cd00/avatar',
    icon:"https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/1d0c20b7-ac42-4961-b476-b1f769d5cd00/avatar"
  },
  {
    type:"reading",
    collection:"readings",
    tag:"阅读问答",
    intro: '通过精选的阅读材料和相关问题，培养学生的阅读理解能力和批判性思维。AI助手提供个性化指导，帮助学生深入理解文本内容。',
    banner: 'https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/1d0c20b7-ac42-4961-b476-b1f769d5cd00/avatar',
    icon:"https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/1d0c20b7-ac42-4961-b476-b1f769d5cd00/avatar"
  },
  {
    type:"translation",
    collection:"translations",
    tag:"翻译练习",
    intro: '通过翻译练习，提高学生的语言转换能力和语言表达能力。AI会评估学生的翻译结果并提供反馈。',
    banner: 'https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/1d0c20b7-ac42-4961-b476-b1f769d5cd00/avatar',
    icon:"https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/1d0c20b7-ac42-4961-b476-b1f769d5cd00/avatar"
  },
  {
    type:"listening",
    collection:"listenings",
    tag:"听力练习",
    intro: '通过听力练习，提高学生的听力理解和语言表达能力。AI会评估学生的听力结果并提供反馈。',
    banner: 'https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/1d0c20b7-ac42-4961-b476-b1f769d5cd00/avatar',
    icon:"https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/1d0c20b7-ac42-4961-b476-b1f769d5cd00/avatar"
  }
]

export const Type2Tag = (type:string) => {
  const entry = typeMap.find(item => item.type === type);
  return entry ? entry.tag : null;
}

export const Type2Collection= (type:string) => {
  const entry = typeMap.find(item => item.type === type);
  return entry ? entry.collection : '';
}

export function collection2type(collection: string) {
  const entry = typeMap.find(item => item.collection === collection);
  return entry ? entry.type : 'undefined';
}