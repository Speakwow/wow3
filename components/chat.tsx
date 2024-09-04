
'use client';

import { Message, useChat } from 'ai/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Keyboard, Mic, MoreVerticalIcon, PlayIcon, SendIcon, SkipForwardIcon } from 'lucide-react';
import { Avatar, AvatarImage, } from "@/components/ui/avatar"
import { synthesizeSpeechWithVoice } from '@/lib/speech/tts';
import { Howl, Howler } from 'howler';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { updateScenarioRecord } from '@/lib/action/mongoIO';
import { useRouter } from 'next/navigation';
import * as speechsdk from "microsoft-cognitiveservices-speech-sdk"
import Image from 'next/image'
import AzureConfig from "@/lib/speech/config";
import _ from "lodash";
import { Score2Grade } from "@/lib/tools"
import { useUnmount } from 'usehooks-ts';
import { ToastAction } from './ui/toast';
import { useToast } from './ui/use-toast';
import { error } from 'console';



let totalFluencyScore = 0
let totalAccuracyScore = 0
let totalPronScore = 0
let dialogLength = 0
let stayTime = 0;



export default function Chat(params: { chatid: string, scenarioId: string, characterId: string, scenario: any, character: any }) {
  const [sound, setSound] = useState<Howl | null>(null);
  var asrOff = new Howl({
    src: ['/sound/asr-off.wav'],
    format: ['wav'],
    autoplay: false,

  });




  //Handle Playing Audio
  function handleAudioPlay(audioData: ArrayBuffer) {
    const audioBlob = new Blob([audioData], { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(audioBlob);
    const newSound = new Howl({
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
    setSound(newSound);
    newSound.play();
  }
  // Cache Current Message
  const [currentMessage, setCurrentMessage] = useState('')


  const { toast } = useToast()

  function HowlerSuspend() {
      try {
          setSound(null)
          Howler.ctx?.suspend();
      } catch (e) {
          console.log('HowlerSuspend error', e);
      }
  }
  function HowlerResume() {
      try {
          setSound(null)
          Howler.ctx?.resume();
      } catch (e) {
          console.log('HowlerResume error', e);
      }
  }

  function getPlatform() {
      if (/iPhone|iPad/i.test(navigator.userAgent)) {
          return ('ios')
      }
      else if (/Mobi|Android/i.test(navigator.userAgent)) {
          return ('android')
      }
      else {
          console.log('pc')
          return ('pc')
      }
  }

  /// 监听页面可见性变化事件
  document.addEventListener('visibilitychange', function () {
      if (getPlatform() === 'ios' && document.visibilityState === 'visible') {
          toast({
              title: "请重新开始练习",
              description: "练习中途不要退出开小差喔！",
              action: <ToastAction autoFocus altText="刷新" onClick={()=>window.location.reload()}>刷新</ToastAction>,
          })
          HowlerSuspend()
      } else if (getPlatform() === 'ios' && document.visibilityState === 'hidden') {
          sound?.stop()
          setLoading(false)
          setIsPlaying(false);
          setDisplayText('Try agian')
      }
  });

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
      setCurrentMessage(messages.content)
      console.log("Get:", currentMessage)
      synthesizeSpeechWithVoice(messages.content, params.character.voice_id, audioData => {
        if (audioData) {
          handleAudioPlay(audioData)
        } else {
          setLoading(false)
          setDisplayText('too busy, try agian')
          console.error('Speech synthesis failed or returned no audio');
        }
      })
    },
    onError(error){
      console.error('AI Not Response',error);
      setLoading(false)
      setDisplayText('too busy, try agian')
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
        setLoading(false)
        setDisplayText('try agian')
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

  const azureSpeechConfig = useMemo(() => {
    // const speechConfig = speechsdk.SpeechConfig.fromSubscription('8d0f1ad8db3a41bf91ba8a1e9b44a621', 'westus')
    const speechConfig = speechsdk.SpeechConfig.fromSubscription(AzureConfig.key, AzureConfig.region);
    speechConfig.speechRecognitionLanguage = 'en-US'
    // speechConfig.setProperty('SpeechServiceConnection_InitialSilenceTimeoutMs', "12201")
    // speechConfig.setProperty('SpeechServiceConnection_EndSilenceTimeoutMs', '3201')

    return { speechConfig }
  }, [])

  const listeningRef = useRef(false)
  const [listening, setListening] = useState(false)
  const sttRef = useRef<speechsdk.SpeechRecognizer>()
  const evalRef = useRef<speechsdk.SpeechRecognizer>()
  const audioConfigRef = useRef<speechsdk.AudioConfig>()
  const mediaStreamRef = useRef<MediaStream>()

  useUnmount(() => {
    try {
      listeningRef.current = false
      setListening(false)
      if (sttRef.current) sttRef.current.close()
    } catch { }
  })


  //Handle Asr with Eval
  const handleSpeechToText = useCallback(() => {
    setDisplayText('...');
    setLoading(true)
    setRecognitionText('');
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream: MediaStream) => {
        
        mediaStreamRef.current = stream
        const speechConfig = speechsdk.SpeechConfig.fromSubscription(AzureConfig.key, AzureConfig.region);
        const audioConfig = speechsdk.AudioConfig.fromStreamInput(stream)
        audioConfigRef.current = audioConfig
        sttRef.current = new speechsdk.SpeechRecognizer(speechConfig, audioConfig)
        evalRef.current = new speechsdk.SpeechRecognizer(speechConfig, audioConfig)
        const pronunciationAssessmentConfig = new speechsdk.PronunciationAssessmentConfig(
          "",
          speechsdk.PronunciationAssessmentGradingSystem.HundredMark,
          speechsdk.PronunciationAssessmentGranularity.Phoneme,
          false
        );
        pronunciationAssessmentConfig.applyTo(evalRef.current);
        setDisplayText('Listening...');
        sttRef.current.recognizeOnceAsync(result => {
          switch (result.reason) {
            case speechsdk.ResultReason.RecognizedSpeech:
              console.log(`RECOGNIZED: Text=${result.text}`);
              setDisplayText(result.text);
              setRecognitionText(result.text);
              asrOff.play()
              break;
            case speechsdk.ResultReason.NoMatch:
              console.log("NOMATCH: Speech could not be recognized.");
              setDisplayText('Not Hearing...');

              setHintTrigger(true)

              setLoading(false)
              break;
            case speechsdk.ResultReason.Canceled:
              const cancellation = speechsdk.CancellationDetails.fromResult(result);
              console.log(`CANCELED: Reason=${cancellation.reason}`);
              setDisplayText('Try agian');
              setLoading(false)
              if (cancellation.reason == speechsdk.CancellationReason.Error) {
                console.log(`CANCELED: ErrorCode=${cancellation.ErrorCode}`);
                console.log(`CANCELED: ErrorDetails=${cancellation.errorDetails}`);
                console.log("CANCELED: Did you set the speech resource key and region values?");
              }
              break;
          }

          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
          }
          if (audioConfigRef.current) {
            sttRef.current = undefined;
          }
        })

        evalRef.current.recognizeOnceAsync(result => {
          var pronunciation_result = speechsdk.PronunciationAssessmentResult.fromResult(result);
          var evalResult = {
            text: result.text,
            pronunciation: pronunciation_result.pronunciationScore,
            accuracy: pronunciation_result.accuracyScore,
            fluency: pronunciation_result.fluencyScore,
            length: pronunciation_result.detailResult.Words.length,
          }
          dialogLength = dialogLength + evalResult.length;
          totalAccuracyScore = totalAccuracyScore + evalResult.accuracy * evalResult.length;
          totalFluencyScore = totalFluencyScore + evalResult.fluency * evalResult.length;
          totalPronScore = totalPronScore + evalResult.pronunciation * evalResult.length;
          console.log('words num:', dialogLength)
          console.log('Accuracy:', totalAccuracyScore / dialogLength)
          console.log('Fluency:', totalFluencyScore / dialogLength)
          console.log(evalResult)
        }
        )
      }).catch(error=>{
        setLoading(false)
        setDisplayText('load failed, try again')
      })


  }, [azureSpeechConfig])

  const [hintTrigger, setHintTrigger] = useState(false)

  useEffect(() => {
    if (hintTrigger == true) {
      console.log(currentMessage)
      handleHint()
      setHintTrigger(false)
    }

  }, [hintTrigger]);



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
    synthesizeSpeechWithVoice(hint, params.character.voice_id, audioData => {
      if (audioData) {
        const audioBlob = new Blob([audioData], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const newSound = new Howl({
          src: [audioUrl],
          format: ['wav'],
          autoplay: true,
        });
        setSound(newSound)
        newSound.play();
      } else {
        console.error('Speech synthesis failed or returned no audio');
      }
    })
  }


  const reportTriggerRef = useRef<HTMLButtonElement>(null);
  const [recordSaved, setRecordSaved] = useState(false)
  //handle Report
  function handleReport() {
    const lowerCaseMessage = currentMessage.toLowerCase()
    console.log(totalAccuracyScore / dialogLength)
    const keywords = ['goodbye', 'bye', 'see you', 'bye-bye', 'good bye', 'see-you'];
    if (keywords.some(keyword => lowerCaseMessage.includes(keyword)) || messages.length > 36) {
      if (reportTriggerRef.current) {
        stayTime = Date.now() - startTime
        const reportResult = {
          score: Math.round(totalPronScore / dialogLength),
          accuracy: Math.round(totalAccuracyScore / dialogLength),
          fluency: Math.round(totalFluencyScore / dialogLength),
          duration: Math.round((stayTime / 1000)),
          round: messages.length,
        }
        console.log(reportResult)
        updateScenarioRecord(params.chatid, reportResult).then(() => setRecordSaved(true))
        reportTriggerRef.current.click();

      }
      return false
    }
    else {
      return true
    }
  }
  //handle Report
  function handleEnd() {
    if (reportTriggerRef.current) {
      stayTime = Date.now() - startTime
      const reportResult = {
        score: Math.round(totalPronScore / dialogLength),
        accuracy: Math.round(totalAccuracyScore / dialogLength),
        fluency: Math.round(totalFluencyScore / dialogLength),
        duration: Math.round((stayTime / 1000)),
        round: messages.length,
      }
      console.log(reportResult)
      updateScenarioRecord(params.chatid, reportResult).then(() => setRecordSaved(true))
      reportTriggerRef.current.click();
    }
  }

  // Cleanup on component unmount or page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sound) {
        sound.stop();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (sound) {
        sound.stop();
      }
    };
  }, [sound]);

  return (

    <div className='relative h-full bg-transparent rounded-10 min-w-full'>

      <div className='h-full w-full relative'>
        <div className='flex justify-center'>
          <div className='mt-20 p-2'>
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
        <div className='relative flex justify-center mb-2  p-4'>
          <Avatar className={`w-[200px] h-[200px] ${isPlaying == true ? 'animate-custom-bounce' : ''}`}>
            <AvatarImage src={params.character.avatar} alt={params.character.name} />
          </Avatar>
        </div>
        <div className='absolute inset-x-0  w-full flex flex-col gap-4 items-center bottom-4 landscape:bottom-4 z-10'>
          {isVoiceInput ?
            <form onSubmit={handleSubmit}>
              <div className='w-full flex flex-col-reverse gap-4'>
                <input className='sr-only' value={recognitionText} type="hidden" />
                <div className='relative w-full flex flex-row justify-center items-end gap-6'>
                  <div className='px-4 sr-only'>
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
                      <Mic width="60" height="60" />
                    </Button>
                    <Button type='button' className='sr-only rounded-full p-2 h-fit w-fit' variant="outline" onClick={() => setIsVoiceInput(false)}>
                      <Keyboard width={30} height={30} />
                    </Button>
                  </div>
                </div>
                {hint.length > 0 ?
                  <div className='flex flex-col gap-4'>
                    <div className='text-xl w-full text-center animate-custom-bounce rounded-full bg-[#42C83C] text-white py-1 px-4 w-fit font-bold '>
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
      </div>
      <AlertDialog>
        <AlertDialogTrigger ref={reportTriggerRef} className='sr-only'>.</AlertDialogTrigger>
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
                  {Score2Grade(100 * (Math.pow(totalPronScore / dialogLength / 100, 1)))}
                </div>
              </div>
              <div className='grid grid-cols-2 text-center gap-4 py-6'>
                <div className='flex flex-col'>
                  <div>
                    Fluency
                  </div>
                  <div className=' text-[#FF8B01] text-5xl'>
                    {Score2Grade((100 * (Math.pow(totalFluencyScore / dialogLength / 100, 1))))}
                  </div>
                </div>
                <div className='flex flex-col'>
                  <div>
                    Accuracy
                  </div>
                  <div className='text-[#019FFF] text-5xl'>
                    {Score2Grade(100 * (Math.pow(totalAccuracyScore / dialogLength / 100, 1)))}
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
          <AlertDialogFooter className='items-center'>
            {
              recordSaved == false ?
                <Button
                  className='animated-pulse w-full  p-6'
                  disabled={true}
                >
                  正在保存...
                </Button>
                :
                <AlertDialogAction className='w-full bg-[#42C83C] p-6' onClick={() => router.push('/')}>
                  完成练习
                </AlertDialogAction>
            }
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className='absolute right-2 top-2'>
        <AlertDialog>
          <AlertDialogTrigger >
            <Button size="icon" variant="destructive">
              <SkipForwardIcon />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className='text-center'>是否立即结束练习？</AlertDialogTitle>

            </AlertDialogHeader>
            <AlertDialogFooter className='flex flex-row justify-between'>
              <AlertDialogAction onClick={handleEnd}>
                立即结束
              </AlertDialogAction>
              <AlertDialogCancel>
                继续练习
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}