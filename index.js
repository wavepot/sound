import { toFinite, parseFn, parsePattern } from './util.js'
import Sound from './sound.js'
import Delay from './delay.js'
import Daverb from './daverb.js'

// Number prototype extensions
Number.prototype.toFinite = function () {
  return Number.isFinite(this) ? this : 0
}

Number.prototype.clamp = function (min, max) {
  return Math.min(max, Math.max(min, this))
}

// utils
self.toFinite = toFinite

// constants
self.pi2 = Math.PI * 2

// audio
self.bufferSize = 2**19
self.sampleRate = 44100
self.buffer = [1,2].map(() => new Float32Array(self.bufferSize))
self.numberOfChannels = 2

// clock
self.real_n = 0 // this doesn't adjust by bpm
self.n = 0 // this adjusts by bpm
self.i = 0 // current buffer iteration point
self.s = 0 // playing seconds (real, based on real_n)
self.t = 0 // playing time (sync based on bpm, 1 equals 1 beat time)
self._bpm = 120 // starting at 120bpm
self.br = 22050 // for 120bpm
self.bar = self.br * 4
self._sync = self.sampleRate / self.br
self._loop = 0

self.main = new Sound()

self._fn_cache = {}
self._fn_map = []
self.parseFn = parseFn

// blocks
self._block_i = 0

// sounds
self.sounds_i = 0
self.sounds = Array.from(Array(100), () => (new Sound()))

// biquads
self._biquads_i = 0
self._biquads = Array.from(Array(200),()=>({y1:0,y2:0,x1:0,x2:0}))

// delays
self._delays_i = 0
self._delays = Array.from(Array(100),()=>(new Delay(44100)))

// daverbs
self._daverbs_i = 0
self._daverbs = Array.from(Array(100),()=>(new Daverb(44100)))

// samples
self.zeroSample = [new Float32Array([0]),new Float32Array([0])]
self.samples = {}

// patterns cache map
self.patterns = {}

// top level entry api
self.api = {
  bpm (x, measure=1) {
    if (x !== _bpm) {
      _bpm = x.clamp(1, 1000)
      let co = (60 * measure) / _bpm
      br = (sampleRate * co)|0
      bar = br * 4

      // used in sync() ops
      _sync = sampleRate / br

      // adjust n position for new bpm
      // only at the beginning of the loop
      if (i === 0) {
        n = Math.round(t) * br
      }
    }
    t = n / br

    let _s = sounds[sounds_i++]

    _s.t = t
    _s.p = n
    _s._wavetables_i = 0

    return _s
  },

  loop (beat) {
    if (i === 0) {
      n = (beat + 1) * br
      t = n / br
    }
  },

  sync (x=1) {
    return (1/x) * _sync
  },

  // oh no why is code repeating like that
  // because it's optimized better at compile time

  grp () {
    let _s = sounds[sounds_i++]

    _s.t = t
    _s.p = n
    _s._wavetables_i = 0

    return _s.grp()
  },

  end () {
    let _s = sounds[sounds_i++]

    _s.t = t
    _s.p = n
    _s._wavetables_i = 0

    return _s.end()
  },

  val (x) {
    let _s = sounds[sounds_i++]

    _s.t = t
    _s.p = n
    _s._wavetables_i = 0

    return _s.val(x)
  },

  vol (x) {
    let _s = sounds[sounds_i++]

    _s.t = t
    _s.p = n
    _s._wavetables_i = 0

    return _s.vol(x)
  },

  mod (x,a0) {
    let _s = sounds[sounds_i++]

    _s.t = t
    _s.p = n
    _s._wavetables_i = 0

    return _s.mod(x,a0)
  },

  exp (x) {
    let _s = sounds[sounds_i++]

    _s.t = t
    _s.p = n
    _s._wavetables_i = 0

    return _s.exp(x)
  },

  abs (x) {
    let _s = sounds[sounds_i++]

    _s.t = t
    _s.p = n
    _s._wavetables_i = 0

    return _s.abs(x)
  },

  tanh (x) {
    let _s = sounds[sounds_i++]

    _s.t = t
    _s.p = n
    _s._wavetables_i = 0

    return _s.tanh(x)
  },

  atan (x) {
    let _s = sounds[sounds_i++]

    _s.t = t
    _s.p = n
    _s._wavetables_i = 0

    return _s.atan(x)
  },

  soft (x) {
    let _s = sounds[sounds_i++]

    _s.t = t
    _s.p = n
    _s._wavetables_i = 0

    return _s.soft(x)
  },

  on (x,a0,a1) {
    let _s = sounds[sounds_i++]

    _s.t = t
    _s.p = n
    _s._wavetables_i = 0

    return _s.on(x,a0,a1)
  },

  play (x,a0,a1,a2) {
    let _s = sounds[sounds_i++]

    _s.t = t
    _s.p = n
    _s._wavetables_i = 0

    return _s.play(x,a0,a1,a2)
  },

  sin (x) {
    let _s = sounds[sounds_i++]

    _s.t = t
    _s.p = n
    _s._wavetables_i = 0

    return _s.sin(x)
  },

  cos (x) {
    let _s = sounds[sounds_i++]

    _s.t = t
    _s.p = n
    _s._wavetables_i = 0

    return _s.cos(x)
  },

  tri (x) {
    let _s = sounds[sounds_i++]

    _s.t = t
    _s.p = n
    _s._wavetables_i = 0

    return _s.tri(x)
  },

  saw (x) {
    let _s = sounds[sounds_i++]

    _s.t = t
    _s.p = n
    _s._wavetables_i = 0

    return _s.saw(x)
  },

  ramp (x) {
    let _s = sounds[sounds_i++]

    _s.t = t
    _s.p = n
    _s._wavetables_i = 0

    return _s.ramp(x)
  },

  sqr (x) {
    let _s = sounds[sounds_i++]

    _s.t = t
    _s.p = n
    _s._wavetables_i = 0

    return _s.sqr(x)
  },

  pulse (x) {
    let _s = sounds[sounds_i++]

    _s.t = t
    _s.p = n
    _s._wavetables_i = 0

    return _s.pulse(x)
  },

  noise (x) {
    let _s = sounds[sounds_i++]

    _s.t = t
    _s.p = n
    _s._wavetables_i = 0

    return _s.noise(x)
  },
}
// const METHODS = ['mod','val','on','grp','play',
//   'sin','cos','tri','saw','ramp','sqr','pulse','noise']

