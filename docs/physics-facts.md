# Terminal velocity — the physics I'm working from

Every number in the simulation comes from this file. If something isn't here,
don't guess it — tell me and I'll look it up.

## The equations

Drag force:

    F_d = 0.5 * rho * v^2 * Cd * A

Acceleration while falling:

    a = g - (rho * Cd * A / 2m) * v^2

Terminal velocity, where drag cancels weight and acceleration hits zero:

    v_t = sqrt( 2mg / (rho * Cd * A) )

There's a closed-form solution, so use it instead of stepping through the
motion frame by frame. It's exact and it won't drift:

    v(t) = v_t * tanh(g*t / v_t)
    y(t) = (v_t^2 / g) * ln(cosh(g*t / v_t))

Those break when rho = 0, because v_t goes to infinity. Use the vacuum case:

    v(t) = g*t
    y(t) = 0.5 * g * t^2

No mass in there. That's the whole point of the explainer.

## Constants

- Gravity on Earth: 9.81 m/s^2
- Gravity on the Moon: 1.62 m/s^2
- Air density at sea level, 15 C: 1.225 kg/m^3
- Air density at 5000 m: 0.736 kg/m^3
- Air density on the Moon: 0

## Objects

Drag coefficients are standard textbook values for these shapes. I calculated
the terminal velocities from the formula above at sea level.

| Object | Mass (kg) | Area (m^2) | Cd | v_t |
|---|---|---|---|---|
| Feather | 0.0005 | 0.005 | 0.8 | about 1.4 m/s |
| Sheet of paper, flat | 0.005 | 0.062 | 1.2 | about 1.0 m/s |
| Ping pong ball | 0.0027 | 0.00126 | 0.47 | about 8.6 m/s |
| Hammer | 1.0 | 0.005 | 1.0 | about 57 m/s |
| Bowling ball | 7.26 | 0.0366 | 0.47 | about 82 m/s |
| Skydiver, belly down | 80 | 0.6 | 1.0 | about 46 m/s |

A few notes on those:

Feathers vary a lot. These are reasonable numbers for a medium bird feather,
not a precise measurement.

The paper values only hold while it's flat. Crumple it and the area collapses,
so it falls much faster. Don't simulate crumpled paper without changing the
area.

The ping pong ball works out to 8.6 m/s, which matches the figure people
usually quote of about 9 m/s. Good sign the formula is right.

Skydivers are usually quoted at 50 to 55 m/s belly down. Head down is much
faster, around 90 m/s, because the area is so much smaller.

## What this explainer is arguing against

Most people think heavier things fall faster. In air they often do look like
they fall faster, which is why the belief sticks around.

What's actually happening is that mass and air resistance work against each
other. More mass means more weight pulling down, so a higher terminal
velocity. More area means more drag, so a lower one.

A hammer beats a feather because its mass-to-area ratio is much higher, not
because it's heavier. Take the air away and they're identical.

You can see it in the formula: v_t depends on m/A, not on m by itself.

## Apollo 15

On 2 August 1971, David Scott dropped a hammer and a falcon feather at the
same time on the Moon, on camera, and they landed together. He said on the
broadcast that it showed Galileo was right.

That's real and it's filmed, so it's the best anchor I have for the vacuum
case.

One thing to be careful about: the story about Galileo dropping balls off the
Leaning Tower of Pisa is probably not true. It comes from a biography written
by his assistant long afterwards and nothing from the time backs it up. He did
argue the principle and he did roll balls down ramps to test it. Don't state
the tower story as fact.

## Don't invent these

If the simulation needs any of this, it isn't here and I don't want it
guessed:

- drag coefficients for objects not in the table
- air density at other altitudes
- gravity on anything other than Earth and the Moon
- Reynolds number corrections, or any case where quadratic drag stops working
- anything about real feathers beyond the rough values above

## Things that should be true if the code is right

These are true of the physics, so they should be true of the simulation. Worth
turning into tests.

1. With rho = 0, two objects of any mass or area land at the same time.
2. With rho = 1.225, nothing ever goes faster than its terminal velocity.
3. Double the mass and keep the area, and terminal velocity goes up by
   sqrt(2), not by 2.
4. Drop something from low enough and it never reaches terminal velocity at
   all — it hits the ground still speeding up. Worth showing.
5. On the Moon a 2 m drop takes about 1.6 s, against about 0.64 s on Earth.
