/*
This grammar aims to have one of every Peggy syntax.
It parses the output of a fizz-buzz (https://en.wikipedia.org/wiki/Fizz_buzz)
program (plus a few extensions) for correctness.
*/
{{
const NUMS = [3, 5];
}}
{
let currentNumber = (options.start == null) ? 1 : options.start|0;
}

Top = c:Count* { return c.filter(fb => fb) }

Count
  = EndComment "\n" { return }
  / Comment "\n" { return }
  / Comment? fb:Line ( Comment / EndComment )? "\n" {
    currentNumber++;
    return fb;
  }

Comment = _ "/*" ( !"*/" . )* "*/" _

EndComment = _ "//" [^\n]+

Line
  = @n:Number &{ return (n === currentNumber) && NUMS.every(d => n % d) }
  / FizzBuzz
  / Fizz
  / Buzz

FizzBuzz = f:Fizz _ b:Buzz { return f + b }
Fizz = @"fizz"i !{ return currentNumber % 3 }
Buzz = @"buzz"i !{ return currentNumber % 5 }

// Arbitrary requirement needing &
Number "number without trailing comment"
  = "0x" n:$[0-9a-f]i+ &"\n" { return parseInt(n, 16) }
  / n:$[0-9]+ &"\n" { return parseInt(n, 10) }

_ "whitespace"
  = $[ \t]*
