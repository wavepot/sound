/*
author: Khoin
github: https://github.com/khoin
repo: https://github.com/khoin/DattorroReverbNode

(modified slightly to process samples one by one instead of chunks)

In jurisdictions that recognize copyright laws, this software is to
be released into the public domain.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
THE AUTHOR(S) SHALL NOT BE LIABLE FOR ANYTHING, ARISING FROM, OR IN
CONNECTION WITH THE SOFTWARE OR THE DISTRIBUTION OF THE SOFTWARE.
*/

const rand = (x) => {
  x=Math.sin(x)*10e4
  return (x-Math.floor(x))
}

let sampleRate = 44100

let cache = {}

export default class DattorroReverb {
  static TapDelays = [
    0.004771345, 0.003595309, 0.012734787, 0.009307483,
    0.022579886, 0.149625349, 0.060481839, 0.124995800,
    0.030509727, 0.141695508, 0.089244313, 0.106280031
  ]

  static get parameterDescriptors() {
    return [
      ["preDelay", 0, 0, sampleRate - 1, "k-rate"],
      ["bandwidth", 0.9999, 0, 1, "k-rate"],
      ["inputDiffusion1", 0.75, 0, 1, "k-rate"],
      ["inputDiffusion2", 0.625, 0, 1, "k-rate"],
      ["decay", 0.5, 0, 1, "k-rate"],
      ["decayDiffusion1", 0.7, 0, 0.999999, "k-rate"],
      ["decayDiffusion2", 0.5, 0, 0.999999, "k-rate"],
      ["damping", 0.005, 0, 1, "k-rate"],
      ["excursionRate", 0.5, 0, 2, "k-rate"],
      ["excursionDepth", 0.7, 0, 2, "k-rate"],
      ["wet", 0.3, 0, 1, "k-rate"],
      ["dry", 0.6, 0, 1, "k-rate"]
    ].map(x => new Object({
      name: x[0],
      defaultValue: x[1],
      minValue: x[2],
      maxValue: x[3],
      automationRate: x[4]
    }));
  }

  constructor(_sampleRate) {
    sampleRate = _sampleRate

    this._Delays    = [];
    this._pDLength  = sampleRate //+ (128 - sampleRate%128); // Pre-delay is always one-second long, rounded to the nearest 128-chunk
    this._preDelay  = new Float32Array(this._pDLength);
    this._pDWrite   = 0;
    this._lp1       = 0.0;
    this._lp2       = 0.0;
    this._lp3       = 0.0;
    this._excPhase  = 0.0;

    [
      0.004771345, 0.003595309, 0.012734787, 0.009307483,
      0.022579886, 0.149625349, 0.060481839, 0.1249958  ,
      0.030509727, 0.141695508, 0.089244313, 0.106280031
    ].forEach(x => this.makeDelay(x));

    this._taps = Int16Array.from([
      0.008937872, 0.099929438, 0.064278754, 0.067067639, 0.066866033, 0.006283391, 0.035818689,
      0.011861161, 0.121870905, 0.041262054, 0.08981553 , 0.070931756, 0.011256342, 0.004065724
    ], x => Math.round(x * sampleRate));

    this.parameterDescriptors = this.constructor.parameterDescriptors
    this.defaultValues = Object.fromEntries(
      this.parameterDescriptors.map(p => {
        return [p.name, p.defaultValue]
      }))

    this.parameters = { ...this.defaultValues }

    this.seed = -1
  }

  makeDelay(length) {
    // len, array, write, read, mask
    let len = Math.round(length * sampleRate);
    let nextPow2 = 2**Math.ceil(Math.log2((len)));
    this._Delays.push([
      new Float32Array(nextPow2),
      len - 1,
      0|0,
      nextPow2 - 1
    ]);
  }

  writeDelay(index, data) {
    return this._Delays[index][0][this._Delays[index][1]] = data;
  }

  readDelay(index) {
    return this._Delays[index][0][this._Delays[index][2]];
  }

