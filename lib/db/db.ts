
export function collection2type(collection: string) {
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
    case 'writes':
      return 'write';
      case 'repeats':
        return 'repeat';
    default:
      return 'undefined';
  }
}

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
    intro: '指定情景话题下的实时对话，AI引导学生探讨相关话题。',
    banner: 'https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/1d0c20b7-ac42-4961-b476-b1f769d5cd00/avatar',
    icon:"https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/1d0c20b7-ac42-4961-b476-b1f769d5cd00/avatar'"
  },
  {
    type:"talkabout",
    collection:"talkabouts",
    tag:"看图说话",
    intro: '指定情景话题下的实时对话，AI引导学生探讨相关话题。',
    banner: 'https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/1d0c20b7-ac42-4961-b476-b1f769d5cd00/avatar',
    icon:"https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/1d0c20b7-ac42-4961-b476-b1f769d5cd00/avatar'"

  },
  {
    type:"repeat",
    collection:"repeats",
    tag:"课文跟读",
    intro: '指定情景话题下的实时对话，AI引导学生探讨相关话题。',
    banner: 'https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/1d0c20b7-ac42-4961-b476-b1f769d5cd00/avatar',
    icon:"https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/1d0c20b7-ac42-4961-b476-b1f769d5cd00/avatar'"
  },
  {
    type:"word",
    collection:"word_threads",
    tag:"词汇强化",
    intro: '指定情景话题下的实时对话，AI引导学生探讨相关话题。',
    banner: 'https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/1d0c20b7-ac42-4961-b476-b1f769d5cd00/avatar',
    icon:"https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/1d0c20b7-ac42-4961-b476-b1f769d5cd00/avatar'"
  },
  {
    type:"write",
    collection:"writes",
    tag:"写作练习",
    intro: '指定情景话题下的实时对话，AI引导学生探讨相关话题。',
    banner: 'https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/1d0c20b7-ac42-4961-b476-b1f769d5cd00/avatar',
    icon:"https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/1d0c20b7-ac42-4961-b476-b1f769d5cd00/avatar'"
  },
]

export const Type2Tag = (type:string) => {
  const entry = typeMap.find(item => item.type === type);
  return entry ? entry.tag : null;
}

export const Type2Collection= (type:string) => {
  const entry = typeMap.find(item => item.type === type);
  return entry ? entry.collection : '';
}