import { parseFn, parsePattern, stringToNote } from './util.js'
import Shared32Array from './shared32array.js'
import Biquad from './biquad.js'
import Oscs from './osc.js'

self.Biquad = Biquad

const PRIVATE_API = ['constructor','valueOf','_reset']
const getMethods = (obj) => {
  return Object.getOwnPropertyNames(obj)
    .filter(m => !PRIVATE_API.includes(m))
}

class Sound {
  constructor () {
    this.Lx0 = 0
    this.Rx0 = 0
    this.t = 0
    this.p = 0
    this._wavetables_i = 0
    this._wavetables = new Array(100).fill(0)
    this._widen_buffer = new Array(256)
    this._plot_buffer = new Shared32Array(2048)

    const returnThis = () => this
    this._ignoreNext =
      Object.fromEntries(
        getMethods(Sound.prototype)
          .map(m => [m, returnThis]))

    const returnIgnoreGrp = () => this._ignoreGrp
    this._ignoreGrp =
      Object.fromEntries(
        getMethods(Sound.prototype)
          .map(m => [m, returnIgnoreGrp]))
    this._ignoreGrp.end = returnThis
    this._ignoreNext.grp = () => this._ignoreGrp
  }

  _reset () {
    this.t = t
    this.p = n
    this._wavetables_i = 0
    return this
  }

  grp () {
    return this
  }

  end () {
    return this
  }

  val (x=0) {
    this.Lx0 = this.Rx0 = (+x).toFinite()
    return this
  }

  vol (x=1) {
    this.Lx0 *= x
    this.Rx0 *= x
    return this
  }

  mod (x=1,offset=0) {
    x = x * 4
    this.t %= x
    this.p = (n % (br * x))|0
    if (this.p === 0) {
      this._wavetables.fill(offset*_wavetable_len)
    }
    return this
  }

  exp (x=1) {
    let exp = Math.exp(-this.t * x)
    this.Lx0 *= exp
    this.Rx0 *= exp
    return this
  }

  abs () {
    this.Lx0 = Math.abs(this.Lx0)
    this.Rx0 = Math.abs(this.Rx0)
    return this
  }

  tanh (x=1) {
    this.Lx0 = Math.tanh(this.Lx0 * x)
    this.Rx0 = Math.tanh(this.Rx0 * x)
    return this
  }

  atan (x=1) {
    this.Lx0 = (2 / Math.PI)*Math.atan((Math.PI / 2) * this.Lx0 * x)
    this.Rx0 = (2 / Math.PI)*Math.atan((Math.PI / 2) * this.Rx0 * x)
    return this
  }

  soft (x=1) {
    x = 1/x
    this.Lx0 = this.Lx0 / (x + Math.abs(this.Lx0))
    this.Rx0 = this.Rx0 / (x + Math.abs(this.Rx0))
    return this
  }

  on (x=1, measure=1/4, count=x) {
    return (t/(measure*4)|0)%count === x-1
      ? this
      : this._ignoreNext
  }

  // TODO: improve this
  play (x,offset=0,speed=1,mod) {
    let N = mod ?? x[0].length
    let p = (( ( (this.p+offset)*speed) % N + N) % N)|0
    this.Lx0 = (x[0][p] ?? 0) * .5
    this.Rx0 = ((x[1] ?? x[0])[p] ?? 0) * .5
    return this
  }

  widen (x=.5) {
    this._widen_buffer[n & 255] = this.Rx0
    this.Rx0 = this._widen_buffer[(n+((1-x)*256)) & 255]
    return this
  }

  delay (measure=1/16,feedback=.5,amt=.5) {
    let Ld = _delays[_delays_i++]
    let Rd = _delays[_delays_i++]
    let x = (bar*measure)|0
    this.Lx0 = Ld.delay(x).feedback(feedback).run(this.Lx0, amt)
    this.Rx0 = Rd.delay(x).feedback(feedback).run(this.Rx0, amt)
    return this
  }

