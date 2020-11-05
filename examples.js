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

mod(1/4).bplay('freesound:166384'.sample,90000,.54+.001*sin(sync(2))).lp()
  .out(.23).plot()

mod(1/16).play('freesound:165028'.sample,0,1)
  .daverb(.5,1732)
  .out(.3)
`,
}