  readDelayAt(index, i) {
    let d = this._Delays[index];
    return d[0][(d[2] + i)&d[3]];
  }

  // cubic interpolation
  // O. Niemitalo: https://www.musicdsp.org/en/latest/Other/49-cubic-interpollation.html
  readDelayCAt(index, i) {
    let d = this._Delays[index],
      frac = i-~~i,
      int  = ~~i + d[2] - 1,
      mask = d[3];

    let x0 = d[0][int++ & mask],
      x1 = d[0][int++ & mask],
      x2 = d[0][int++ & mask],
      x3 = d[0][int   & mask];

    let a  = (3*(x1-x2) - x0 + x3) / 2,
      b  = 2*x2 + x0 - (5*x1+x3) / 2,
      c  = (x2-x0) / 2;

    return (((a * frac) + b) * frac + c) * frac + x1;
  }

  setParameters (parameters) {
    this.parameters = { ...this.defaultValues, ...parameters }
    this.parameters.preDelay = ~~this.parameters.preDelay
    this.parameters.damping = 1 - this.parameters.damping
    this.parameters.excursionRate = this.parameters.excursionRate / sampleRate
    this.parameters.excursionDepth = this.parameters.excursionDepth * sampleRate / 1000
  }

  seedParameters (seed) {
    if (seed === this.seed) return this
    this.seed = seed
    if (cache[seed]) {
      this.parameters = cache[seed]
    } else {
      let d = this.parameterDescriptors
      this.setParameters({
        preDelay:        rand(seed)     * 4000, //d[0].maxValue,
        bandwidth:       rand(seed + 1) * d[1].maxValue,
        inputDiffusion1: rand(seed + 2) * d[2].maxValue,
        inputDiffusion2: rand(seed + 3) * d[3].maxValue,
        decay:           rand(seed + 4) * d[4].maxValue,
        decayDiffusion1: rand(seed + 5) * d[5].maxValue,
        decayDiffusion2: rand(seed + 6) * d[6].maxValue,
        damping:         rand(seed + 7) * d[7].maxValue,
        excursionRate:   rand(seed + 8) * d[8].maxValue,
        excursionDepth:  rand(seed + 9) * d[9].maxValue,
      })
      console.log('set parameters', this.parameters)
      cache[seed] = this.parameters
    }
    return this
  }

