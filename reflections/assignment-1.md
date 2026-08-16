# Assignment 1 reflection — the breakthrough

The breakthrough was writing down *how* the physics had to be calculated
before I asked for any code.

Last week on the redesign I worked the other way round. I described what I
wanted, the agent built it, I opened the page, and I found the problems by
looking. That worked, but every problem I found was one I could have
prevented. The site had no link back to the homepage because I never said it
needed one. The styling came back as bigger headings because I said "like the
ANU website" instead of saying what I actually meant.

So this time I started with `docs/physics-facts.md`. It has the equations, the
constants, and the six objects with their mass, area and drag coefficient. The
part that mattered was one instruction inside it:

> There's a closed-form solution, so use it instead of stepping through the
> motion frame by frame. It's exact and it won't drift.

That is not a description of what I wanted. It is a rule about how to get
there.

I expected the agent to write a loop. That is the normal way to animate
something falling — take a small step forward in time, add a bit of speed, move
the object down a bit, repeat. It looks right and it is easy to write. But the
errors add up, and the step size usually comes from the screen refresh rate, so
a 120Hz laptop gets a different answer than a 60Hz one. For a page whose whole
job is teaching physics correctly, that is not acceptable, and it is the kind of
thing nobody would ever notice by looking at it.

It never wrote the loop. The physics module came back with `Math.tanh` and
`log(cosh(...))` and no stepping anywhere. Then when I asked for the animation
an hour later — a completely separate prompt, where a loop would have been the
obvious approach — it still didn't. It read the clock each frame and asked the
physics module where the objects were at that time. Its own summary said there
was no accumulated position, so frame rate and window resizes couldn't affect
the result.

I never corrected it once. That is the difference. Last week I caught things
after they happened. This week the constraint was already there, so there was
nothing to catch.

The part I didn't expect was that the same document caught *me*. At the end of
it I listed five things that should be true if the code is right, and the agent
turned them into tests. Writing them it stopped and told me my fifth one was
ambiguous — I'd said a 2 metre drop takes 0.64 seconds "on Earth", but that
number only holds with no air. With real air it depends on which object you
drop, which is the entire point of the explainer. It asked me instead of
guessing. I fixed the wording in the facts file rather than only in the test,
because the mistake was mine and it would have caught me again later.

What I take from that is that a good constraint isn't just something you hold
the agent to. It's a thing you can be wrong about, and find out.