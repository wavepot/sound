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
  .on(1,8,16).vol(0)
  .widen(.4)
  .out(.35)
`,

  'daverb': `\
bpm(120)

mod(1/4).saw(50).exp(10)
  .daverb(.27,1225)
  .out(.8)
`

}