  daverb (x=1,seed=-1) {
    let d = _daverbs[_daverbs_i++]
    d.seedParameters(seed).process(this, x)
    return this
  }

  pan (x=0) { // -1..+1  0=center
    this.Lx0 *= Math.min(1, (2-(1 + 1*x)))
    this.Rx0 *= Math.min(1,    (1 + 1*x))
    return this
  }

  out (x=1) {
    main.Lx0 += this.Lx0 * x //* x * (2-(1 + 1*LR))
    main.Rx0 += this.Rx0 * x //* x *    (1 + 1*LR)
    return this
  }

  plot (x=1) {
    if (i === 0) {
      this._plot_buffer.fill(0)
    }
    let co = bar / (2048*x)
    if (i === bar - 1) {
      worker.plot(this._plot_buffer, (1/x))
      return this
    }
    if ((i % co)|0 === 0) {
      this._plot_buffer[(i/co)|0] = this.Lx0
    }
    return this
  }

  valueOf () {
    return this.Lx0
  }
}

// aliases
Sound.prototype.mul = Sound.prototype.vol

Object.keys(Biquad).forEach(m => {
  const { args, inner } = parseFn(Biquad[m])

  const body = `
    x0 = this.Lx0
    ${inner.replace('return', 'this.Lx0 =')}
    x0 = this.Rx0
    ${inner.split('\n\n')[0]}
    ${inner.replace('return', 'this.Rx0 =').split('\n\n').slice(-2).join('\n\n')}
    return this
  `

  Sound.prototype[m] = new Function(...args.slice(1), body)
})

self._wavetable = {}
self._wavetable_len = 44100

Object.keys(Oscs).forEach(osc => {
  const table =
  _wavetable[osc] =
  _wavetable[osc] = new Float32Array(_wavetable_len)
  for (let i = 0, t = 0; i < _wavetable_len; i++) {
    t = i / _wavetable_len
    if (osc === 'noise') {
      table[i] = Oscs[osc].call(i, 1)
    } else {
      table[i] = Oscs[osc].call(t, 1)
    }
  }

  Sound.prototype[osc] = new Function('x=1', `
    let index = this._wavetables[this._wavetables_i]
    this._wavetables[this._wavetables_i++] = (index + x) % 44100
    this.Lx0 = this.Rx0 = _wavetable.${osc}[index|0]
    return this
  `)
})

const N = Number.prototype

Object.defineProperty(N, 'note', {
  get () {
    return Math.pow(2, (this - 57)/12) * 440
  },
  set () {},
})

const S = String.prototype

Object.defineProperty(S, 'sample', {
  get () {
    let s = samples[this]
    if (!s) {
      s = samples[this] = zeroSample
      worker.fetchSample(this)
    }
    return s
  },
  set () {},
})

Object.defineProperty(S, 'pat', {
  get () {
    let pat = patterns[this] = patterns[this] ?? parsePattern(this)
    return pat
  },
  set () {},
})

Object.defineProperty(S, 'note', {
  get () {
    return stringToNote(this)
  },
  set () {},
})

S.seq = function (x) {
  return this.pat.seq(x)
}

S.slide = function (x) {
  return this.pat.slide(x)
}

const A = Array.prototype

A.play = function (x=1,offset=0) {
  let N = this.length
  return this[(( (n*x+offset) % N + N) % N)|0]
}

A.seq = function (x) {
  let N = this.length
  return this[(( (t*(1/(x*4))) % N + N) % N)|0]
}

A.slide = function (x,speed=1) {
  let N = this.length
  let pos = (( (t*(1/(x*4))) % N + N) % N)
  let now = pos|0
  let next =  (((now + 1) % N + N) % N)|0
  let alpha = pos - now
  return this[now]+((this[next]-this[now])*Math.pow(alpha, speed))
}

const T = Object.getPrototypeOf(Float32Array).prototype // TypedArray.prototype

T.play  = A.play
T.seq   = A.seq
T.slide = A.slide

export default Sound
