const O = {}
O.sin   = function (x=1) { return Math.sin(this * x * Math.PI * 2) }
O.cos   = function (x=1) { return Math.cos(this * x * Math.PI * 2) }
O.tri   = function (x=1) { return Math.abs(1-(2*this*x)%2)*2-1 }
O.saw   = function (x=1) { return 1-2*(this%(1/x))*x   }
O.ramp  = function (x=1) { return   2*(this%(1/x))*x-1 }
O.sqr   = function (x=1) { return      (this*x%1/x<1/x/2  )*2-1 }
O.pulse = function (x=1,w=.9) { return (this*x%1/x<1/x/2*w)*2-1 }
O.noise = function (x=1) {
  x=Math.sin(x+this)*10e4
  return (x-Math.floor(x))*2-1
}
export default O