  // First input will be downmixed to mono if number of channels is not 2
  // Outputs Stereo.
  process(ctx, amt = .5) {
    let parameters = this.parameters

    let
        pd   = parameters.preDelay          ,
        bw   = parameters.bandwidth           ,
        fi   = parameters.inputDiffusion1     ,
        si   = parameters.inputDiffusion2     ,
        dc   = parameters.decay               ,
        ft   = parameters.decayDiffusion1     ,
        st   = parameters.decayDiffusion2     ,
        dp   = parameters.damping         ,
        ex   = parameters.excursionRate   ,// / sampleRate        ,
        ed   = parameters.excursionDepth  ,// * sampleRate / 1000 ,
        we   = amt * 0.6, //parameters.wet             ,// * 0.6               , // lo & ro both mult. by 0.6 anyways
        dr   = 1 - amt; //parameters.dry                 ;


    this._preDelay[this._pDWrite] = (ctx.Lx0 + ctx.Rx0) *.5

    // // write to predelay and dry output
    // if (inputs[0].length == 2) {
    //   for (let i = 127; i >= 0; i--) {
    //     this._preDelay[this._pDWrite+i] = (inputs[0][0][i] + inputs[0][1][i]) * 0.5;

    //     outputs[0][0][i] = inputs[0][0][i]*dr;
    //     outputs[0][1][i] = inputs[0][1][i]*dr;
    //   }
    // } else if (inputs[0].length > 0) {
    //   this._preDelay.set(
    //     inputs[0][0],
    //     this._pDWrite
    //   );
    //   for (let i = 127; i >= 0; i--)
    //     outputs[0][0][i] = outputs[0][1][i] = inputs[0][0][i]*dr;
    // } else {
    //   this._preDelay.set(
    //     new Float32Array(128),
    //     this._pDWrite
    //   );
    // }

    let i = 0|0;
    // while (i < 128) {
      let lo = 0.0,
        ro = 0.0;

      this._lp1 += bw * (this._preDelay[(this._pDLength + this._pDWrite - pd + i)%this._pDLength] - this._lp1);

      // pre-tank
      let pre = this.writeDelay(0,             this._lp1          - fi * this.readDelay(0) );
        pre = this.writeDelay(1, fi * (pre - this.readDelay(1)) +      this.readDelay(0) );
        pre = this.writeDelay(2, fi *  pre + this.readDelay(1)  - si * this.readDelay(2) );
        pre = this.writeDelay(3, si * (pre - this.readDelay(3)) +      this.readDelay(2) );

      let split = si * pre + this.readDelay(3);

      // excursions
      // could be optimized?
      let exc   = ed * (1 + Math.cos(this._excPhase*6.2800));
      let exc2  = ed * (1 + Math.sin(this._excPhase*6.2847));

      // left loop
      let temp =  this.writeDelay( 4, split + dc * this.readDelay(11)    + ft * this.readDelayCAt(4, exc) ); // tank diffuse 1
            this.writeDelay( 5,         this.readDelayCAt(4, exc)  - ft * temp                      ); // long delay 1
            this._lp2      += dp * (this.readDelay(5) - this._lp2)                                   ; // damp 1
        temp =  this.writeDelay( 6,         dc * this._lp2             - st * this.readDelay(6)         ); // tank diffuse 2
            this.writeDelay( 7,         this.readDelay(6)          + st * temp                      ); // long delay 2
      // right loop
        temp =  this.writeDelay( 8, split + dc * this.readDelay(7)     + ft * this.readDelayCAt(8, exc2)); // tank diffuse 3
            this.writeDelay( 9,         this.readDelayCAt(8, exc2) - ft * temp                      ); // long delay 3
            this._lp3      += dp * (this.readDelay(9) - this._lp3)                                   ; // damp 2
        temp =  this.writeDelay(10,         dc * this._lp3             - st * this.readDelay(10)        ); // tank diffuse 4
            this.writeDelay(11,         this.readDelay(10)         + st * temp                      ); // long delay 4

      lo =  this.readDelayAt( 9, this._taps[0])
        + this.readDelayAt( 9, this._taps[1])
        - this.readDelayAt(10, this._taps[2])
        + this.readDelayAt(11, this._taps[3])
        - this.readDelayAt( 5, this._taps[4])
        - this.readDelayAt( 6, this._taps[5])
        - this.readDelayAt( 7, this._taps[6]);

      ro =  this.readDelayAt( 5, this._taps[7])
        + this.readDelayAt( 5, this._taps[8])
        - this.readDelayAt( 6, this._taps[9])
        + this.readDelayAt( 7, this._taps[10])
        - this.readDelayAt( 9, this._taps[11])
        - this.readDelayAt(10, this._taps[12])
        - this.readDelayAt(11, this._taps[13]);

      // let out = x0*dr + (lo+ro)*we*.5
      // outputs[0][0][i] += lo * we;
      // outputs[0][1][i] += ro * we;

      this._excPhase  += ex;

      // i++;

      for (let j = 0, d = this._Delays[0]; j < this._Delays.length; d = this._Delays[++j]) {
        d[1] = (d[1] + 1) & d[3];
        d[2] = (d[2] + 1) & d[3];
      }
    // }

    // Update preDelay index
    this._pDWrite = (this._pDWrite + 1) % this._pDLength;

    ctx.Lx0 = ctx.Lx0*dr + lo*we
    ctx.Rx0 = ctx.Rx0*dr + ro*we
    // return [, ] // out;
  }
}