// METHODS.forEach(method => {
//   const { args, argNames } = parseFn(Sound.prototype[method])
//   self.api[method] = new Function(...args,
//     `
//     let _s = sounds[sounds_i++]

//     _s.t = t
//     _s.p = n
//     _s._wavetables_i = 0

//     return _s.${method}(${argNames})
//     `
//   )
// })

function noop () {}

self.compile = (code) => {
  let fns = code.split('\n\n')

  _fn_map = []

  let src = `

${fns.map((s,i) => {
  s = s.trim()
  if (s in _fn_cache) {
    _fn_map[i] = _fn_cache[s]
  } else {
    _fn_map[i] = noop
    return `
function _fn${i} () {
${s}
}
_fn_cache[parseFn(_fn${i}).inner.trim()] = _fn${i}
_fn_map[${i}] = _fn${i}
`
  }
}).join('\n\n')}
`

  if (!src.trim().length) return self.mainFn

  src = `
function lfo (x=1,osc=sin) {
  return osc(sync(x))
}
` + src

  console.log(src)

  let func = new Function(
    Object.keys(self.api),
    src
  ).bind(null, ...Object.values(self.api))
  func()

  return self.mainFn
}

self.mainFn = new Function(`
console.log('n is:', n)
for (i = 0; i < bufferSize; i++) {
  // make sure we have enough buffer to escape glitches
  // and that it divides to bars so it's rhythmic if it does
  if (i > 50000 && ((i % bar) === 0)) {
    break
  }

  n++
  real_n++
  s = real_n / sampleRate

  _fn_map.forEach(function (fn) {
    fn()

    // space out effects so they don't interfere
    // much when commenting out sounds
    // TODO: this is awful, use better heuristics
    _biquads_i += 5
    _daverbs_i += 5
    _delays_i += 5
  })

  buffer[0][i] = main.Lx0.toFinite()
  buffer[1][i] = main.Rx0.toFinite()
  sounds_i =
  _biquads_i =
  _daverbs_i =
  _delays_i =
  main.Lx0 = main.Rx0 = 0
}

return { bufferIndex: i, bpm: _bpm }
`)
