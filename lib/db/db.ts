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