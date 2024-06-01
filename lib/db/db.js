function findCollectinByType(type) {
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
    return collection
  }
  