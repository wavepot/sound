export const toFinite = n => Number.isFinite(n) ? n : 0

export const clamp = (min, max, n) => Math.max(min, Math.min(max, n))

export const parseFn = fn => {
  let s = fn.toString()
  let [args, body] = (s.split('\n')[0].includes('=>')
    ? s.split('=>')
    : [s.slice(s.indexOf('('), s.indexOf(')')+1), s.slice(s.indexOf(' {'))]
    ).map(s => s.trim())
  args = args.replace(/[\(\)]/g, '').split(',')
  let argNames = args.map(a => a.split('=')[0])
  let inner = body[0] === '{' ? body.split('\n').slice(1,-1).join('\n').trim() : body
  return { args, argNames, body, inner }
}

const notes = 'ccddeffggaab'
export const stringToNote = s => {
  s = s.split('')
  let octave = parseInt(s[s.length - 1], 10)
  if (isNaN(octave)) octave = 4
  const note = s[0].toLowerCase()
  const flat = s[1] === 'b'
  const sharp = s[1] === '#'
  return notes.indexOf(note) + (octave * 12) + sharp - flat
}

const EXCESS_WHITESPACE = / {1,}|\n/g
const HAS_LETTER = /[a-zA-Z]/
export const parsePattern = x => x
  .replace(EXCESS_WHITESPACE, ' ') // remove excess whitespace
  .trim() // and trim
  .split(' ') // split to array of values
  .map(n => toFinite(
    HAS_LETTER.test(n)
      ? stringToNote(n) // has a letter then it is a musical note
      : parseFloat(n) // otherwise it's a scalar
    ))

// export const ProxyChain = () => {
//   const acc = []

//   const add = (a0,a1,a2,a3,a4) => {
//     acc[acc.length-1].push(a0,a1,a2,a3,a4)
//     return proxy
//   }

//   const handler = {
//     get (obj, prop) {
//       acc.push([prop])
//       return add
//     },
//     apply () {
//       return acc.splice(0)
//     }
//   }

//   const proxy = new Proxy(() => {}, handler)

//   const init = () => {
//     acc.splice(0)
//     return proxy
//   }

//   return init
// }

export const actlessProxy = (capture = () => {}) => {
  const chain = () => proxy

  const handler = {
    get (obj, prop) {
      capture(prop)
      return chain
    },
    apply () {
      return proxy
    }
  }

  const proxy = new Proxy(chain, handler)

  return proxy
}

export const captureAllProxy = (context, begin, capture) => {
  const acc = []

  const add = (a0,a1,a2,a3,a4) => {
    acc[acc.length-1].push(a0,a1,a2,a3,a4)
    return proxy
  }

  const handler = {
    get (obj, prop) {
      acc.push([prop])
      return add
    },
    apply () {
      return proxy
    }
  }

  const proxy = new Proxy(() => {}, handler)

  const actless = actlessProxy(capture)

  return (a0,a1,a2,a3,a4) => {
    if (context.i === 0) {
      acc.splice(0)
      begin(acc,a0,a1,a2,a4,a4)
      return proxy
    } else {
      return actless
    }
  }
}

export const captureManyProxy = (context,parent,begin,end) => {
  const acc = []

  const add = (a0,a1,a2,a3,a4) => {
    acc[acc.length-1].push(a0,a1,a2,a3,a4)
    return proxy
  }

  const run = calls => () => {
    calls.forEach(([method,a0,a1,a2,a3,a4]) =>
      parent[method](a0,a1,a2,a3,a4))
  }

  const handler = {
    get (obj, prop) {
      if (prop === 'out' || prop === 'on' || prop === Symbol.toPrimitive) {
        const rest = acc.splice(1)
        proxy()
        run(rest)()
        return parent[prop]
      }
      acc.push([prop])
      return add
    },
    apply () {
      end(run(acc.splice(0)), context)
      return parent
    }
  }

  const proxy = new Proxy(() => {}, handler)

  return (a0,a1,a2,a3,a4) => {
    acc.splice(0)
    begin(context,a0,a1,a2,a3,a4)
    return proxy
  }
}

export const captureOneProxy = (context,parent,begin,end) => {
  const handler = {
    get (obj, prop) {
      return (a0,a1,a2,a3,a4) => {
        end(() => { parent[prop](a0,a1,a2,a3,a4) }, context)
        return parent
      }
    }
  }

  const proxy = new Proxy(() => {}, handler)

  return (a0,a1,a2,a3,a4) => {
    begin(context,a0,a1,a2,a3,a4)
    return proxy
  }
}
