export function findCollectionByType(type: string): string {
  const collections: { [key: string]: string } = {
      talkabout: "talkabouts",
      word: "word_threads",
      scenario: "scenarios",
      repeat: "repeat_threads",
      write:"writes",
      story:"story_threads"
  };
  return collections[type] || `${type}_threads`;
}

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

export function type2tag(collection: string) {
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
    case 'write':
      return '写作练习';
    default:
      return '';
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
]

export const Type2Tag = (type:string) => {
  const entry = typeMap.find(item => item.type === type);
  return entry ? entry.tag : null;
}
