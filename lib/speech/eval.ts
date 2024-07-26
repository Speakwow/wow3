import * as sdk from "microsoft-cognitiveservices-speech-sdk"
import { ResultReason } from 'microsoft-cognitiveservices-speech-sdk';
import _ from "lodash"

export interface EvalResult {
  text:string;
  pronunciation: number;
  accuracy: number;
  fluency: number;
  completeness:number;
  prosody: number;
  length:number;
  sum:number;
}

export async function evalSpeech(referenceText: string, audioBlob: Blob) {
  return new Promise(async (resolve, reject) => {
    const speechConfig = sdk.SpeechConfig.fromSubscription("5c24cca5b354414eb1c58a92d9830f06", "northcentralus");
    speechConfig.speechRecognitionLanguage = 'en-US';
    let pushStream = sdk.AudioInputStream.createPushStream();
    const arrayBuffer = await audioBlob.arrayBuffer();
    pushStream.write(arrayBuffer);
    pushStream.close();
    var audioConfig = sdk.AudioConfig.fromStreamInput(pushStream)
    const reco = new sdk.SpeechRecognizer(speechConfig, audioConfig);
    const pronunciationAssessmentConfig = new sdk.PronunciationAssessmentConfig(
      referenceText,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Phoneme,
      false
    );
    pronunciationAssessmentConfig.enableProsodyAssessment = true;
    pronunciationAssessmentConfig.applyTo(reco);
    console.log(`Reference: `+referenceText)
    reco.recognizeOnceAsync(result => {
        console.log(`RECOGNIZED: Text=${result.text}`);
        var pronunciation_result = sdk.PronunciationAssessmentResult.fromResult(result);
        var evalResult = {
          text:result.text,
          pronunciation: pronunciation_result.pronunciationScore,
          accuracy: pronunciation_result.accuracyScore,
          fluency: pronunciation_result.fluencyScore,
          completeness: pronunciation_result.completenessScore,
          prosody: pronunciation_result.prosodyScore,
          length: pronunciation_result.detailResult.Words.length,
          topic:pronunciation_result.contentAssessmentResult,
        }     
        // console.log(" Accuracy score: ", pronunciation_result.accuracyScore, '\n',
        //   "pronunciation score: ", pronunciation_result.pronunciationScore, '\n',
        //   "completeness score : ", pronunciation_result.completenessScore, '\n',
        //   "fluency score: ", pronunciation_result.fluencyScore, '\n',
        //   "prosody score: ", pronunciation_result.prosodyScore
        // );
        // console.log("  Word-level details:");
        // _.forEach(pronunciation_result.detailResult.Words, (word, idx) => {
        //   console.log("    ", idx + 1, ": word: ", word.Word, "\taccuracy score: ", word.PronunciationAssessment?.AccuracyScore, "\terror type: ", word.PronunciationAssessment?.ErrorType, ";");
        // });
        
        resolve(evalResult);
        reco.close();
    }, err => {
      
      reject(err);  // Reject the promise if there's an error
      reco.close();
  });
  })
  
  }



  export async function evalSpeechFromFile(referenceText: string, audioBlob: Blob) {
    return new Promise(async (resolve, reject) => {
    const speechConfig = sdk.SpeechConfig.fromSubscription("5c24cca5b354414eb1c58a92d9830f06", "northcentralus");
    speechConfig.speechRecognitionLanguage = 'en-US';
    const audioFile = new File([audioBlob], "input.wav", { type: "audio/wav" });
    var audioConfig = sdk.AudioConfig.fromWavFileInput(audioFile)
    const reco = new sdk.SpeechRecognizer(speechConfig, audioConfig);
    const pronunciationAssessmentConfig = new sdk.PronunciationAssessmentConfig(
      referenceText,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Phoneme,
      false
    );
    pronunciationAssessmentConfig.enableProsodyAssessment = true;
    pronunciationAssessmentConfig.applyTo(reco);
    console.log(`Reference: `+referenceText)
    reco.recognizeOnceAsync(result => {
        console.log(`RECOGNIZED: Text=${result.text}`);
        var pronunciation_result = sdk.PronunciationAssessmentResult.fromResult(result);
        console.log(pronunciation_result)
        var evalResult = {
          text:result.text,
          pronunciation: pronunciation_result.pronunciationScore,
          accuracy: pronunciation_result.accuracyScore,
          fluency: pronunciation_result.fluencyScore,
          completeness: pronunciation_result.completenessScore,
          prosody: pronunciation_result.prosodyScore,
          length: pronunciation_result.detailResult.Words.length,
        }             
        resolve(evalResult);
        reco.close();
      }, err => {
      
          reject(err);  // Reject the promise if there's an error
          reco.close();
    });
    })
  }




  export async function evalSpeechWithTopicFromFile(topic: string, audioBlob: Blob) {
    return new Promise(async (resolve, reject) => {
    const speechConfig = sdk.SpeechConfig.fromSubscription("e0a6ee26db64464b970d108a12022c79", "eastasia");
    speechConfig.speechRecognitionLanguage = 'en-US';
    const audioFile = new File([audioBlob], "input.wav", { type: "audio/wav" });
    var audioConfig = sdk.AudioConfig.fromWavFileInput(audioFile)
    const reco = new sdk.SpeechRecognizer(speechConfig, audioConfig);
    const pronunciationAssessmentConfig = new sdk.PronunciationAssessmentConfig(
      "",
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Phoneme,
      false
    );
    // pronunciationAssessmentConfig.enableContentAssessmentWithTopic(topic);
    pronunciationAssessmentConfig.applyTo(reco);
    // console.log(`Topic: `+topic)
    reco.recognizeOnceAsync(result => {
        console.log(`RECOGNIZED: Text=${result.text}`);
        var pronunciation_result = sdk.PronunciationAssessmentResult.fromResult(result);
    
        var evalResult = {
          text:result.text,
          pronunciation: pronunciation_result.pronunciationScore,
          accuracy: pronunciation_result.accuracyScore,
          fluency: pronunciation_result.fluencyScore,
          completeness: pronunciation_result.completenessScore,
          length: pronunciation_result.detailResult.Words.length,
        }             
        console.log(pronunciation_result)
        resolve(evalResult);
        reco.close();
      }, err => {
      
          reject(err);  // Reject the promise if there's an error
          reco.close();
    });
    })
  }