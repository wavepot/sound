export default {
  lp1 (x0,freq=1000,amt=1) {
    var b = _biquads[_biquads_i++],
        {y1,y2,x1,x2} = b,

    w0 = pi2 * freq/sampleRate,

    a1 = -Math.exp(-w0),
    a2 = 0.0,
    b0 = 1.0 + a1,
    b1 = 0.0,
    b2 = 0.0,

    y0 = (x0*b0+x1*b1+x2*b2-y1*a1-y2*a2)
    b.y1=y0; b.y2=y1; b.x1=x0; b.x2=x1;

    return x0*(1-amt) + y0*amt
  },

  hp1 (x0,freq=1000,amt=1) {
    var b = _biquads[_biquads_i++],
        {y1,y2,x1,x2} = b,

    w0 = pi2 * freq/sampleRate,

    a1 = -Math.exp(-w0),
    a2 = 0.0,
    b0 = (1.0 - a1) / 2.0,
    b1 = -b0,
    b2 = 0.0,

    y0 = (x0*b0+x1*b1+x2*b2-y1*a1-y2*a2)
    b.y1=y0; b.y2=y1; b.x1=x0; b.x2=x1;

    return x0*(1-amt) + y0*amt
  },

  lp (x0, freq=1000, Q=1, amt=1) {
    var b = _biquads[_biquads_i++],
        {y1,y2,x1,x2} = b,

    w0 = pi2 * freq/sampleRate,
    sin_w0 = Math.sin(w0),
    cos_w0 = Math.cos(w0),
    alpha = sin_w0 / (2.0 * Q),

    b0 = (1.0 - cos_w0) / 2.0,
    b1 =  1.0 - cos_w0,
    b2 = b0,
    a0 =  1.0 + alpha,
    a1 = -2.0 * cos_w0,
    a2 =  1.0 - alpha,

    y0 = (x0*b0+x1*b1+x2*b2-y1*a1-y2*a2)/a0
    b.y1=y0; b.y2=y1; b.x1=x0; b.x2=x1;

    return x0*(1-amt) + y0*amt
  },

  hp (x0, freq=1000, Q=1, amt=1) {
    var b = _biquads[_biquads_i++],
        {y1,y2,x1,x2} = b,

    w0 = pi2 * freq/sampleRate,
    sin_w0 = Math.sin(w0),
    cos_w0 = Math.cos(w0),
    alpha = sin_w0 / (2.0 * Q),

    b0 = (1.0 + cos_w0) / 2.0,
    b1 = -(1.0 + cos_w0),
    b2 = b0,
    a0 = 1.0 + alpha,
    a1 = -2.0 * cos_w0,
    a2 = 1.0 - alpha,

    y0 = (x0*b0+x1*b1+x2*b2-y1*a1-y2*a2)/a0
    b.y1=y0; b.y2=y1; b.x1=x0; b.x2=x1;

    return x0*(1-amt) + y0*amt
  },

  bp (x0, freq=1000, Q=1, amt=1) {
    var b = _biquads[_biquads_i++],
        {y1,y2,x1,x2} = b,

    w0 = pi2 * freq/sampleRate,
    sin_w0 = Math.sin(w0),
    cos_w0 = Math.cos(w0),
    alpha = sin_w0 / (2.0 * Q),

    b0 = sin_w0 / 2.0,
    b1 = 0.0,
    b2 = -b0,
    a0 = 1.0 + alpha,
    a1 = -2.0 * cos_w0,
    a2 = 1.0 - alpha,

    y0 = (x0*b0+x1*b1+x2*b2-y1*a1-y2*a2)/a0
    b.y1=y0; b.y2=y1; b.x1=x0; b.x2=x1;

    return x0*(1-amt) + y0*amt
  },

  bpp (x0, freq=1000, Q=1, amt=1) {
    var b = _biquads[_biquads_i++],
        {y1,y2,x1,x2} = b,

    w0 = pi2 * freq/sampleRate,
    sin_w0 = Math.sin(w0),
    cos_w0 = Math.cos(w0),
    alpha = sin_w0 / (2.0 * Q),

    b0 = alpha,
    b1 = 0.0,
    b2 = -alpha,
    a0 = 1.0 + alpha,
    a1 = -2.0 * cos_w0,
    a2 = 1.0 - alpha,

    y0 = (x0*b0+x1*b1+x2*b2-y1*a1-y2*a2)/a0
    b.y1=y0; b.y2=y1; b.x1=x0; b.x2=x1;

    return x0*(1-amt) + y0*amt
  },

  not (x0, freq=1000, Q=1, amt=1) {
    var b = _biquads[_biquads_i++],
        {y1,y2,x1,x2} = b,

    w0 = pi2 * freq/sampleRate,
    sin_w0 = Math.sin(w0),
    cos_w0 = Math.cos(w0),
    alpha = sin_w0 / (2.0 * Q),

    b0 = 1.0,
    b1 = -2.0 * cos_w0,
    b2 = 1.0,
    a0 = 1.0 + alpha,
    a1 = b1,
    a2 = 1.0 - alpha,

    y0 = (x0*b0+x1*b1+x2*b2-y1*a1-y2*a2)/a0
    b.y1=y0; b.y2=y1; b.x1=x0; b.x2=x1;

    return x0*(1-amt) + y0*amt
  },

  ap (x0, freq=1000, Q=1, amt=1) {
    var b = _biquads[_biquads_i++],
        {y1,y2,x1,x2} = b,

    w0 = pi2 * freq/sampleRate,
    sin_w0 = Math.sin(w0),
    cos_w0 = Math.cos(w0),
    alpha = sin_w0 / (2.0 * Q),

    b0 = 1.0 - alpha,
    b1 = -2.0 * cos_w0,
    b2 = 1.0 + alpha,
    a0 = b2,
    a1 = b1,
    a2 = b0,

    y0 = (x0*b0+x1*b1+x2*b2-y1*a1-y2*a2)/a0
    b.y1=y0; b.y2=y1; b.x1=x0; b.x2=x1;

    return x0*(1-amt) + y0*amt
  },

  pk (x0, freq=1000, Q=1, gain=1, amt=1) {
    var b = _biquads[_biquads_i++],
        {y1,y2,x1,x2} = b,

    w0 = pi2 * freq/sampleRate,
    sin_w0 = Math.sin(w0),
    cos_w0 = Math.cos(w0),
    alpha = sin_w0 / (2.0 * Q),

    a = Math.pow(10.0, gain / 40.0),
    b0 = 1.0 + alpha * a,
    b1 = -2.0 * cos_w0,
    b2 = 1.0 - alpha * a,
    a0 = 1.0 + alpha / a,
    a1 = b1,
    a2 = 1.0 - alpha / a,

    y0 = (x0*b0+x1*b1+x2*b2-y1*a1-y2*a2)/a0
    b.y1=y0; b.y2=y1; b.x1=x0; b.x2=x1;

    return x0*(1-amt) + y0*amt
  },

  ls (x0, freq=1000, Q=1, gain=1, amt=1) {
    var b = _biquads[_biquads_i++],
        {y1,y2,x1,x2} = b,

    w0 = pi2 * freq/sampleRate,
    sin_w0 = Math.sin(w0),
    cos_w0 = Math.cos(w0),
    alpha = sin_w0 / (2.0 * Q),

    a = Math.pow(10.0, gain / 40.0),
    c = 2.0 * Math.sqrt(a) * alpha,
    b0 = a * ((a + 1.0) - (a - 1.0) * cos_w0 + c),
    b1 = 2.0 * a * ((a - 1.0) - (a + 1.0) * cos_w0),
    b2 = a * ((a + 1.0) - (a - 1.0) * cos_w0 - c),
    a0 = (a + 1.0) + (a - 1.0) * cos_w0 + c,
    a1 = -2.0 * ((a - 1.0) + (a + 1.0) * cos_w0),
    a2 = (a + 1.0) + (a - 1.0) * cos_w0 - c,

    y0 = (x0*b0+x1*b1+x2*b2-y1*a1-y2*a2)/a0
    b.y1=y0; b.y2=y1; b.x1=x0; b.x2=x1;

    return x0*(1-amt) + y0*amt
  },

  hs (x0, freq=1000, Q=1, gain=1, amt=1) {
    var b = _biquads[_biquads_i++],
        {y1,y2,x1,x2} = b,

    w0 = pi2 * freq/sampleRate,
    sin_w0 = Math.sin(w0),
    cos_w0 = Math.cos(w0),
    alpha = sin_w0 / (2.0 * Q),

    a = Math.pow(10.0, gain / 40.0),
    c = 2.0 * Math.sqrt(a) * alpha,
    b0 = a * ((a + 1.0) + (a - 1.0) * cos_w0 + c),
    b1 = -2.0 * a * ((a - 1.0) + (a + 1.0) * cos_w0),
    b2 = a * ((a + 1.0) + (a - 1.0) * cos_w0 - c),
    a0 = (a + 1.0) - (a - 1.0) * cos_w0 + c,
    a1 = 2.0 * ((a - 1.0) - (a + 1.0) * cos_w0),
    a2 = (a + 1.0) - (a - 1.0) * cos_w0 - c,

    y0 = (x0*b0+x1*b1+x2*b2-y1*a1-y2*a2)/a0
    b.y1=y0; b.y2=y1; b.x1=x0; b.x2=x1;

    return x0*(1-amt) + y0*amt
  }
}
