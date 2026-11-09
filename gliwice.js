/* gliwice-switch — today's Rynek, Teatr Muzyczny and Beer Brothers on Górnych Wałów. */
(() => {
  const { PAD_Y, BW, BH, clamp, mix, smooth, rng } = CitySwitch;
  const NOON = 0, GOLD = 1, DUSK = 2, NIGHT = 3, DAWN = 4;
  let M, N;
  const SKY = [
    ['#568bb4', '#7aaaca', '#a9cadd', '#d1e2e7', '#f2ebd6'],
    ['#7798b5', '#b6b0b5', '#e2b19a', '#f5bc87', '#ffe2ac'],
    ['#293d65', '#545576', '#a07686', '#da9b89', '#f4bd9d'],
    ['#080f22', '#101c34', '#1a2b43', '#2d4052', '#4b5960'],
    ['#425a7e', '#7d8fa3', '#bdadb0', '#e6c7b8', '#f5e4cd'],
  ];
  const grade = [
    ([r, g, b]) => [r, g, b],
    ([r, g, b]) => [r * 1.02 + .03, g * .85 + .02, b * .72],
    ([r, g, b]) => [r * .57 + .035, g * .51 + .025, b * .61 + .04],
    ([r, g, b]) => [r * .22 + .025, g * .26 + .03, b * .36 + .045],
    ([r, g, b]) => [r * .73 + .04, g * .7 + .03, b * .77 + .04],
  ];
  const palette = ({ mat, neon }) => {
    for (const [name, hex] of Object.entries({
      HALL: '#f1e7d0', HALL_SH: '#d1c4ab', TRIM: '#fff4dd',
      COPPER: '#6f8b7a', COPPER_D: '#496858', COPPER_L: '#99ac8e',
      THEATRE: '#d2d7d3', THEATRE_D: '#aab5b2', THEATRE_L: '#edf0e9',
      TEN_Y: '#e7ce95', TEN_Y_D: '#c9ae79', TEN_G: '#b5c6ac', TEN_G_D: '#93ab92',
      TEN_P: '#e1b6a6', TEN_P_D: '#c1958a', TEN_T: '#f8efdf',
      TILE_R: '#ab6750', TILE_D: '#774936',
      TIMBER: '#826044', TIMBER_D: '#5e4939', TIMBER_L: '#a68358',
      TREE: '#6c9a50', TREE_D: '#47723f', TREE_L: '#a3bf66', BARK: '#857f66', BARK_L: '#b7ae8c',
      PIGEON: '#737c8c', PIGEON_D: '#444b5a',
      FGL: '#62858b', FGL_H: '#b0d0ce', STONE: '#c5c1af', STONE_D: '#999e93',
      NEPT: '#83a694', NEPT_D: '#557d70', WATER: '#9bbac0',
      BRONZE: '#5b685b', LEAF: '#728f57', PLANTER: '#737c75',
      BOTTLE: '#36574b', LABEL: '#e8c889', CHAIR: '#5e7068',
    })) mat(name, hex);
    mat('PAVE', '#c9c7bb', { [NIGHT]: '#303e4a' });
    mat('PAVE_D', '#b1b3aa', { [NIGHT]: '#263440' });
    mat('CLOUD', '#f6f3eb', { [GOLD]: '#ffe1bb', [DUSK]: '#c299a6', [NIGHT]: '#33465a', [DAWN]: '#e3cfca' });
    mat('CLOUD_SH', '#d9e2e2', { [GOLD]: '#e9ba9e', [DUSK]: '#956f87', [NIGHT]: '#293b50', [DAWN]: '#bdacb7' });
    neon('FLOOD_HI', '#ffe9b0', '#ffd08a', .22);
    neon('FLOOD', '#dcb17e', '#e8ad68', .13);
    neon('FLOOD_LO', '#8d8671', '#bc9c6c', .06);
    neon('PUB', '#ffe4a6', '#efb654', .36);
    neon('BOTTLES', '#b7dbcc', '#7fd8bc', .12);
    neon('LED_SOFT', '#f5f2df', '#d7e5e2', .27);
  };
  const line = (x0, y0, x1, y1, cb) => {
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      cb(x0, y0);
      if (x0 === x1 && y0 === y1) break;
      const e2 = err * 2;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  };
  const drawRadioTower = (w) => {
    const cx = 94;
    const top = 13;
    const base = 106;
    const hw = (y) => 0.9 + 9.6 * Math.pow((y - top) / (base - top), 1.3);
    const g = w.towerG;
    const put = (x, y, m) => {
      w.px(x, y, m);
      // Floodlit from the foot: the light gives out on the way up
      if (y > 72) w.light(x, y, N.FLOOD_HI, g);
      else if (y > 46) w.light(x, y, N.FLOOD, g);
      else if (y > 24 && (x + y) % 2 === 0) w.light(x, y, N.FLOOD_LO, g);
    };
    const firstOpen = 93;
    // X-braced panels, shorter toward the top so the taper reads
    let y = top;
    while (y < firstOpen) {
      const t = (y - top) / (base - top);
      const h = Math.round(3 + t * 7.5);
      const y1 = Math.min(y + h, firstOpen);
      const a = Math.round(hw(y));
      const b = Math.round(hw(y1));
      // Back face first, one shade darker and offset, for the depth of a square tower
      if (b >= 4) {
        const ins = 1;
        line(cx - a + ins, y, cx + b - ins, y1, (px, py) => put(px, py, M.TIMBER_D));
        line(cx + a - ins, y, cx - b + ins, y1, (px, py) => put(px, py, M.TIMBER_D));
      } else {
        line(cx - a, y, cx + b, y1, (px, py) => put(px, py, M.TIMBER));
        line(cx + a, y, cx - b, y1, (px, py) => put(px, py, M.TIMBER_D));
      }
      for (let x = -a; x <= a; x++) put(cx + x, y, M.TIMBER);
      y = y1;
    }
    for (let x = -Math.round(hw(firstOpen)); x <= Math.round(hw(firstOpen)); x++) put(cx + x, firstOpen, M.TIMBER_L);
    // Corner posts, doubled low down where the real ones are bundled baulks
    for (let py = top; py <= base; py++) {
      const a = Math.round(hw(py));
      put(cx - a, py, M.TIMBER_L);
      put(cx + a, py, M.TIMBER_D);
      if (py > 56) {
        put(cx - a + 1, py, M.TIMBER);
        put(cx + a - 1, py, M.TIMBER);
      }
    }
    // Far pair of legs under the bottom girder
    for (let py = firstOpen + 1; py <= base; py++) {
      const a = Math.round(hw(py) * 0.46);
      put(cx - a, py, M.TIMBER_D);
      put(cx + a, py, M.TIMBER_D);
    }
    line(cx - Math.round(hw(firstOpen)), firstOpen + 1, cx, base - 3, (px, py) => put(px, py, M.TIMBER_D));
    line(cx + Math.round(hw(firstOpen)), firstOpen + 1, cx, base - 3, (px, py) => put(px, py, M.TIMBER_D));
    // Landings
    for (const ly of [23, 44, 69]) {
      const a = Math.round(hw(ly)) + 1;
      for (let x = -a; x <= a; x++) put(cx + x, ly, M.TIMBER_L);
    }
    // Head and mast
    for (let x = -2; x <= 2; x++) put(cx + x, top, M.TIMBER_L);
    w.rect(cx, 6, 1, 7, M.TIMBER_D);
    w.rect(cx - 1, 9, 3, 1, M.TIMBER_D);
    w.beacons.push([cx, 6], [cx - 3, 44], [cx + 3, 44]);
  };

  // A young London plane as planted on the Rynek in 2022: a slim mottled stem
  // with a tall, upright, open crown that the façades show through.
  const plane = (w, cx, r) => {
    for (let y = 89; y <= 120; y++) w.px(cx, y, (y * 3 + cx) % 5 < 2 ? M.BARK_L : M.BARK);
    for (let y = -11; y <= 9; y++) {
      const half = Math.round(6.4 * Math.sqrt(1 - (y + 1) * (y + 1) / 112) * (y < -3 ? 0.5 + (y + 11) * 0.06 : 1));
      for (let x = -half; x <= half; x++) {
        const v = r();
        // Leaves sit in loose tiers and thin out toward the edge
        if (v < 0.14 + 0.32 * Math.abs(x) / (half + 1) || ((y + 12) % 4 === 0 && x && v < 0.62)) continue;
        w.px(cx + x, 97 + y, x + y < -5 ? M.TREE_L : x > 2 || y > 5 ? M.TREE_D : v > 0.8 ? M.TREE_L : M.TREE);
      }
    }
  };

  const smoothSky = (w, key, ctx) => {
    const stops = SKY[key].map(ctx.rgb);
    const end = PAD_Y + 106;
    const at = (y) => {
      const p = clamp(Math.pow(clamp(y, 0, BH) / end, 1.25)) * 3.999;
      const lo = Math.floor(p);
      return stops[lo].map((v, i) => mix(v, stops[lo + 1][i], p - lo));
    };
    for (let y = 0; y < BH; y++) {
      w.skyLo[key][y] = ctx.pack(at(y));
      w.skyHi[key][y] = ctx.pack(at(y + 4));
    }
  };

  const drawFountain = (w) => {
    const x = 212;
    w.depth = 2;
    // Basin
    for (let i = -10; i <= 10; i++) {
      const dip = Math.abs(i) > 8 ? 1 : 0;
      w.px(x + i, 117 + dip, M.STONE);
      w.px(x + i, 118 + dip, M.STONE_D);
      w.px(x + i, 119 + dip, M.STONE_D);
    }
    w.rect(x - 8, 120, 17, 1, M.STONE_D);
    w.rect(x - 7, 116, 15, 1, M.WATER);
    // Plinth
    w.rect(x - 2, 110, 5, 6, M.STONE);
    w.rect(x + 1, 110, 2, 6, M.STONE_D);
    w.rect(x - 3, 109, 7, 1, M.STONE);
    // Neptune, trident raised
    const map = { N: M.NEPT, D: M.NEPT_D, T: M.TEN_T };
    w.sprite(['....D...', '...DDD..', '.N.DND..', '.N..N...', '.N.NNN..', '.NNNNNN.', '.N.NNN.N', '.N.NNN..', '.N.N.N..', '.N.N.N..', '.N.N.N..', '.N.D.D..'], map, x - 4, 97);
    // The trident itself
    w.px(x - 3, 96, M.NEPT);
    w.px(x - 5, 96, M.NEPT);
    w.px(x - 4, 96, M.NEPT);
    w.px(x - 5, 95, M.NEPT);
    w.px(x - 3, 95, M.NEPT);
    w.px(x - 4, 94, M.NEPT);
    w.px(x - 3, 94, M.BOARD_K);
    w.rect(x - 3, 94, 1, 1, M.NEPT);
    w.px(x - 5, 94, M.NEPT);
    w.lightRect(x - 3, 106, 6, 3, N.FLOOD, w.fountainG);
    w.lightRect(x - 7, 116, 15, 1, N.FLOOD, w.fountainG);
  };

  const drawFountainLive = (w) => {
    const x = 212;
    const tick = Math.floor(w.t * 6);
    const lit = w.levels[w.fountainG] > 0.3;
    // Two thin arcs falling from the plinth into the basin, ripple on the water
    for (let i = 0; i < 6; i++) {
      const dy = 105 + i * 2;
      const off = Math.round(i * i * 0.2) + 3;
      if ((i + tick) % 3 === 0) continue;
      w.px(x - off, dy, M.WATER);
      w.px(x + off, dy, M.WATER);
      if (lit) {
        w.pxLight(x - off, dy, N.FLOOD_HI);
        w.pxLight(x + off, dy, N.FLOOD_HI);
      }
    }
    for (let i = -7; i <= 7; i += 3) if ((i + tick) % 4 === 0) w.px(x + i, 116, M.TEN_T);
  };

  const drawSky = (w, dt, hour) => {
    // The sun comes up through the theatre's globe, climbs behind the Radiostacja and the
    // Ratusz spire to stand over the eastern roofs at noon, then sinks behind the pub's block.
    if (hour < 18.5) {
      const t = clamp((hour - 12) / 6.2);
      const low = smooth(15.4, 17.2, hour);
      w.sun(mix(210, 308, t), mix(16, 72, Math.pow(t, 2.4)), low > 0.3 ? 6 : 5, low);
    } else if (hour > 29.4) {
      const t = clamp((hour - 29.4) / 6.6);
      const low = 1 - smooth(30.6, 32.2, hour);
      w.sun(mix(14, 210, t), mix(72, 16, Math.sqrt(t)), low > 0.3 ? 6 : 5, low);
    }
    // The moon rises over the theatre and slips behind the tower's lattice after midnight.
    if (hour > 18.8 && hour < 29.6) {
      const t = (hour - 18.8) / 10.8;
      w.moon(mix(40, 128, t), 44 - 22 * Math.sin(t * Math.PI));
    }
    w.drawStars();
    // Fair-weather cumulus: flat bases and a few squashed domes each.
    for (const c of w.cumulus) {
      c.x += c.v * dt;
      if (c.x > 372) c.x = -c.w - 44;
      const cx = Math.round(c.x);
      for (let i = 0; i < c.w; i++) {
        let top = 0;
        for (const [at, r] of c.lobes) top = Math.max(top, r * r - (i - at) * (i - at));
        const h = Math.round(Math.sqrt(top) * 0.8);
        for (let j = 0; j <= h; j++) w.pxSky(cx + i, c.y - j, j === 0 || (j === 1 && h > 4) ? M.CLOUD_SH : M.CLOUD);
      }
    }
  };

  // Rynek pigeons peck in front of the Ratusz, flutter off in a loop now and then,
  // all go up together when startled and roost one by one at dusk.
  const drawPigeons = (w, dt, hour) => {
    const map = { B: M.PIGEON, H: M.PIGEON_D };
    for (const b of w.pigeons) {
      const out = hour < 19 + b.p * 0.1 || hour > 30.4 - b.p * 0.1;
      if (w.flush && out && b.u >= 1) b.u = 0;
      if (b.u < 1) {
        b.u = Math.min(1, b.u + dt / b.dur);
        const x = Math.round(b.x + b.dx * (1 - Math.cos(b.u * Math.PI * 2)) / 2);
        const y = Math.round(b.hy - b.h * Math.sin(Math.PI * Math.pow(b.u, 0.6)));
        const wing = Math.sin(w.t * 24 + b.p) > 0 ? -1 : 1;
        w.rect(x, y, 2, 1, M.PIGEON);
        w.px(x - 1, y + wing, M.PIGEON_D);
        w.px(x + 2, y + wing, M.PIGEON_D);
        continue;
      }
      if (!out) continue;
      b.wait -= dt;
      if (b.wait < 0) {
        b.wait = 5 + w.rand() * 20;
        if (w.rand() < 0.4) b.u = 0;
        else {
          b.x = b.hx + Math.round(w.rand() * 4 - 2);
          b.face = !b.face;
        }
      }
      w.sprite(Math.sin(w.t * 4 + b.p) > 0.4 ? ['.B.', 'BBH'] : ['..H', 'BBB'], map, b.x, b.hy - 1, b.face);
    }
    w.flush = false;
  };

  // Guests at the tables: the cafés fill by day, the pub's courtyard stays busy into the night.
  const drawGuests = (w, hour) => {
    for (const [x, y, right, top, from, to] of w.guests) {
      if (from < to ? hour < from || hour >= to : hour < from && hour >= to) continue;
      w.rect(x, y - 6, 2, 1, M.HAIR);
      w.rect(x, y - 5, 2, 1, M.SKIN);
      w.rect(x, y - 4, 2, 4, top);
      w.rect(x, y + 1, 2, 1, M.SUIT);
      // Now and then a cup goes up
      if (Math.sin(w.t * 0.9 + x) > 0.8) w.px(right ? x - 1 : x + 2, y - 4, M.TRIM);
    }
  };

  // A yellow-and-black Metrorower, the metropolitan hire bike: step-through frame, front
  // basket and the yellow panel over the back wheel. It rides right to left.
  const drawMetrorower = (w) => {
    const bx = 370 - Math.round((w.t * 15 + 150) % 450), by = 142;
    for (const cx of [bx, bx + 12]) {
      for (let a = 0; a < Math.PI * 2; a += .3) w.px(cx + Math.round(Math.cos(a) * 3), by + Math.round(Math.sin(a) * 3), M.CAR_DK);
      w.px(cx, by, M.STEEL_LT);
    }
    for (const [x0, y0, x1, y1] of [[0, -1, 2, -6], [2, -5, 6, -1], [6, -1, 8, -6], [6, 0, 11, 0]]) {
      line(bx + x0, by + y0, bx + x1, by + y1, (x, y) => w.px(x, y, M.BOARD_Y));
    }
    w.rect(bx - 2, by - 9, 3, 3, M.BOARD_Y);
    w.rect(bx + 9, by - 5, 5, 2, M.BOARD_Y);
    w.rect(bx + 2, by - 7, 2, 1, M.CAR_DK);
    w.rect(bx + 7, by - 7, 3, 1, M.CAR_DK);
    // Upright rider, as on any town bike
    w.rect(bx + 7, by - 12, 3, 5, M.BOARD_B);
    w.rect(bx + 7, by - 15, 3, 3, M.SKIN);
    w.rect(bx + 7, by - 15, 3, 1, M.HAIR);
    w.px(bx + 9, by - 14, M.HAIR);
    line(bx + 6, by - 10, bx + 4, by - 8, (x, y) => w.px(x, y, M.BOARD_B));
    const step = Math.floor(w.t * 4) % 2;
    line(bx + 7, by - 6, bx + 5 + step * 2, by - 1, (x, y) => w.px(x, y, M.SUIT));
    if (w.dark > 0.3) {
      w.pxLight(bx + 1, by - 5, N.HEAD);
      w.pxLight(bx + 13, by - 4, N.TAIL);
    }
  };

  const windowAt = (w, x, y, width, height, group) => {
    w.rect(x - 1, y - 1, width + 2, height + 2, M.TRIM);
    w.rect(x, y, width, height, M.FGL);
    w.rect(x, y, 1, height, M.FGL_H);
    if (group) w.lightRect(x + 1, y + 1, width - 1, height - 1, N.WARM, group);
    w.rect(x + Math.floor(width / 2), y, 1, height, M.THEATRE_D);
    w.rect(x - 1, y + height, width + 2, 1, M.STONE_D);
  };

  const drawSquare = (w) => {
    // Large pale paving slabs, with a darker granite band across the pedestrian square.
    for (let y = 112; y < 150; y++) for (let x = -40; x < 360; x++) {
      const joint = y % 5 === 0 || (x + (Math.floor(y / 5) % 2) * 6) % 12 === 0;
      w.px(x, y, joint ? M.PAVE_D : M.PAVE);
    }
    w.rect(-40, 135, 400, 2, M.STONE_D);
    w.rect(-40, 137, 400, 1, M.PAVE_D);
  };

  const drawOldTown = (w) => {
    const buildings = [[-40, 24, 77, M.TEN_P, M.TEN_P_D], [86, 26, 76, M.TEN_Y, M.TEN_Y_D],
      [112, 26, 69, M.TEN_G, M.TEN_G_D], [198, 28, 68, M.TEN_P, M.TEN_P_D],
      [226, 23, 77, M.TEN_Y, M.TEN_Y_D], [249, 35, 57, M.TEN_G, M.TEN_G_D],
      [284, 38, 63, M.TEN_P, M.TEN_P_D], [322, 38, 72, M.TEN_Y, M.TEN_Y_D]];
    for (const [x, width, top, wall, shade] of buildings) {
      w.rect(x, top, width, 113 - top, wall);
      w.rect(x + width - 2, top, 2, 113 - top, shade);
      for (let i = 0; i < width; i++) {
        const rise = Math.min(8, Math.floor(Math.min(i, width - 1 - i) * .65));
        w.rect(x + i, top - rise - 2, 1, rise + 2, (i + top) % 4 ? M.TILE_R : M.TILE_D);
      }
      w.rect(x, top, width, 2, M.TRIM);
      w.rect(x, 94, width, 2, M.TRIM);
      for (let y = top + 6; y < 91; y += 13) for (let dx = 5; dx < width - 5; dx += 10) {
        windowAt(w, x + dx, y, 4, 7, w.winGroups[(dx + y + width) % 28]);
        if ((dx + y) % 3 === 0) {
          w.rect(x + dx - 1, y + 8, 6, 1, M.COPPER_D);
          w.rect(x + dx, y + 7, 4, 1, M.BOARD_R);
        }
      }
      w.rect(x + 2, 98, width - 4, 14, M.FGL);
      w.lightRect(x + 3, 99, width - 6, 12, N.WARM_DIM, w.cafeG);
      for (let dx = 9; dx < width - 3; dx += 9) w.rect(x + dx, 98, 1, 14, M.COPPER_D);
    }
    w.hsign(113, 95, 24, 7, 'KAWA', { n: N.B_WHITE, g: w.cafeG, board: M.COPPER_D, off: M.TRIM });
  };

  const drawTownHall = (w) => {
    const x = 139, width = 58;
    w.rect(x, 73, width, 39, M.HALL);
    w.rect(x + 51, 73, 7, 39, M.HALL_SH);
    // Hipped green roof and the slender clock tower of the Rynek Ratusz.
    for (let y = 60; y < 73; y++) {
      const inset = Math.max(0, 8 - (y - 60));
      w.rect(x + inset, y, width - inset * 2, 1, y % 3 ? M.COPPER : M.COPPER_D);
    }
    w.rect(x - 1, 72, width + 2, 2, M.TRIM);
    w.rect(x, 89, width, 1, M.HALL_SH);
    w.rect(x, 108, width, 4, M.HALL_SH);
    for (const dx of [5, 17, 37, 49]) {
      windowAt(w, x + dx, 78, 5, 8, w.winGroups[dx % 28]);
      windowAt(w, x + dx, 95, 5, 8, w.winGroups[(dx + 4) % 28]);
      w.rect(x + dx, 87, 5, 1, M.BOARD_R);
    }
    w.rect(164, 95, 9, 17, M.COPPER_D);
    w.rect(165, 97, 7, 15, M.FGL);
    w.lightRect(165, 97, 7, 14, N.WARM, w.hallG);
    w.rect(168, 97, 1, 15, M.HALL_SH);
    w.rect(159, 112, 19, 1, M.STONE);
    w.rect(157, 113, 23, 1, M.STONE_D);
    w.rect(162, 42, 13, 33, M.HALL);
    w.rect(172, 42, 3, 33, M.HALL_SH);
    w.rect(160, 42, 17, 2, M.TRIM);
    w.rect(160, 56, 17, 2, M.TRIM);
    // The clock is repainted with the selected hour on each frame.
    w.clockAt = [168, 50];
    for (let y = 34; y < 42; y++) {
      const half = Math.max(2, 8 - Math.abs(y - 37));
      w.rect(168 - half, y, half * 2 + 1, 1, M.COPPER_D);
    }
    w.rect(166, 29, 5, 6, M.COPPER);
    w.rect(168, 21, 1, 8, M.COPPER_D);
    w.px(168, 20, M.TRIM);
    w.lightRect(140, 105, 21, 2, N.FLOOD_LO, w.hallG);
    w.lightRect(176, 105, 20, 2, N.FLOOD_LO, w.hallG);
  };

  const drawTheatre = (w) => {
    // Nowy Świat: pale renovated façade, tall balcony windows and its open metal globe.
    w.rect(-17, 67, 101, 46, M.THEATRE);
    w.rect(-17, 67, 101, 2, M.THEATRE_L);
    w.rect(77, 69, 7, 44, M.THEATRE_D);
    w.rect(-17, 90, 101, 2, M.THEATRE_D);
    w.rect(-17, 111, 101, 2, M.STONE_D);
    for (const x of [-11, 2, 15, 28, 41, 54, 67]) {
      windowAt(w, x, 79, 6, 10, w.theatreG);
      w.rect(x - 1, 88, 8, 1, M.COPPER_D);
      for (let dx = 0; dx < 8; dx += 2) w.rect(x - 1 + dx, 87, 1, 3, M.COPPER_D);
      windowAt(w, x, 96, 6, 12, w.theatreG);
    }
    for (let x = -13; x < 78; x += 4) w.rect(x, 70, 2, 2, M.THEATRE_D);
    w.hsign(2, 72, 63, 7, 'TEATR MUZYCZNY', { n: N.LED_SOFT, g: w.theatreG, board: M.THEATRE, off: M.COPPER_D });
    const cx = 33, cy = 54, radius = 11;
    for (let a = 0; a < Math.PI * 2; a += .08) {
      w.px(cx + Math.round(Math.cos(a) * radius), cy + Math.round(Math.sin(a) * radius), M.COPPER_D);
      w.px(cx + Math.round(Math.cos(a) * 5), cy + Math.round(Math.sin(a) * radius), M.COPPER);
      w.px(cx + Math.round(Math.cos(a) * radius), cy + Math.round(Math.sin(a) * 4), M.COPPER);
    }
    w.rect(cx, cy - radius, 1, radius * 2 + 1, M.COPPER_D);
    w.rect(cx - 6, 65, 13, 2, M.THEATRE_D);
    // Glass entrance canopy and a contemporary show poster.
    w.rect(59, 99, 25, 2, M.COPPER_D);
    w.rect(60, 98, 23, 1, M.FGL_H);
    w.rect(80, 101, 1, 12, M.COPPER_D);
    w.rect(48, 97, 8, 13, M.BOARD_P);
    w.rect(49, 99, 6, 2, M.THEATRE_L);
    w.rect(50, 103, 4, 4, M.COPPER_D);
  };

  const drawBeerBrothers = (w) => {
    // A compact storefront and courtyard vignette of Górnych Wałów 30.
    w.rect(249, 91, 73, 23, M.COPPER_D);
    w.hsign(250, 92, 63, 8, 'BEER BROTHERS', { n: N.PUB, g: w.pubG, board: M.COPPER_D, off: M.TRIM });
    w.rect(251, 101, 25, 12, M.ROOM);
    w.lightRect(252, 102, 23, 10, N.BOTTLES, w.pubG);
    w.rect(280, 101, 15, 13, M.ROOM);
    w.lightRect(281, 102, 13, 11, N.WARM, w.pubG);
    w.rect(309, 101, 12, 12, M.ROOM);
    w.lightRect(310, 102, 10, 10, N.WARM_DIM, w.pubG);
    w.rect(286, 101, 1, 13, M.COPPER_D);
    for (const y of [104, 109]) {
      for (let x = 253; x < 274; x += 3) {
        w.rect(x, y - 2, 1, 3, M.BOTTLE);
        w.rect(x, y - 1, 1, 1, (x + y) % 2 ? M.LABEL : M.THEATRE_L);
      }
      w.rect(252, y + 1, 23, 1, M.TIMBER);
    }
    // Tap handles and a street-number plaque by the door keep it legible in the tiny scene.
    for (const x of [312, 316]) {
      w.rect(x, 103, 1, 4, M.STEEL_LT);
      w.px(x - 1, 104, M.STEEL_LT);
      w.px(x, 102, M.LABEL);
    }
    w.rect(309, 109, 11, 2, M.TIMBER);
    w.hsign(297, 102, 9, 7, '30', { n: N.LED_SOFT, g: w.pubG, board: M.THEATRE_L, off: M.COPPER_D });
  };

  const terrace = (w, x, y, umbrella) => {
    w.rect(x + 6, y - 9, 1, 12, M.CHAIR);
    for (let dx = -2; dx <= 14; dx++) {
      const top = y - 11 + Math.floor(Math.abs(dx - 6) / 4);
      w.rect(x + dx, top, 1, y - 7 - top, umbrella);
    }
    w.rect(x + 2, y, 9, 1, M.TIMBER);
    w.rect(x + 6, y + 1, 1, 4, M.CHAIR);
    for (const dx of [0, 12]) {
      w.rect(x + dx, y - 1, 1, 5, M.CHAIR);
      w.rect(x + dx - 1, y + 2, 3, 1, M.CHAIR);
    }
    w.px(x + 4, y - 1, M.TRIM);
    w.px(x + 8, y - 1, M.LABEL);
  };

  const build = (w, ctx) => {
    M = ctx.M; N = ctx.N;
    for (let key = NOON; key <= DAWN; key++) smoothSky(w, key, ctx);
    w.noSignal = true;
    w.walkTop = 118;
    w.roadTop = 137;
    w.rainFloor = 149;
    w.pubG = w.addGroup(17, 26, 'room');
    w.cafeG = w.addGroup(17, 24, 'room');
    w.theatreG = w.addGroup(17.7, 24, 'room');
    w.hallG = w.addGroup(18.1, 30, 'room');
    w.towerG = w.addGroup(18.3, 29.2, 'room');
    w.fountainG = w.addGroup(18.3, 27, 'room');
    w.depth = 0;
    for (let x = -40; x < 360; x += 17) w.rect(x, 94 + Math.abs(x % 9), 16, 24, M.FAR1);
    drawRadioTower(w);
    w.depth = 2;
    drawSquare(w);
    drawOldTown(w);
    drawTheatre(w);
    drawTownHall(w);
    drawBeerBrothers(w);
    drawFountain(w);
    terrace(w, 99, 121, M.TRIM);
    terrace(w, 124, 122, M.TRIM);
    terrace(w, 260, 122, M.COPPER);
    terrace(w, 291, 122, M.TRIM);
    for (const x of [86, 233, 342]) {
      plane(w, x + 3, rng(x));
      w.rect(x - 2, 118, 11, 5, M.PLANTER);
      w.rect(x - 2, 118, 11, 1, M.LEAF);
    }
    for (const x of [75, 224, 332]) {
      w.rect(x, 91, 1, 32, M.COPPER_D);
      w.rect(x - 3, 89, 7, 2, M.COPPER_D);
      w.lightRect(x - 2, 91, 5, 1, N.LED_SOFT, w.hallG);
    }
    // Warm festoon lights over the pub's courtyard.
    w.wire(247, 113, 322, 113, 3, M.COPPER_D);
    for (let x = 249; x < 321; x += 6) w.tube(x, w.wireY(247, 113, 322, 113, 3, x) + 1, M.TRIM, N.PUB, w.pubG);
    w.cumulus = [{ x: -18, y: 32, w: 30, v: .8, lobes: [[6, 6], [14, 10], [23, 7]] },
      { x: 116, y: 13, w: 19, v: .5, lobes: [[5, 5], [12, 7]] },
      { x: 246, y: 38, w: 37, v: .65, lobes: [[7, 6], [16, 9], [25, 11], [32, 5]] }];
    const sr = rng(1257);
    w.stars = Array.from({ length: 24 }, () => [Math.floor(sr() * 290) + 14, Math.floor(sr() * 50) - 4, sr() * 6.28]);
    w.cat.x = 240; w.cat.y = 127;
    // Walk lanes stay in front of the terraces, planters and fountain, whose feet end at y 126.
    for (const [x, y, dir, speed, style, nightOnly] of [[18, 130, 1, 5, 'coat'], [78, 133, -1, 6, 'linen'],
      [146, 131, 1, 4, 'rust'], [201, 134, -1, 5, 'shirt'], [278, 132, 1, 4, 'coat'], [310, 130, -1, 5, 'suit'],
      [112, 132, -1, 3, 'rust', true], [236, 133, 1, 3.5, 'linen', true], [330, 131, -1, 4.5, 'teal', true]]) {
      w.peds.push({ x, y, dir, speed, style, nightOnly, phase: x % 3 });
    }
    w.personStyles.coat = [M.COPPER_D, M.SUIT, M.HAIR];
    w.personStyles.linen = [M.TEN_T, M.TIMBER_D, M.TIMBER];
    w.personStyles.rust = [M.TILE_R, M.SUIT, M.HAIR];
    w.personStyles.teal = [M.NEPT_D, M.STONE_D, M.TIMBER_D];
    // The paving between the Ratusz steps, the terraces and the fountain is clear of every lane.
    const pr = rng(1794);
    w.pigeons = [[143, 118], [147, 116], [152, 119], [185, 117], [189, 119], [193, 116], [196, 118]].map(([hx, hy], i) => ({
      hx, hy, x: hx, u: 1, dur: 2 + pr(), dx: (hx < 170 ? 1 : -1) * (8 + pr() * 13), h: 13 + pr() * 14, wait: 3 + pr() * 20, p: pr() * 6, face: i % 2 > 0,
    }));
    // x of the left pixel, table height, faces left, top, arrives, leaves
    w.guests = [[100, 121, 0, M.TILE_R, 32.5, 21.5], [109, 121, 1, M.NEPT_D, 33.2, 20.6], [125, 122, 0, M.BOARD_B, 34, 22.3],
      [261, 122, 0, M.TIMBER_L, 31.8, 25.2], [270, 122, 1, M.TEN_T, 17.2, 25.6], [292, 122, 0, M.COAT, 18, 25.9], [301, 122, 1, M.TILE_R, 18.4, 24.8]];
  };

  const draw = (w, dt, hour) => {
    drawSky(w, dt, hour);
    w.drawBeacons();
    // Clock hands follow the hour selected by the lens.
    const [cx, cy] = w.clockAt;
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      if (dx * dx + dy * dy <= 16) w.tube(cx + dx, cy + dy, M.TRIM, N.LED_SOFT, w.hallG);
    }
    const minute = (hour % 1) * Math.PI * 2 - Math.PI / 2;
    const hand = (hour % 12) / 12 * Math.PI * 2 - Math.PI / 2;
    line(cx, cy, cx + Math.round(Math.cos(minute) * 3), cy + Math.round(Math.sin(minute) * 3), (x, y) => w.px(x, y, M.COPPER_D));
    line(cx, cy, cx + Math.round(Math.cos(hand) * 2), cy + Math.round(Math.sin(hand) * 2), (x, y) => w.px(x, y, M.COPPER_D));
    drawFountainLive(w);
    drawGuests(w, hour);
    drawPigeons(w, dt, hour);
    // The cat dozes behind the walk lanes, so people pass in front of it.
    w.drawCat(dt, hour);
    w.drawPeople(dt, hour);
    drawMetrorower(w);
  };

  CitySwitch.define('gliwice-switch', {
    city: 'Gliwice', label: 'Gliwice day and night',
    tube: ['#efbd76', '#a1d5cf'], body: ['#e8e8df', '#111c25'], glass: 'clear',
    sky: SKY, grade, palette, build, draw,
    glyphs: { W: ['#...#', '#...#', '#.#.#', '#.#.#', '.#.#.'] },
    street: (M) => [M.PAVE, M.PAVE_D, M.STONE, M.STONE_D],
    weather: (h) => ({ wet: .32 * smooth(18.7, 20, h) * (1 - smooth(29, 31, h)) }),
    post: (w) => w.reflect(),
    startle: (w) => { w.cat.puff = 1.4; w.flush = true; },
  });
})();
