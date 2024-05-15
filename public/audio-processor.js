// audio-processor.js
class AudioRecorderWorkletProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.samples = [];
        // 监听来自主线程的消息
        this.port.onmessage = (event) => {
            // 检查接收到的消息是否为请求样本数据的消息
            if (event.data === 'getSamples') {
                console.log('Sending samples:', this.samples);
                // 如果是，发送收集的样本回主线程
                this.port.postMessage({ samples: this.samples});
            }
        };
    }
    process(inputs) {
        const input = inputs[0];
        input.forEach(channel => {
            // Copy samples from the channel into the samples array
            this.samples.push(...channel);
        });
        return true;
    }

}
registerProcessor('audio-recorder', AudioRecorderWorkletProcessor);