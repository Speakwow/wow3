'use client'
import React from 'react';

export const TextWithHighlights = ({ text ,setMistakeCount }:{text:string,setMistakeCount:React.Dispatch<React.SetStateAction<number>>}) => {
  const regex = /<w>(.*?)<\/w>/g;
  let match;
  let parts = [];
  let lastIndex = 0;
  let count = 0 


  // 循环匹配并构建新数组
  while ((match = regex.exec(text)) !== null) {
    // 添加之前的文本和高亮文本
    parts.push(text.substring(lastIndex, match.index));
    parts.push(<span key={match.index} style={{ color: 'red' }}>{match[1]}</span>);
    lastIndex = regex.lastIndex;
    count+= match[1].split(/\s+/).filter(Boolean).length;; // 计数单词数量
  }
  setMistakeCount(count)
  // 添加最后一段没有 <w></w> 的文本
  parts.push(text.substring(lastIndex));

  return (
    <div className='text-[#19B700]'>
      {parts}
    </div>
  );
};

export default TextWithHighlights;