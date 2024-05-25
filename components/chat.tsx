
'use client';

import { Message, useChat } from 'ai/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import React, { useState, useEffect, useRef } from 'react';
import { Keyboard, Mic, PlayIcon, SendIcon } from 'lucide-react';
import { Avatar, AvatarImage, } from "@/components/ui/avatar"
import { synthesizeSpeech, synthesizeSpeechWithVoice } from '@/lib/speech/tts';
import { sttFromMic } from '@/lib/speech/asr';
import { Howl } from 'howler';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { webm2Wav } from '@/lib/speech/wav';
import { EvalResult, evalSpeechFromFile } from '@/lib/speech/eval';
import Link from 'next/link';
import { updateScenarioRecord } from '@/lib/action/mongoIO';
import { useRouter } from 'next/navigation';


let totalFluencyScore = 0
let totalAccuracyScore = 0
let totalPronScore = 0
let dialogLength = 0
let stayTime = 0;

export default function Chat(params: { chatid: string, scenarioId: string, characterId: string, scenario: any, character: any }) {

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
        if (isVoiceInput && continueSession) {
          handleSpeechToText()
        } else {
          setLoading(false)
        }
      }
    });
    sound.play();
  }
  // Cache Current Message
  let currentMessage = ''

  // Streaming Chat I/O
  // api: '/api/learn/' + params.scenarioId +'/'+params.characterId,
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/learn/' + params.scenarioId + '/' + params.characterId,
    headers: { 'X-ChatId': params.chatid },
    body: {
      character: JSON.stringify(params.character),
      scenario: JSON.stringify(params.scenario)
    },
    onFinish(messages) {
      setHint('')
      currentMessage = messages.content
      synthesizeSpeechWithVoice(messages.content, params.character.voice_id, audioData => {
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
  const router = useRouter()
  const [startTime, setStartTime] = useState(Date.now());
  //Welcome Message TTS
  useEffect(() => {
    setStartTime(Date.now());
    synthesizeSpeechWithVoice(params.scenario.welcomeMessage, params.character.voice_id, audioData => {
      if (audioData) {
        handleAudioPlay(audioData)
      } else {
        console.error('Speech synthesis failed or returned no audio');
      }
    })
  }, []);

  //ASR to text Input
  useEffect(() => {
    const mockEvent = {
      target: { value: recognitionText }
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(mockEvent);
  }, [recognitionText]);

  //Auto-Submit while ASR success
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
  //     if (currentMessage && currentMessage.length > 0) {
  //       handleHint()
  //     }
  //     setLoading(false)
  //   }
  // };

  //Handle Asr with Eval
  const handleSpeechToText = async () => {
    var sound = new Howl({
      src: ['/sound/asr-on.wav'],
      format: ['wav'],
      autoplay: true,
    });
    sound.play();
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
        var sound = new Howl({
          src: ['/sound/asr-off.wav'],
          format: ['wav'],
          autoplay: true,
        });
        sound.play();
        // 创建 Blob 保存音频文件
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const wavBlob = await webm2Wav(audioBlob)
        // const audioUrl = URL.createObjectURL(wavBlob);
        // downloadWavFile(wavBlob, 'output.wav');
        const evalResult = await evalSpeechFromFile(text, wavBlob) as any;
        dialogLength = dialogLength + evalResult.length;
        totalAccuracyScore = totalAccuracyScore + evalResult.accuracy * evalResult.length;
        totalFluencyScore = totalFluencyScore + evalResult.fluency * evalResult.length;
        totalPronScore = totalPronScore + evalResult.pronunciation * evalResult.length;
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
    synthesizeSpeechWithVoice(hint, params.character.voice, audioData => {
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
  function handleReport() {

    const lowerCaseMessage = currentMessage.toLowerCase()
    console.log(totalAccuracyScore / dialogLength)
    if (lowerCaseMessage.includes('goodbye' || 'bye' || 'see you' || 'bye-bye')) {
      if (reportTriggerRef.current) {
        stayTime = Date.now() - startTime
        const reportResult = {
          score:Math.round(totalPronScore / dialogLength),
          accuracy:Math.round(totalAccuracyScore / dialogLength),
          fluency:Math.round(totalFluencyScore / dialogLength),
          duration:Math.round((stayTime / 1000)),
          round:messages.length,
        }
        console.log(reportResult)
        updateScenarioRecord(params.chatid,reportResult)
        reportTriggerRef.current.click();

      }
      return false
    }
    else {
      return true
    }
  }

  return (

    <div className='relative h-full bg-transparent rounded-10 min-w-full'>
      <CardHeader className='h-[24rem] w-full relative'>
        <div className=' h-full flex justify-center'>
          <div>
            <div className='relative md:top-4 top-2 flex justify-center'>
              <div className='h-fit cursor-default rounded-full bg-[#42C83C] text-white  px-8 w-fit font-bold text-xl border-4 border-white'>
                {params.character.name}
              </div>

            </div>
            <Card className="flex justify-center max-w-2xl p-4 w-full rounded-3xl">
              <audio ref={audioRef}>
              </audio>
              {messages.length == 0 ?
                <div className="w-full p-2 text-2xl">
                  {params.scenario.welcomeMessage}
                </div>
                :
                <div className="w-full text-2xl">
                  {messages[messages.length - 1].role == 'assistant' ?
                    messages[messages.length - 1].content
                    :
                    <p className='text-center inline text-muted-foreground'>
                      {params.character.name} is speaking...
                    </p>
                  }
                </div>
              }
            </Card>
          </div>

        </div>
        <div className='relative flex justify-center top-10 p-4'>
          <Avatar className={`w-[250px] h-[250px] ${isPlaying == true ? 'animate-custom-bounce' : ''}`}>
            <AvatarImage src={params.character.avatar} alt={params.character.name} />
          </Avatar>
        </div>
        <div className='fixed inset-x-0 bottom-24 w-full flex flex-col gap-4 items-center max-lg:landscape:bottom-8 z-10'>
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
                      className={`h-fit p-4 bg-[#42C83C] w-fit rounded-full border-4 ${loading == true ? 'animate-pulse' : ''}`}
                      onClick={handleSpeechToText}
                      disabled={loading}
                    >
                      <Mic width="80" height="80" />
                    </Button>
                    <Button type='button' className='rounded-full p-2 h-fit w-fit' variant="outline" onClick={() => setIsVoiceInput(false)}>
                      <Keyboard width={30} height={30} />
                    </Button>
                  </div>
                </div>
                {hint.length > 0 ?
                  <div className='flex flex-col gap-4'>
                    <div className='text-xl w-full text-center animate-custom-bounce rounded-full bg-[#42C83C] text-white py-2 px-4 w-fit font-bold text-xl'>
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
        <AlertDialogTrigger ref={reportTriggerRef}>.</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-center text-2xl'>PERFECT!</AlertDialogTitle>
            <AlertDialogDescription>
              <div className='flex justify-center'>
                <img src='/report-bravo.gif' className='w-1/5'></img>
              </div>
              <div className='text-center text-xl'>
                You did it! Final Score:
              </div>
              <div className='flex flex-col'>
                <div className='text-center text-[#42C83C] text-5xl'>
                  {(100 * (Math.pow(totalPronScore / dialogLength / 100, 1))).toFixed(1)}
                </div>
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
                    <p className='inline'>&nbsp;&nbsp;</p>{Math.round((stayTime / 60000))}<p className='inline text-sm'>min</p>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
              <AlertDialogAction onClick={()=>router.push('/')}>Finish</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}