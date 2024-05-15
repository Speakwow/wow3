
'use client';

import { Message, useChat } from 'ai/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CardHeader } from '@/components/ui/card';
import React, { useState, useEffect, useRef } from 'react';
import { Keyboard, Mic, PlayIcon, SendIcon } from 'lucide-react';
import { Avatar, AvatarImage, } from "@/components/ui/avatar"
import { synthesizeSpeech } from '@/lib/speech/tts';
import { sttFromMic } from '@/lib/speech/asr';
import { Howl, Howler } from 'howler';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { webm2Wav } from '@/lib/speech/wav';
import { EvalResult, evalSpeechFromFile } from '@/lib/speech/eval';
import Link from 'next/link';


//Report Params
let totalFluencyScore = 0
let totalAccuracyScore = 0
let dialogLength = 0
let stayTime = 0;

export default function Chat(params: { chatid: string }) {
  //Handle Playing Audio
  function handleAudioPlay(audioData: ArrayBuffer) {
    const audioBlob = new Blob([audioData], { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(audioBlob);
    var sound = new Howl({
      src: [audioUrl],
      format: ['wav'],
      autoplay: true,
      onload: function () {
        setLoading(true);
        setIsPlaying(true)
      },
      onend: function () {
        setIsPlaying(false)
        console.log('Playback finished');
        const continueSession = handleReport()
        if (isVoiceInput&&continueSession) {
          handleSpeechToText()
        } else {
          setLoading(false)
        }
      }
    });
    sound.play();
  }
  let currentMessage = ''
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    headers: { 'X-ChatId': params.chatid },
    onFinish(messages) {
      setHint('')
      currentMessage=messages.content
      synthesizeSpeech(messages.content, audioData => {
        if (audioData) {
          handleAudioPlay(audioData)
        } else {
          console.error('Speech synthesis failed or returned no audio');
        }
      })
    }
  },);

  const [recognitionText, setRecognitionText] = useState(''); // 存储语音识别的文本
  const [displayText, setDisplayText] = useState('');

  const [isVoiceInput, setIsVoiceInput] = useState(true)
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const [startTime, setStartTime] = useState(Date.now());
  //Welcome Messgae TTS
  useEffect(() => {
    synthesizeSpeech('Hi, I am Marina the Mermaid, how are you doing?', audioData => {
      if (audioData) {
        handleAudioPlay(audioData)
      } else {
        console.error('Speech synthesis failed or returned no audio');
      }})
  }, []);

  //ASR text Input
  useEffect(() => {
    const mockEvent = {
      target: { value: recognitionText }
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(mockEvent);
  }, [recognitionText]);

  //Submit while Input Change
  useEffect(() => {
    if (input && input.length > 0 && submitButtonRef.current) {
      console.log('input:', input)
      submitButtonRef.current.click();
    }
  }, [input]);

  // //Handle Asr
  // const handleSpeechToText = async () => {
  //   setDisplayText('Listening...');
  //   setLoading(true)
  //   setRecognitionText('');
  //   try {
  //     const text = await sttFromMic() as string;
  //     setDisplayText(text);
  //     setRecognitionText(text);

  //   } catch (error) {
  //     console.error('Speech recognition error:', error);
  //     setDisplayText('Not Hearing...');
  //     if(currentMessage&&currentMessage.length>0){
  //     handleHint()
  //     }
  //     setLoading(false)
  //   }
  // };

  //Handle Asr with Eval
  const handleSpeechToText = async () => {
    setDisplayText('Listening...');
    setLoading(true)
    setRecognitionText('');
    try {
      // 使用 MediaRecorder API 进行录音
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      let audioChunks: Blob[] = [];
      mediaRecorder.start();
      mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
      };

      const text = await sttFromMic() as string;
      setDisplayText(text);
      setRecognitionText(text);
      mediaRecorder.stop();
      mediaRecorder.onstop = async () => {
        // 创建 Blob 保存音频文件
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        const wavBlob = await webm2Wav(audioBlob)
        // const audioUrl = URL.createObjectURL(wavBlob);
        // downloadWavFile(wavBlob, 'output.wav');
        const evalResult = await evalSpeechFromFile(text, wavBlob) as EvalResult;
        
        dialogLength = dialogLength + evalResult.length;
        totalAccuracyScore = totalAccuracyScore + evalResult.accuracy * evalResult.length;
        totalFluencyScore = totalFluencyScore + evalResult.fluency * evalResult.length;

        console.log('words num:', dialogLength)
        console.log('Accuracy:', totalAccuracyScore / dialogLength)
        console.log('Fluency:', totalFluencyScore / dialogLength)


        // URL.revokeObjectURL(audioUrl);
        audioChunks = []; // 清空数组以释放内存」
      }
    } catch (error) {
      console.error('Speech recognition error:', error);
      setDisplayText('Not Hearing...');
      if (currentMessage && currentMessage.length > 0) {
        handleHint()
      }
      setLoading(false)
    }
  };



  //Handle Hint
  const [hint, setHint] = useState('')
  const handleHint = async () => {
    const res = await fetch('/api/hint',
      {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: currentMessage })
      })
    const data = await res.json()
    setHint(data.message)
    setDisplayText('You May Say:')
  }
  const playHint = async () => {
    synthesizeSpeech(hint, audioData => {
      if (audioData) {
        const audioBlob = new Blob([audioData], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        var sound = new Howl({
          src: [audioUrl],
          format: ['wav'],
          autoplay: true,
        });
        sound.play();
      } else {
        console.error('Speech synthesis failed or returned no audio');
      }
    })
  }


  const reportTriggerRef = useRef<HTMLButtonElement>(null);
  //handle Report
  const exitKeywords = ['goodbye','bye','see you','bye-bye']
  function handleReport() {
    stayTime = Date.now() - startTime
    const lowerCaseMessage = currentMessage.toLowerCase()
    if (exitKeywords.some(exitKeyword =>
      lowerCaseMessage.includes(exitKeyword))) {
      if (reportTriggerRef.current) {
        reportTriggerRef.current.click();
       
      }
      return false
    }
    else{
      return true
    }
  }

  return (

    <div className='relative h-full bg-transparent rounded-10 min-w-full'>
      <CardHeader className='h-[16rem] w-full relative'>
        <div className=' h-full flex justify-center'>
          <div>
            <div className='relative top-6 flex justify-center'>
              <div className='h-fit cursor-default rounded-full bg-[#2196F3] text-white py-2 px-8 w-fit font-bold text-xl shadow-[0.25rem_0.25rem_0_#1E6AA7]'>
                Marina
              </div>
            </div>
            <div className="flex justify-center max-w-2xl p-4 w-full bg-[#F5E0A7] min-h-32 rounded-3xl shadow-[0.5rem_0.5rem_0_#C2A042] sm:shadow-none sm:w-[40rem] sm:h-[8.5rem] md:w-[46rem] md:h-[9.5rem] sm:p-6 md:px-10 md:py-8  sm:rounded-none sm:bg-center sm:bg-contain sm:bg-no-repeat sm:bg-[url('/ui/message-background.png')] sm:bg-transparent ">
              <audio ref={audioRef}>
              </audio>
              {messages.length == 0 ?
                <div className="w-full p-2 text-2xl">
                  Hi😄, I am Marina the Mermaid🧜‍♀️, how are you doing?
                </div>
                :
                <div className="w-full text-2xl">
                  {messages[messages.length - 1].role == 'assistant' ?
                    messages[messages.length - 1].content
                    :
                    <p className='text-center inline text-muted-foreground'>
                      Marina is speaking...
                    </p>
                  }
                </div>
              }
            </div>
          </div>

        </div>
        <div className='relative flex justify-center'>
          <Avatar className={`w-[300px] h-[300px] ${isPlaying == true ? 'animate-custom-bounce' : ''}`}>
            <AvatarImage src="Mermaid Marina.png" alt="Marina" />

          </Avatar>
        </div>
        <div className='fixed inset-x-0 bottom-10 w-full flex flex-col gap-4 items-center max-lg:landscape:bottom-8 z-10'>
          {isVoiceInput ?

            <form onSubmit={handleSubmit}>
              <div className='w-full flex flex-col-reverse gap-4'>

                <input className='sr-only' value={recognitionText} type="hidden" />
                <div className='relative w-full flex flex-row justify-center items-end gap-6'>
                  <div className='px-4'>
                    <Button ref={submitButtonRef} type="submit" className='sr-only'>
                      提交
                    </Button>
                  </div>

                  <div className='flex flex-row gap-4 items-end'>
                    <Button
                      type='button'
                      size={'icon'}
                      className={`h-fit p-4 bg-[#2196F3] w-fit rounded-full shadow-[0.25rem_0.25rem_0_#1E6AA7] ${loading == true ? 'animate-pulse' : ''}`}
                      onClick={handleSpeechToText}
                      disabled={loading}
                    >
                      <Mic width="60" height="60" />
                    </Button>
                    <Button type='button' className='rounded-full p-2 h-fit w-fit' variant="outline" onClick={() => setIsVoiceInput(false)}>
                      <Keyboard width={30} height={30} />
                    </Button>
                  </div>


                </div>
                {hint.length > 0 ?
                <div className='flex flex-col gap-4'>
                  <div className='text-xl animate-custom-bounce rounded-full bg-[#2196F3] text-white py-2 px-8 w-fit font-bold text-xl shadow-[0.25rem_0.25rem_0_#1E6AA7]e'>
                  <div className='flex flex-row items-center'>
                        <Button variant='ghost' size='icon' onClick={playHint}><PlayIcon className='w-1/2' /></Button>
                        <div className='px-2'>{hint}</div>
                      </div>
                  </div>
                  </div>
                  :
                  null
                }
                <div className=
                  {`
                 ${displayText == 'Listening...' ? 'animate-bounce text-3xl' : 'text-2xl'} 
                 ${loading == true ? '' : ''}
                w-full text-center text-white`
                  } style={{ textShadow: '2px 2px 2px #333' }}>
                  {displayText}
                </div>

              </div>
            </form>

            :
            <form onSubmit={handleSubmit}>
              <div className='flex flex-row gap-4 justify-between max-w-md'>
                <div className='relative w-full flex flex-row gap-2'>
                  <Button type='button' variant="outline" size="icon" onClick={() => setIsVoiceInput(true)}>
                    <Mic />
                  </Button>

                  <Input
                    className="flex-1 w-full bg-background"
                    value={input}
                    onChange={handleInputChange}
                  />
                  <div className='absolute right-2 bottom-0'>
                    <Button variant='link' size='icon' type="submit"><SendIcon /></Button>
                  </div>
                </div>
              </div>
            </form>
          }
        </div>
      </CardHeader>
      <AlertDialog>
        <AlertDialogTrigger ref={reportTriggerRef} className='sr-only'>.</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-center text-3xl flex justify-center'><div className='w-fit bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full px-8 py-2 text-white'>PERFECT!</div></AlertDialogTitle>
            <AlertDialogDescription>
              <div className='flex justify-center py-2'>
                <img src='/report-bravo.gif' className='w-1/5'></img>
              </div>
              <div className='text-center text-xl'>
                You did it!
              </div>
              <div className='grid grid-cols-2 text-center gap-4 py-6'>
                <div className='flex flex-col'>
                  <div>
                    Fluency
                  </div>
                  <div className=' text-[#FF8B01] text-5xl'>
                    {(100 * (Math.pow(totalFluencyScore / dialogLength / 100, 1))).toFixed(1)}
                  </div>
                </div>
                <div className='flex flex-col'>
                  <div>
                    Accuracy
                  </div>
                  <div className='text-[#019FFF] text-5xl'> 
                    {(100 * (Math.pow(totalAccuracyScore / dialogLength / 100, 1))).toFixed(1)}
                  </div>
                </div>
                <div className='flex flex-col'>
                  <div>
                    Round
                  </div>
                  <div className='text-[#3DB94A] text-5xl'>
                    {messages.length}<p className='inline text-sm'></p>
                  </div>
                </div>
                <div className='flex flex-col'>
                  <div>
                    Time
                  </div>
                  <div className='text-[#FF3C21] text-5xl'>
                    <p className='inline'>&nbsp;&nbsp;</p>{Math.round((stayTime/60000))}<p className='inline text-sm'>min</p>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>

            <Link href='/'>
              <AlertDialogAction>Finish</AlertDialogAction>
            </Link>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}