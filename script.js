import './index.js'

let audio, bufferSourceNode

// dependencies
self.worker = {
  plot () {},
  fetchSample () {}
}

const print = s => {
  right.insertBefore(document.createTextNode(s + '\n'), right.firstChild)
}

const main = async () => {
  buttonBench.onclick = () => {
    const fn = compile(codeEditor.value)

    const times = +inputBenchTimes.value
    let totalTime = 0, maxTime = 0
    n = 0
    print('------------------------------')
    for (let i = 0; i < times; i++) {
      const now = performance.now()
      const { bufferIndex, bpm } = fn()
      const renderTime = performance.now() - now
      totalTime += renderTime
      maxTime = Math.max(renderTime, maxTime)
      print('render time: ' + renderTime.toFixed(1) + ' ms')
    }
    print('- - -')
    const avg = totalTime / times
    const samplesPerSecond = n / totalTime * 1000
    print('buffer size: ' + (n/times).toLocaleString())
    print('average (mean): ' + avg.toFixed(1) + ' ms')
    print('highest: ' + maxTime.toFixed(1) + ' ms')
    print((+samplesPerSecond.toFixed(1)).toLocaleString() + ' samples/sec')
    print(times + ' iterations')
  }

  buttonPlay.onclick = () => {
    audio = audio || new AudioContext({ latencyHint: 'playback' })

    const fn = compile(codeEditor.value)

    const source = audio.createBuffer(numberOfChannels, bufferSize, sampleRate)

    const now = performance.now()
    const { bufferIndex, bpm } = fn()
    const renderTime = performance.now() - now
    print('render time: ' + renderTime.toFixed(3) + 'ms')

    // in this context is barSize for readability
    const barSize = bufferIndex
    const duration = barSize / sampleRate

    buffer.forEach((b, i) => source.getChannelData(i).set(b.subarray(0, bufferSize)))

    if (!bufferSourceNode) {
      bufferSourceNode = audio.createBufferSource()
      bufferSourceNode.buffer = source
      bufferSourceNode.connect(audio.destination)
      bufferSourceNode.loop = true
      bufferSourceNode.loopStart = 0.0
      bufferSourceNode.loopEnd = duration
      bufferSourceNode.start()
    } else {
      bufferSourceNode.loopEnd = duration
    }
  }

  buttonStop.onclick = () => {
    bufferSourceNode.stop()
    bufferSourceNode = null
  }

  buttonBench.click()
}

main()
