import * as sdk from "microsoft-cognitiveservices-speech-sdk"
import { ResultReason } from 'microsoft-cognitiveservices-speech-sdk';
import { evalSpeechFromFile } from "./eval";
import { webm2Wav } from "./wav";
import AzureConfig from "./config";

export async function sttFromMic() {
  const speechConfig = sdk.SpeechConfig.fromSubscription(AzureConfig.key, AzureConfig.region);
  speechConfig.speechRecognitionLanguage = 'en-US';
  const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
  const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

  // // 使用 MediaRecorder API 进行录音
  // const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  // const mediaRecorder = new MediaRecorder(stream);
  // let audioChunks: Blob[] = [];
  // mediaRecorder.start();
  // mediaRecorder.ondataavailable = event => {
  //   audioChunks.push(event.data);
  // };

  return new Promise((resolve, reject) => {
    recognizer.recognizeOnceAsync(result => {
      if (result.reason === ResultReason.RecognizedSpeech) {
        resolve(result.text);
        // mediaRecorder.stop();
        // mediaRecorder.onstop = async () => {
        //   // 创建 Blob 保存音频文件
        //   const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        //   const wavBlob = await webm2Wav(audioBlob)
        //   const audioUrl = URL.createObjectURL(wavBlob);
        //   // downloadWavFile(wavBlob, 'output.wav');
        //   evalSpeechFromFile(result.text,wavBlob).then(evalResult =>{
        //     resolve(evalResult)
        //   })
        //   URL.revokeObjectURL(audioUrl);
        //   audioChunks = []; // 清空数组以释放内存
        // };
        recognizer.close()
        
      } else {
        reject(new Error(result.errorDetails || 'Recognition failed'));
        recognizer.close()
      }
    });
  })
}


export async function sttFromMicWithAssess(referenceText: string) {
  const speechConfig = sdk.SpeechConfig.fromSubscription(AzureConfig.key, AzureConfig.region);
  speechConfig.speechRecognitionLanguage = 'en-US';
  const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
  const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

  const pronunciationAssessmentConfig = new sdk.PronunciationAssessmentConfig(
    referenceText,
    sdk.PronunciationAssessmentGradingSystem.HundredMark,
    sdk.PronunciationAssessmentGranularity.Phoneme,
    false
  );
  pronunciationAssessmentConfig.enableProsodyAssessment = true;
  pronunciationAssessmentConfig.applyTo(recognizer);

  return new Promise((resolve, reject) => {
    recognizer.recognizeOnceAsync(result => {
      if (result.reason === ResultReason.RecognizedSpeech) {
        var pronunciation_result = sdk.PronunciationAssessmentResult.fromResult(result);
        resolve({ text: result.text, ...pronunciation_result });
      } else {
        reject(new Error(result.errorDetails || 'Recognition failed'));
      }
    });
  })
}

