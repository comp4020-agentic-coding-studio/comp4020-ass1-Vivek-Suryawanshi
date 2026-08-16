# Process overview

## What I built

An interactive explainer about terminal velocity, at
[the live URL](https://comp4020-agentic-coding-studio.github.io/comp4020-ass1-Vivek-Suryawanshi/).
You pick two objects, guess which lands first, drop them five metres, and
watch. Then you set the air to Moon and they land together.

The belief I wanted to argue with is that heavier things fall faster. In air
it usually looks true. A hammer beats a feather because of its mass-to-area
ratio, not its weight, and the numbers under each object show that while you
watch.

## The moments that mattered

**I wrote the physics down before I wrote any code.**
[`3dd177a`](../../commit/3dd177a) is a file of equations, constants and object
values I put together first. The obvious thing would have been to describe the
simulation and let the agent work out the motion. Instead I specified how it
had to be calculated: use the closed-form solution, `v = v_t·tanh(g·t/v_t)`,
not a loop that steps time forward. Stepping accumulates error and ties the
answer to the frame rate, so the same page would teach different physics on a
60Hz and a 120Hz screen. I knew it took because no stepping loop appeared —
not in the physics module, and not later in the animation, which reads the
clock and asks the module where things are.

**I turned "things that should be true" into tests.**
The end of that file lists five statements that are true of the physics — two
objects land together in vacuum, doubling mass raises terminal velocity by √2
and not by 2. They became `spec/physics.test.ts`
([`84c75b3`](../../commit/84c75b3)). The √2 one is the useful one: it fails
immediately if the formula uses mass instead of its square root, which is the
mistake I'd expect. Five green tests is how I knew the physics was right
before I had anything to look at.

**The agent found a hole in my own document.**
Writing those tests, it stopped and told me my fifth check was ambiguous. I'd
said a 2 m drop takes 0.64 s "on Earth", but that only holds with no air —
with real air it depends on the object, which is the point of the whole page.
It asked instead of picking one quietly. I fixed the facts file rather than
just the test, because the ambiguity was mine
([`84c75b3`](../../commit/84c75b3))..

**I made the page catch people being wrong.**
The version I shipped first was correct and did nothing with it: you watched
two objects fall and read the numbers. The obvious next step was to explain
harder. Instead I put a question in front of the drop — which lands first, A,
B, or a tie — and one line afterwards saying whether you were right and what
decided it ([`e6e11a3`](../../commit/e6e11a3)). The subject of this page is a
wrong belief, not a phenomenon, and being told something is easy to nod at and
forget. I knew it worked when I tested it on the skydiver and the sheet of
paper: I picked the skydiver, I was right, and the feedback still corrected
me, because I'd been right for the wrong reason.

The same commit built the reduced-motion strobe. `CLAUDE.md` said that with
`prefers-reduced-motion` set the fall should be drawn as a multiple-exposure
photo rather than animated, and the page hadn't been doing it — a rule in my
own harness the artefact didn't keep.