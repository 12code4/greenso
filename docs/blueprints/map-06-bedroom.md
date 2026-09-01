# Blueprint — Map 06 · THE BEDROOM AT NIGHT · "Under the Bed"

- **Verb:** stealth-leaning rescue · **Unlock:** Flamethrower · **Enemies introduced:** the Cat (neutral kaiju), Flamer
- **Fun target:** *the scary-safe childhood dark* — light is the mechanic (exposure + magnifier fuel + searchlight), noise is the tax (brick fields clatter), and the Cat's under-bed entrance is the campaign's one earned scare. Both armies hiding from her is the best joke and the stealth tutorial in one.
- **Real footprint:** a ~3.5 × 3 m bedroom floour → **65 × 55 u** in three lighting nations. Under-bed gap = 5.6 u sky.

## 1. Regions (graph)

```
[DESK LAMP A3] --- [MATTRESS PLATEAU A3 breathing] (Kid sleeps — hush)
     | (charger cable ramp)          |
[BOOKSHELF CLIFF A2] --- [NIGHTLIGHT COAST A0 safe] --- [MOONLIT STEPPE A0 rug]
                                                              | (brick fields)
                                                      [UNDER THE BED A0 dark]
                                                              |
                                                     [TAN POW CAMP A0 lit]
```

| ID | Name | Kind | Band | Size (u) | Scale-seller | Landmarks |
|---|---|---|---|---|---|---|
| `R_coast` | Nightlight Coast | connector (safe) | A0 | 14×12 | nightlight glow | Nightlight, Bed |
| `R_steppe` | Moonlit Steppe (rug) | arena | A0 | 24×20 | moon patches, brick rubble | Nightlight, Lamp, Bed |
| `R_underbed` | Under the Bed | arena (dark) | A0 | 26×22, ceiling 5.6 `lowCeiling` | dust-bunny tumbleweeds, sock zeppelin | Camp Light |
| `R_camp` | Tan POW Camp | arena (lit) | A0 | 14×12 | keychain-LED searchlight | Camp Light |
| `R_shelf` | Bookshelf Cliff | overlook | A2 | ladder of spines | the room below | Lamp, Nightlight |
| `R_plateau` | Mattress Plateau | overlook (hush) | A3 | 20×16 | the sleeping Kid (XL ✱) | everything |

## 2. Routes

| ID | From→To | Class | Vocabulary |
|---|---|---|---|
| `RT_bricks` | coast → steppe | main | brick rubble auto-step (0.19) — **noise surface** (clatter) |
| `RT_underbed` | steppe → under-bed | main | drop under the frame rail (`lowCeiling` from here) |
| `RT_cable` | shelf → plateau | climb | charger cable lean-ramp past the Kid's hand |
| `RT_spines` | steppe → shelf | climb | book-spine ladder, hop chain |
| `RT_soft` | under-bed dust path | flank | dust bunnies = **soft** surface (silent) |

## 3. Golden path

1. **Nightlight Coast:** safe HQ (toy-bin cameo). Olive: "Pickle's in the camp under the bed. Mind the Bricks. And… the Cat's home."
2. Cross the **Moonlit Steppe** learning noise (bricks) + light (headlight sweeps) rules — `SWEEPER_BELL` here, but the "bell" is *you* clattering bricks.
3. Drop **Under the Bed** (dark): `AMBUSH_POCKET` in dust-bunny cover; navigate to the camp perimeter.
4. **Tan POW Camp:** deal with the searchlight (shoot its switch, or re-aim it onto the Tan barracks), free **Pickle** (named beat).
5. **The Cat arrives** (`HUSH_POCKET` erupts across the dark): exfil becomes hush-then-sprint back to the Coast, Pickle's glue lighting the route. Complete. (~85 u golden path.)

## 4. Encounters

| ID | Template | Region | Composition | Activation |
|---|---|---|---|---|
| `E_steppe` | SWEEPER_BELL | R_steppe | 2 Riflemen + 2 dormant Troopers; brick-noise = ping | region-enter |
| `E_underbed` | AMBUSH_POCKET | R_underbed | 2 Troopers + 1 Flamer (backpack chain-melt) | region-enter |
| `E_camp` | PICKET_LINE | R_camp | 3 Riflemen + 1 Officer, under searchlight | region-enter |
| `E_cat` | HUSH_POCKET (moving) | dark regions | the Cat (unkillable) | objective (Pickle freed) |

## 5. Hazards

| ID | Period | Phases | Telegraph | Regions |
|---|---|---|---|---|
| `H_headlights` | 80 s | sweep `lightVolume` across the steppe (hostile-bright then re-dark) | distant engine, 4 s | steppe |
| `H_searchlight` | fixed sweep | `lightVolume` cone over the camp; re-aimable by the player | visible beam | camp |
| `H_cat` | off-schedule | moving `HUSH_POCKET` + `quakeShadow` (soft paws) | low growl + eye-shine | dark regions |
| `H_kid` | ~loose | `quakeShadow` mattress turns over (plateau routes open/close); **must never "wake"** — hard fiction rule, not a fail state | breathing shifts | plateau |

Light is the through-line: exposure (headlights/searchlight), fuel (any lit volume powers a future magnifier), and the Cat's darkness. `noiseMask` is NOT used here — quiet is the point; bricks are the anti-stealth.

## 6. Kit manifest

- **Reused:** `book_hard`/`book_paper` (shelf), `block_alpha`, `cable_charger`, `torch_flash` (searchlight), `mouse_windup` (Cat distraction), `sock_mass`, `cat`✱, `giant_artifacts` (homework, lead soldier).
- **New heroes (≤8):** `nightlight`, `bed_frame` (under-zone shell-prop), `dust_bunny` (soft cover + perception), `brick_field` (noise rubble), `keychain_led` (camp light), `kid_sleeping`✱ (breathing plateau). **6 new — within budget.**
- **Fortification:** the Tan camp's matchstick stockade + juice-box pallets; dust bunnies as natural under-bed cover.
- **Shell:** bedroom floor (rug zone + hardwood), bed frame + mattress plateau, bookshelf, desk + lamp, closet gap, window + blinds (headlight source).

## 7. Pickups & secrets

- Ammo sparse (tension); glue on the Coast and post-camp; **mold tray** on the bookshelf (rewards the climb + overlook). Flamethrower unlock crate in the under-bed ambush.
- **Marbles:** (early-visible) one on the desk seen from the shelf; one in a moon patch on the rug. (hidden) in the heel of the **sock zeppelin**; in the piano-pedal-well-equivalent (under the dresser). (skill) the **glow-in-the-dark Moss skin** in the closet, visible only during a headlight sweep through a shoebox seam.
- **POW:** Pickle (named). One generic in the camp cages (optional).

## 8. Mission FSM

`brief → cross_steppe → infiltrate_underbed → disable_searchlight → rescue_pickle → cat_exfil(reach coast) → complete`. Checkpoints: steppe entry, under-bed entry, camp (pre-Cat). No checkpoint during Cat exfil (the sequence is the tension). **Par ≈ 5:30.**

## 9. QA deltas

- Moving `HUSH_POCKET` (Cat) + AI hush behavior is new; both-armies-freeze must read clearly — prototype in P2.
- The "never wake the Kid" rule is fiction, not a fail state; make sure no systemic path punishes the player for it (it just opens/closes routes). Verify in P6.
- Darkness perception volumes reuse the grass modifier (06 §9) driven by light instead of soak — confirm one code path serves both before building Backyard's grass, so this map is free.
