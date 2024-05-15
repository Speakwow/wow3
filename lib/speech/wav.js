import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util';

export async function webm2Wav(webmBlob){
    const ffmpeg = new FFmpeg();
    await ffmpeg.load();
    await ffmpeg.writeFile('input.webm', await fetchFile(webmBlob));
    const inputName = 'input.webm';
    const outputName = 'output.wav';
    await ffmpeg.exec(['-i', inputName, outputName]);
    const outputData = await ffmpeg.readFile(outputName);
    const outputBlob = new Blob([outputData.buffer], { type: 'audio/wav' });
    return outputBlob;
  }


export function createWavHeader(dataLength, sampleRate, numChannels, bitsPerSample) {
    const header = new ArrayBuffer(44);
    const view = new DataView(header);

    // RIFF header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(view, 8, 'WAVE');

    // fmt sub-chunk (format details)
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);  // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true);   // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * bitsPerSample / 8, true); // ByteRate
    view.setUint16(32, numChannels * bitsPerSample / 8, true); // BlockAlign
    view.setUint16(34, bitsPerSample, true);

    // data sub-chunk (actual sound data)
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);

    return header;

    function writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }
}



export function createWavBlob(samples, sampleRate) {
    const numChannels = 1;
    const bitsPerSample = 16;
    const blockAlign = numChannels * bitsPerSample / 8;
    const byteRate = sampleRate * blockAlign;
    const dataLength = samples.length * blockAlign;
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);

    // 创建头部
    const header = createWavHeader(dataLength, sampleRate, numChannels, bitsPerSample);
    new Uint8Array(buffer).set(new Uint8Array(header), 0);

    // 填充音频数据
    let offset = 44;  // 跳过头部
    for (let i = 0; i < samples.length; i++) {
        const sample = Math.max(-1, Math.min(1, samples[i])); // 确保样本在 -1.0 到 +1.0 之间
        view.setInt16(offset, sample * 32767, true); // 转换为 16-bit PCM
        offset += 2;
    }

    return new Blob([view], { type: 'audio/wav' });
}

export function downloadWavFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}