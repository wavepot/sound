export default {
  'basic': `\
bpm(120)

mod(1/4).saw(50).exp(10).out().plot()
`,

  'complex': `\
bpm(120)

pulse(
  val(50)
  .on(8,1/8).val(70)
  .on(8,1/2,16).mul(1.5)
  .on(16,1/2).mul(2)
  .on(4,16).mul(1.5)
).mod(1/16).exp(10)
  .vol('.1 .1 .5 1'.seq(1/16))
  .lp(700,1.2)
  .on(4,8).delay(1/(512+200*mod(1).sin(1)),.8)
  .widen(.4)
  .out(.35)
`,

  'daverb': `\
bpm(120)

mod(1/4).saw(50).exp(10)
  .daverb(.27,1225)
  .out(.8)
`,

  'delay': `\
bpm(120)

mod(1/4).saw(50).exp(10)
  .delay()
  .out(.8).plot()
`,

  'techno': `\
bpm(120)

mod(1/4).sin(mod(1/4).val(42.881).exp(.057))
  .exp(8.82).tanh(28.18)
  .delay(1/16,.3)
  .daverb(.2,1231)
  .out(.6)

mod(1/4).bplay(166384,90000,.54+.001*lfo(2))
  .out(.3).plot()

mod(1/16).play(165028,0,1)
  .daverb(.5,1732)
  .out(.25)
`,

  'ketapop': `
bpm(100)

mod(val(1/4).on(8,1).val(1/8).on(16,1/2).val(1/16))
  .sin(mod(1/4).val(42.881).exp(.057))
  .exp(8.82).tanh(15.18)
  .on(16,1).val(0)
  .out(.4)

saw('d d# f f#'.seq(1/4).note/4)
  .mod(1/16).exp(10)
  .vol('.5 .1 .5 1'.seq(1/4))
  .lp(1800,1.2)
  .delay(1/[200,150].seq(4))
  .on(1,8,16).vol(0)
  .out(.35)

mod(1/16).noise(70).exp(19)
  .vol('.1 .4 1 .4'.seq(1/16))
  .on(8,1/4).mul('2 1'.seq(1/15))
  .bp(2500+mod(1/8).val(2000).exp(2.85),1.2,.5)
  .on(8,2).vol(0)
  .out(.2)

mod(1/2).play(220752,-19025,1)
  .vol('- - 1 -'.slide(1/8,.5))
  .vol('- - 1 .3'.seq(1/8))
  .tanh(2)
  .out(.7)

mod(4).play(243601,26000,1.1)
  .vol('- - - - - - 1 1 .8 - - - - - - -'.seq(1/16))
  .on(16,1).val(0)
  .delay(1/[100,200].seq(4))
  .daverb()
  .out(.4)

on(1,1,8).grp()
  .noise()
  .bp(6000)
  .bp(14000)
  .out(.08)
.end()

main.tanh(1)
  .on(8,2).grp()
    .bp(3000+mod(16,.06).cos(sync(16))*2800,4)
    .vol('.7 1.2 1.4 1.9 1.9 2.1 2.2 2.3'.seq(1/4))
  .end().plot()
`
}
