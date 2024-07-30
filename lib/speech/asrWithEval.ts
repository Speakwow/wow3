import * as sdk from "microsoft-cognitiveservices-speech-sdk"
import { ResultReason } from 'microsoft-cognitiveservices-speech-sdk';
import { evalSpeech } from "./eval";
import _ from "lodash"
import * as wav from "wav";
import { error } from "console";
import { createWavBlob, downloadWavFile } from "./wav"
import AzureConfig from './config'

export async function setupAudioWorklet(audioContext: AudioContext) {
  await audioContext.audioWorklet.addModule('/audio-processor.js').catch(error => { console.log(error) });
  const recorderNode = new AudioWorkletNode(audioContext, 'audio-recorder');
  recorderNode.connect(audioContext.destination);
  console.log("AudioWorkletNode 已创建并连接。");
}

export async function sttFromMic() {
  const speechConfig = sdk.SpeechConfig.fromSubscription(AzureConfig.key, AzureConfig.region);
  speechConfig.speechRecognitionLanguage = 'en-US';
  const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
  const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

  // 使用 Web Audio API 进行录音 与转码
  const audioContext = new AudioContext();
  await audioContext.audioWorklet.addModule('/audio-processor.js').catch(error => { console.log(error) });
  const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const sourceNode = audioContext.createMediaStreamSource(audioStream);
  const recorderNode = new AudioWorkletNode(audioContext, 'audio-recorder');

  sourceNode.connect(recorderNode);
  recorderNode.connect(audioContext.destination);


  return new Promise((resolve, reject) => {
    recognizer.recognizeOnceAsync(async result => {
      if (result.reason === ResultReason.RecognizedSpeech) {
        resolve(result.text);

        // 请求 samples 数据
        recorderNode.port.postMessage('getSamples');
        recorderNode.port.onmessage = async (event) => {
          const samples = event.data;
          console.log(samples)
          const float32Array = new Float32Array(samples);
          const wavBlob = createWavBlob(samples, 414000);
          downloadWavFile(wavBlob, 'output.wav');
          // await evalSpeech(result.text,arrayBuffer)
          // console.log('ArrayBuffer byteLength:', arrayBuffer.byteLength);
          sourceNode.disconnect();
          recorderNode.disconnect();
          await audioContext.close();
          recognizer.close()
          audioStream.getTracks().forEach(track => track.stop());
        };

      } else {
        reject(new Error(result.errorDetails || 'Recognition failed'));
        recognizer.close()
      }
    });
  })
}


