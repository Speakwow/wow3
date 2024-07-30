import * as sdk from "microsoft-cognitiveservices-speech-sdk"
import AzureConfig from "./config";

export function createSSML(text: string, name: string, style: string, degree: string) {
    const template =
        `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
      <voice name="${name}">
        <prosody rate="-15.00%">
          <mstts:express-as style="${style}" styledegree="${degree}">
              ${text}
          </mstts:express-as>
        </prosody>
      </voice>
    </speak>
    `
    return template
}
type AudioDataCallback = (audioData: ArrayBuffer|null) => void;

export function synthesizeSpeech(text: string,onComplete:AudioDataCallback) {
    const speechConfig = sdk.SpeechConfig.fromSubscription(AzureConfig.key, AzureConfig.region);
    // @ts-ignore
    const speechSynthesizer = new sdk.SpeechSynthesizer(speechConfig,null);
    speechSynthesizer.speakSsmlAsync(
        createSSML(text, "en-US-TonyNeural", "cheerful", "0.7"),
        result => {
            if (result) {
                speechSynthesizer.close();
                // const blob = new Blob([result.audioData], { type: 'audio/wav' });
                onComplete(result.audioData);
            }
        },
        error => {
            console.log(error);
            speechSynthesizer.close();
            onComplete(null)
        });

}

export function synthesizeSpeechWithVoice(text: string,voice:string,onComplete:AudioDataCallback) {
    const speechConfig = sdk.SpeechConfig.fromSubscription(AzureConfig.key, AzureConfig.region);
    // @ts-ignore
    const speechSynthesizer = new sdk.SpeechSynthesizer(speechConfig,null);
    speechSynthesizer.speakSsmlAsync(
        createSSML(text,voice, "cheerful", "0.7"),
        result => {
            if (result) {
                speechSynthesizer.close();
                // const blob = new Blob([result.audioData], { type: 'audio/wav' });
                onComplete(result.audioData);
            }
        },
        error => {
            console.log(error);
            speechSynthesizer.close();
            onComplete(null)
        });

}