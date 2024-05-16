import * as sdk from "microsoft-cognitiveservices-speech-sdk"

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
    const speechConfig = sdk.SpeechConfig.fromSubscription("5c24cca5b354414eb1c58a92d9830f06", "northcentralus");
    // @ts-ignore
    const speechSynthesizer = new sdk.SpeechSynthesizer(speechConfig,null);
    speechSynthesizer.speakSsmlAsync(
        createSSML(text, "en-GB-RyanNeural", "cheerful", "0.7"),
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
    const speechConfig = sdk.SpeechConfig.fromSubscription("5c24cca5b354414eb1c58a92d9830f06", "northcentralus");
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