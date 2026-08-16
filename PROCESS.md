# Process overview

## What I built

An interactive explainer about terminal velocity, at
[the live URL](https://comp4020-agentic-coding-studio.github.io/comp4020-ass1-Vivek-Suryawanshi/).
You pick two objects, drop them five metres, and watch which one lands first.
Then you set the air to Moon and drop them again, and they land together.

The idea I wanted to argue with is that heavier things fall faster. Most
people believe it, and in air it usually looks true. It isn't. A hammer beats
a feather because of its mass-to-area ratio, not its weight, and the numbers
under each object show that while you watch.

## The moments that mattered

**I wrote the physics down before I wrote any code.**
[`3dd177a`](../../commit/3dd177a) is a file of equations, constants and object
values I put together first. The obvious thing would have been to describe the
simulation and let the agent work out the motion. Instead I specified how it
had to be calculated: use the closed-form solution, `v = v_t·tanh(g·t/v_t)`,
not a loop that steps time forward. Stepping accumulates error and ties the
answer to the frame rate, so the same explainer would teach slightly different
physics on a 60Hz and a 120Hz screen. I knew it took because when the code
arrived there was no stepping loop in it, and later when the animation was
built it read the clock and asked the physics module where things were, rather
than keeping a running position of its own.

**I turned "things that should be true" into tests.**
The end of that same file lists five statements that are true of the physics —
two objects land together in vacuum, doubling mass raises terminal velocity by
√2 and not by 2, and so on. They became `spec/physics.test.ts`
([`84c75b3`](../../commit/84c75b3)). The √2 one is the useful one: it fails
immediately if someone writes the formula with mass instead of the square root
of mass, which is the mistake I'd expect. Five green tests is how I knew the
physics was right before I had anything to look at.

**The agent found a hole in my own document.**
Writing those tests, it stopped and told me my fifth sanity check was
ambiguous. I'd written that a 2 m drop takes about 0.64 s "on Earth", but that
figure only holds with no air — with real air it depends on which object you
drop, which is the whole point of the explainer. It asked which I meant instead
of picking one quietly. I fixed the wording in the facts file rather than just
the test, in the same commit, because the ambiguity was mine and leaving it
there would have caught me again later.

**I said no to two commands I couldn't read.**
Twice the agent wanted to run shell that Claude Code flagged for expansion
obfuscation, both times to test its own work without a browser. I declined
both and told it to finish the page instead
([`eebd5ea`](../../commit/eebd5ea)). Approving something I can't read to save
two minutes is a bad trade, and I could check the drop myself in thirty seconds
with the dev server already running.

In the same commit I deleted `spec/starter.test.ts` rather than putting the
template's `data-testid` back to make it pass. Its own failure message says
not to, and a green test asserting nothing is worse than no test.