// Hand-authored historical context for individual films.
// The Internet Archive seed metadata is thin (title, downloads, date); this layer
// supplies the history and human cost. Keyed by film id. All facts are drawn from
// the public-domain DOE record "United States Nuclear Tests 1945-1992" (DOE/NV-209)
// and the corresponding operation histories. Yields are in kilotons.
//
// Tone, per spec: clinical, unflinching, no whimsy. Never sanitize the human cost.

export const FILM_CONTENT = {
  'trinity-shot': {
    weapon: 'Gadget — plutonium implosion device',
    description:
      "The world's first nuclear explosion. At 5:29 a.m. on 16 July 1945, the plutonium implosion device known as the Gadget detonated atop a 100-foot steel tower in the Jornada del Muerto desert of New Mexico, releasing about 21 kilotons. The flash was seen in three states; the shock wave broke windows 120 miles away. The test validated the implosion design used three weeks later over Nagasaki.",
    aftermath:
      "The tower was vaporized and the desert sand fused into a mildly radioactive blue-green glass later named trinitite. Fallout drifted across ranching country to the north and east; families living downwind — the Tularosa Basin downwinders — were never warned, never evacuated, and to this day are excluded from federal radiation-compensation programs. The crater remains slightly radioactive and is opened to the public twice a year.",
  },
  'crossroads-able': {
    weapon: 'Mk-3A Fat Man-type fission bombs',
    description:
      "Operation Crossroads put a fleet of 95 surplus and captured warships in Bikini lagoon and detonated atomic bombs against them to study effects on naval vessels. Able was an airburst on 1 July 1946; Baker, on 25 July, was detonated 90 feet underwater — the first underwater nuclear explosion. Baker threw a hollow column of two million tons of water a mile into the sky and dropped a radioactive mist back onto the fleet.",
    aftermath:
      "Baker contaminated all 95 target ships so thoroughly that decontamination failed; most were scuttled, including the carrier USS Saratoga and the battleship USS Arkansas. It was, in the words of the cleanup commander, 'the world's first nuclear disaster.' The 167 Bikini Islanders, told their evacuation would be temporary and 'for the good of mankind,' have never been able to return permanently.",
  },
  'sandstone-general': {
    weapon: 'Levitated-pit fission cores (X-Ray, Yoke, Zebra)',
    description:
      "Operation Sandstone (1948, Enewetak Atoll) was a weapons-laboratory series rather than a military exercise — three shots, X-Ray, Yoke and Zebra, that proved the levitated-pit design and roughly doubled the yield-to-weight efficiency of the American arsenal. The results let the U.S. build far more weapons from the same scarce fissile material.",
    aftermath:
      "The Enewetak people had already been displaced in 1947 and moved to Ujelang, a smaller, poorer atoll. Sandstone's efficiency gains accelerated the arms race; the design principles it confirmed underpinned every fission weapon that followed.",
  },
  'sandstone-navy': {
    weapon: 'Levitated-pit fission cores',
    description:
      "The U.S. Navy's documentary record of Operation Sandstone (1948), covering the fleet support, instrumentation ships and diagnostic photography for the X-Ray, Yoke and Zebra shots at Enewetak.",
    aftermath:
      "One of several service-specific films of the same series — the military filmed these tests exhaustively from every institutional perspective. The Enewetak islanders remained in exile on Ujelang throughout.",
  },
  'sandstone-usaf': {
    weapon: 'Levitated-pit fission cores',
    description:
      "The U.S. Air Force's documentary record of Operation Sandstone (1948) — airborne sampling of the mushroom clouds, cloud tracking, and aerial cinematography of the X-Ray, Yoke and Zebra detonations at Enewetak Atoll.",
    aftermath:
      "Air Force 'cloud sampling' pilots flew directly through the radioactive clouds to collect debris for analysis, an early and poorly understood occupational exposure that recurred across the entire test program.",
  },
  'sandstone-army': {
    weapon: 'Levitated-pit fission cores',
    description:
      "The U.S. Army Engineers' record of Operation Sandstone (1948) — the construction of test towers, instrument bunkers and camp facilities across Enewetak Atoll that made the three-shot series possible.",
    aftermath:
      "The engineering footprint left on Enewetak grew with every Pacific series; by the 1970s cleanup, contaminated debris from decades of testing was sealed under the Runit Dome, a concrete cap that is now cracking and leaking as sea levels rise.",
  },
  'sandstone-blast': {
    weapon: 'Levitated-pit fission cores',
    description:
      "The blast-measurement record of Operation Sandstone (1948): the gauge lines, pressure instruments and high-speed photography used to quantify the overpressure and thermal output of the X-Ray, Yoke and Zebra shots.",
    aftermath:
      "Blast and thermal data gathered here fed directly into the weapons-effects manuals that would later be used to plan civil-defense tests against mock American towns.",
  },
  'sandstone-ecg': {
    weapon: 'Levitated-pit fission cores',
    description:
      "The EG&G instrumentation record of Operation Sandstone (1948). Edgerton, Germeshausen & Grier — the firm behind the high-speed Rapatronic cameras — documented the first microseconds of each fireball at Enewetak.",
    aftermath:
      "EG&G's Rapatronic photography, capturing exposures of ten-millionths of a second, produced the iconic images of fireballs still milliseconds old — the 'rope tricks' of vaporizing tower guy-wires that became the visual signature of the atomic age.",
  },
  'ranger-buster': {
    weapon: 'Air-dropped fission bombs; Desert Rock troop exercises',
    description:
      "A combined record of Operation Ranger (January–February 1951) and Operation Buster-Jangle (October–November 1951), the first tests on the U.S. mainland since Trinity. Ranger opened the Nevada Test Site with five air-dropped shots; Buster-Jangle added the first underground and surface cratering tests and the Desert Rock exercises that marched troops toward ground zero.",
    aftermath:
      "Under Exercise Desert Rock, soldiers were positioned in trenches as close as seven miles from detonations and then advanced toward the still-rising cloud to study the psychological and physical effects on troops. Many of these 'atomic veterans' developed cancers; their exposure records were classified for decades.",
  },
  'greenhouse': {
    weapon: 'George (thermonuclear principle) and Item (boosted fission)',
    description:
      "Operation Greenhouse (1951, Enewetak) tested the physics that made the hydrogen bomb possible. The George shot used a fission bomb to ignite a small quantity of fusion fuel — the first time a thermonuclear reaction was achieved on Earth. The Item shot was the first boosted-fission weapon. The 225-kiloton series was twice as powerful as predicted.",
    aftermath:
      "George proved Edward Teller and Stanislaw Ulam's ideas were sound and cleared the path to Ivy Mike eighteen months later. The Enewetak islanders, still exiled on Ujelang, watched their home become the proving ground for the thermonuclear age.",
  },
  'tumbler-snapper': {
    weapon: 'Air-dropped and tower-mounted fission devices',
    description:
      "Operation Tumbler-Snapper (1952, Nevada) ran eight shots split between weapons development ('Tumbler') and military effects ('Snapper'). It produced some of the most-reproduced footage of the era, including high-speed film of the shock front racing across the desert floor and the structures, vehicles and mannequins arranged to absorb it.",
    aftermath:
      "Fallout from the Nevada series drifted across Utah and into the Midwest. The Atomic Energy Commission's public assurances of safety stood in sharp contrast to the radiation monitoring it was quietly conducting on the same downwind communities.",
  },
  'ivy-mike': {
    weapon: 'Mike — cryogenic liquid-deuterium "Sausage" device',
    description:
      "On 1 November 1952 the United States detonated the first true hydrogen bomb. Mike was not a deliverable weapon but an 82-ton experimental apparatus, a building-sized cryogenic flask of liquid deuterium chilled near absolute zero. It yielded 10.4 megatons — roughly 700 Hiroshimas — and completely vaporized the island of Elugelab, leaving a crater 1.2 miles wide and 160 feet deep where land had been.",
    aftermath:
      "The fireball was over three miles across. Irradiated coral fell on ships 30 miles away, and the mushroom cloud spread 100 miles. The film was kept from the American public for years; a sanitized version was released only after the Soviet Union tested its own thermonuclear device. Mike proved that weapons of effectively unlimited yield were now possible.",
  },
  'upshot-knothole': {
    weapon: 'Fission devices including the Grable nuclear artillery shell',
    description:
      "Operation Upshot-Knothole (1953, Nevada) ran eleven shots, among them Grable — a 15-kiloton shell fired from the M65 280mm 'Atomic Cannon,' the only nuclear artillery round ever detonated in flight by the U.S. The series paired weapons development with elaborate civil-effects experiments.",
    aftermath:
      "The Harry shot of 19 May 1953 — later nicknamed 'Dirty Harry' — blanketed St. George, Utah with fallout so heavy that motorists were stopped and their cars washed down. The downwind cancer toll from this and adjacent shots became one of the central grievances behind the later Radiation Exposure Compensation Act.",
  },
  'upshot-knothole-52': {
    weapon: 'Fission devices; civil-effects test structures',
    description:
      "A second reel of Operation Upshot-Knothole (1953) concentrating on the weapons-effects program: the test houses, automobiles, bomb shelters and instrument arrays built across the Nevada desert and exposed to the blasts.",
    aftermath:
      "Footage of frame houses bursting into flame and collapsing under the shock front became the template for the civil-defense films that told Americans they could survive a nuclear war by ducking under furniture.",
  },
  castle: {
    weapon: 'Shrimp — solid lithium-deuteride dry-fuel device',
    description:
      "Operation Castle (1954, Bikini) fielded the first deliverable thermonuclear weapons using solid, 'dry' lithium-deuteride fuel. Its opening shot, Bravo, on 1 March 1954, yielded 15 megatons — two and a half times the predicted yield and the largest device the United States ever detonated, about 1,000 Hiroshimas.",
    aftermath:
      "Bravo became the worst radiological disaster in American history. A miscalculated yield and an unexpected wind shift dumped heavy fallout across the inhabited atolls of Rongelap and Utirik, whose people suffered acute radiation sickness, lasting illness and exile. The Japanese tuna boat Daigo Fukuryu Maru (Lucky Dragon No. 5), 80 miles away, was coated in radioactive ash; its entire crew fell ill and radio operator Aikichi Kuboyama died, triggering an international crisis and the global anti-nuclear movement.",
  },
  teapot: {
    weapon: 'Tactical and air-defense fission devices',
    description:
      "Operation Teapot (1955, Nevada) ran fourteen shots developing smaller tactical warheads and air-defense weapons. It is best remembered for its civil-effects program, which built and destroyed entire furnished structures to study how American homes and families would fare under atomic attack.",
    aftermath:
      "Teapot's effects data was packaged for the public as reassurance. The same blasts that flattened the test houses were sending measurable fallout across the country, a contradiction the Atomic Energy Commission managed through secrecy rather than warning.",
  },
  'operation-cue': {
    weapon: 'Apple-2 shot, 29 kt tower device',
    description:
      "On 5 May 1955, under the Teapot series, the Federal Civil Defense Administration built 'Survival Town' — a complete mock American suburb of furnished houses, stocked supermarkets, parked cars, electrical lines and clothed mannequin families — and detonated a 29-kiloton bomb beside it. Operation Cue filmed the destruction as civil-defense instruction.",
    aftermath:
      "The footage of mannequin families incinerated and houses blown to splinters was meant to teach survival, but it documented the opposite: at close range nothing survived. With over a quarter-million views, it remains one of the most-watched and most chilling artifacts of Cold War civil defense.",
  },
  wigwam: {
    weapon: 'Mk-90 Betty deep-water nuclear depth charge',
    description:
      "Operation Wigwam (14 May 1955) was a single 30-kiloton shot detonated 2,000 feet underwater, 500 miles off the California coast — the only deep-water nuclear test ever conducted by the United States. It studied the effects of a nuclear depth charge on submarines, three of which were tethered at distance as scale-model targets.",
    aftermath:
      "Wigwam's spray dome rose over a mile wide. Crews aboard the support ships were exposed to contaminated water, and like the atomic veterans of the desert tests, spent decades fighting for recognition of their illnesses.",
  },
  redwing: {
    weapon: 'Thermonuclear devices incl. Cherokey air-drop',
    description:
      "Operation Redwing (1956, Bikini and Enewetak) ran seventeen shots to develop a second generation of thermonuclear weapons. Its Cherokee shot was the first U.S. airdrop of a hydrogen bomb, a 3.8-megaton burst over Bikini — proof that the megaton-range weapon was now a deployable bomb rather than a laboratory experiment.",
    aftermath:
      "Redwing returned to atolls already heavily contaminated by Castle Bravo two years earlier, adding to a fallout burden the Marshallese still live with. The series confirmed the U.S. could deliver multi-megaton weapons by aircraft anywhere on Earth.",
  },
  'nuclear-testing-review': {
    weapon: 'Compilation',
    description:
      "A Department of Energy overview film summarizing the U.S. atmospheric testing program — a compilation that stitches together footage from numerous operations into a single official narrative of the nuclear age.",
    aftermath:
      "Films like this were the public face of a program whose true scale, fallout and human cost remained classified for decades. What they show is real; what they leave out is most of the story.",
  },
  'atomic-bomb-blast-effects': {
    weapon: 'Compilation',
    description:
      "A U.S. Army compilation documenting the physical effects of atomic blasts — overpressure, thermal radiation and shock — on structures, vehicles and test materials across multiple Nevada shots.",
    aftermath:
      "Assembled as training material, the film distills years of weapons-effects testing into a catalogue of destruction, the same data that shaped both military targeting and civil-defense doctrine.",
  },
  'starfish-prime': {
    weapon: 'W49 thermonuclear warhead on a Thor rocket',
    description:
      "Part of Operation Dominic, Starfish Prime was a 1.4-megaton warhead detonated on 9 July 1962 at an altitude of 250 miles above Johnston Island — a deliberate high-altitude nuclear test. It lit an artificial aurora seen across the Pacific and produced an electromagnetic pulse that reached Hawaii.",
    aftermath:
      "The EMP knocked out streetlights, tripped burglar alarms and damaged telephone equipment 900 miles away in Honolulu. The blast pumped the Earth's magnetic field with charged particles, creating artificial radiation belts that crippled or destroyed at least six satellites over the following months — the first demonstration that a nuclear weapon in space could disable the technology below.",
  },
  'atomic-explosion-five-bombs': {
    weapon: 'Compilation',
    description:
      "A Department of Energy compilation, 'The Story of Five Atomic Bombs,' assembling footage of several detonations into a single documentary account of the weapons and their effects.",
    aftermath:
      "Like the other official compilations, it presents the explosions as technical achievements, the fireballs framed as data rather than as the leading edge of fallout that would settle, unannounced, over inhabited land.",
  },
};

// Extended legacy notes for a few operations whose consequences outran their
// one-paragraph seed description.
export const OPERATION_LEGACY = {
  crossroads:
    "Crossroads inaugurated the Pacific Proving Grounds and the permanent displacement of the Bikini people, whose home remains too contaminated for resettlement nearly eighty years later.",
  castle:
    "Castle Bravo's fallout poisoned the people of Rongelap and Utirik and the crew of the Lucky Dragon, galvanizing the global movement that would lead to the 1963 atmospheric test ban.",
  ivy:
    "Ivy Mike opened the thermonuclear era: within two years both superpowers fielded deliverable hydrogen bombs, and the logic of the arms race shifted from kilotons to megatons.",
  dominic:
    "Dominic was the last gasp of atmospheric testing. Its final shot in November 1962 closed an era; the following August the Limited Test Ban Treaty drove testing underground for good.",
};
