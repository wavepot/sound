const GRID_COLORS = ['#363636', '#282828', '#313131', '#282828']
const LINE_COLOR = '#fff'
const DASHES = [2,2]
const NO_DASHES = []
const COMPOSITE = 'darken'

export default ({ ctx, width: w, height: h, pixelRatio: pr }, size = 1) => {
  size = Math.min(size, 9999)

  let i = 0, x = 0
  let cx = 0, cy = 0

  const length = 2048 //buffer.length //2**11
  // const buffer = new Float32Array(length)
  const step = 2/length

  let buffer = []

  const f = x => buffer[x] //x*(size)/2

  const resize = ({ width, height }) => {
    w = width
    h = height
  }

  const drawX = () => {
    ctx.beginPath()
    ctx.setLineDash(DASHES)
    ctx.strokeStyle = GRID_COLORS[0]
    ctx.moveTo(0, h/2)
    ctx.lineTo(w, h/2)
    ctx.stroke()
  }

  const drawY = () => {
    const sc = size*2*2
    const vlines = Math.floor(2/sc)
    if (sc > 100) {
      ctx.beginPath()
      ctx.strokeStyle = GRID_COLORS[0]
      ctx.moveTo(w/2,0)
      ctx.lineTo(w/2,h)
      ctx.stroke()
    } else {
      const vlw = (w/sc)
      for (let i = 1; i < sc; i++) {
        ctx.beginPath()
        ctx.strokeStyle = GRID_COLORS[i%4]
        ctx.moveTo(i*vlw,0)
        ctx.lineTo(i*vlw,h)
        ctx.stroke()
      }
    }
  }

  function drawLine () {
    i = 0
    cx = 0; cy = h/2
    ctx.setLineDash(NO_DASHES)
    ctx.beginPath()
    ctx.lineWidth = 1.5/pr
    ctx.strokeStyle = LINE_COLOR
    ctx.globalCompositeOperation = COMPOSITE

    x = -1
    const calc = () => {
      cx = ((x+1)*.5)*w
      cy = (( 1-(f(i++)+1)*.5)*(h-2))+1
    }
    calc()
    ctx.moveTo(cx, cy)
    for (x = -1; x <= 1; x += step) {
      calc()
      ctx.lineTo(cx,cy)
    }
    ctx.stroke()
  }

  return {
    drawX,
    drawY,
    drawLine,
    resize,
    setBuffer (_buffer) {
      buffer = _buffer
    },
    setSize (_size) {
      size = _size
    },
  }
}

// const sin = x => Math.sin(x*2*Math.PI)
// let i = 2
// plot(x => Math.exp(-x*Math.atan(x*2)*5), i)

// // setInterval(() => plot(sin, ++i), 1500)
