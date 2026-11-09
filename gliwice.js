/* gliwice-switch — Upper Silesia after the shift: red brick, larch and coal, sodium in the drizzle. */
(() => {
  const NOON = 0,
    GOLD = 1,
    DUSK = 2,
    NIGHT = 3,
    DAWN = 4;
  const PAD_X = 40;
  const PAD_Y = 40;
  const BW = 400;
  const BH = 190;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, x) => {
    const t = clamp((x - a) / (b - a));
    return t * t * (3 - 2 * t);
  };
  const rng = (seed) => () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const line = (x0, y0, x1, y1, cb) => {
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      cb(x0, y0);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x0 += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y0 += sy;
      }
    }
  };

  let M, N;

  const SKY = [
    // Never quite clear: milky, going yellow toward the works
    ['#a2bccb', '#aec7d4', '#c0d3d8', '#d3dcd4', '#e5e0c0'],
    ['#86a0aa', '#a4a89e', '#c9ab88', '#e0a468', '#ef9c50'],
    ['#3a3440', '#5c3f47', '#8e4f4f', '#b65c41', '#d6753a'],
    ['#110d0b', '#16100e', '#22160f', '#4a2a14', '#a8581c'],
    ['#3d4450', '#6c6a70', '#a58a84', '#d0a68c', '#e8c498'],
  ];

  // Soot, not moonlight: nights grade toward brown and everything stays a little lit by sodium
  const grade = [
    ([r, g, b]) => [r, g, b],
    ([r, g, b]) => [r * 1.02 + 0.03, g * 0.8 + 0.01, b * 0.6],
    ([r, g, b]) => [r * 0.56 + 0.05, g * 0.37 + 0.025, b * 0.34 + 0.04],
    ([r, g, b]) => [r * 0.27 + 0.04, g * 0.18 + 0.028, b * 0.12 + 0.022],
    ([r, g, b]) => [r * 0.62 + 0.05, g * 0.52 + 0.03, b * 0.56 + 0.06],
  ];

  const palette = ({ mat, neon }) => {
    // Haze
    mat('FAR1', '#c2c5b4', { [GOLD]: '#d8a884', [DUSK]: '#85504a', [NIGHT]: '#4a2a14', [DAWN]: '#a8928a' });
    mat('FAR2', '#a9ae9f', { [GOLD]: '#bb8d72', [DUSK]: '#6c4442', [NIGHT]: '#3a2212', [DAWN]: '#8f7f7c' });
    mat('FAR3', '#8f9488', { [GOLD]: '#9a7562', [DUSK]: '#57383a', [NIGHT]: '#2a1a10', [DAWN]: '#756b6c' });
    mat('FAR_BRK', '#94675a', { [GOLD]: '#a8654a', [DUSK]: '#5f3634', [NIGHT]: '#2f1a10', [DAWN]: '#7c5c58' });
    mat('CLOUD', '#dfe0d4', { [GOLD]: '#e0ac86', [DUSK]: '#a8645e', [NIGHT]: '#3c2618', [DAWN]: '#c4a096' });
    mat('CLOUD_SH', '#cdd2c8', { [GOLD]: '#c98f70', [DUSK]: '#8a5050', [NIGHT]: '#2e1d14', [DAWN]: '#a68a86' });
    mat('SMOKE', '#d5d2c6', { [GOLD]: '#d8a080', [DUSK]: '#9a6660', [NIGHT]: '#5c3a22', [DAWN]: '#b4a29a' });
    mat('SMOKE_D', '#b6b4aa', { [GOLD]: '#b68468', [DUSK]: '#7c5250', [NIGHT]: '#452c1b', [DAWN]: '#968a86' });
    mat('MOON', '#e6b47a', { [DUSK]: '#e8b488' });
    mat('MOON_DK', '#c08c58', { [DUSK]: '#c89470' });
    // Street
    mat('ROAD', '#56524f', { [NIGHT]: '#1a1310' });
    mat('ROAD_D', '#4c4845', { [NIGHT]: '#150f0d' });
    mat('ROAD_L', '#615d59', { [NIGHT]: '#201814' });
    mat('LINE', '#d9d4c4', { [NIGHT]: '#5a4a3a' });
    mat('CURB', '#9d978a', { [NIGHT]: '#3a2c22' });
    mat('WALK', '#8c4536', { [NIGHT]: '#2e1812' });
    mat('WALK_D', '#773829', { [NIGHT]: '#26130e' });
    mat('COBBLE', '#6a655f', { [NIGHT]: '#241b16' });
    mat('COBBLE_D', '#55514c', { [NIGHT]: '#1c1511' });
    mat('MANHOLE', '#3e3a37', { [NIGHT]: '#120d0b' });
    mat('POLE', '#5c5a52', { [NIGHT]: '#2a2018' });
    mat('POLE_DK', '#45433d', { [NIGHT]: '#1e1712' });
    mat('LAMP_OFF', '#3b3a36', { [NIGHT]: '#1a1410' });
    mat('WIRE', '#3b3a38', { [NIGHT]: '#120d0a' });
    mat('TUBE', '#c9c4b2', { [NIGHT]: '#4a382a' });
    mat('BOARD_K', '#26211e', { [NIGHT]: '#120d0a', [DUSK]: '#1e1512' });
    mat('PAINT_K', '#1a1716', { [NIGHT]: '#0c0908' });
    // Brick
    mat('BRK', '#7a3227', { [NIGHT]: '#2a120c' });
    mat('BRK_M', '#6c2b22', { [NIGHT]: '#250f0a' });
    mat('BRK_L', '#92452f', { [NIGHT]: '#34170e' });
    mat('BRK_S', '#4a2320', { [NIGHT]: '#1b0c09' });
    mat('BRK_BAND', '#3f1c1a', { [NIGHT]: '#170a08' });
    mat('BRK_Y', '#a8704a', { [NIGHT]: '#3a2012' });
    mat('FRAME', '#dc2219', { [GOLD]: '#e23a1c', [DUSK]: '#a0261c', [NIGHT]: '#6e1a12', [DAWN]: '#b02a20' });
    mat('FRAME_D', '#a01612', { [NIGHT]: '#4a120c' });
    mat('FGL', '#37444c', { [GOLD]: '#b47a48', [DUSK]: '#57384a', [NIGHT]: '#150f0d', [DAWN]: '#8a6a6c' });
    mat('FGL_H', '#8aa2ac', { [GOLD]: '#f0b870', [DUSK]: '#8a5a60', [NIGHT]: '#231914', [DAWN]: '#c49a92' });
    mat('CURTAIN', '#ece7d8', { [NIGHT]: '#4a3a2c' });
    mat('STONE', '#a39a88', { [NIGHT]: '#3a2c20' });
    mat('STONE_D', '#7f7768', { [NIGHT]: '#2a1e16' });
    mat('TERRA', '#b5602e');
    mat('LEAF', '#3f7a33', { [NIGHT]: '#16240f' });
    mat('GERAN', '#ee2b2b', { [NIGHT]: '#5e1a12' });
    mat('GERAN_P', '#f06088', { [NIGHT]: '#5e2a2a' });
    mat('ROOFD', '#3d3836', { [NIGHT]: '#1a1310' });
    mat('ROOFL', '#4c4643', { [NIGHT]: '#211814' });
    mat('ZINC', '#878a85', { [NIGHT]: '#31271f' });
    // Yard
    mat('SHED', '#5d4630', { [NIGHT]: '#1f150e' });
    mat('SHED_D', '#47341f', { [NIGHT]: '#170f0a' });
    mat('SHED_L', '#6f5639', { [NIGHT]: '#281b12' });
    mat('TAR', '#2c2926', { [NIGHT]: '#120e0c' });
    mat('COAL', '#1b1a1c', { [NIGHT]: '#0c0a09' });
    mat('COAL_H', '#3d3c42', { [NIGHT]: '#1a1614' });
    mat('RUST', '#7c4a2c', { [NIGHT]: '#2c1a10' });
    mat('DIRT', '#6e6253', { [NIGHT]: '#241a13' });
    mat('RUG', '#a03a2c', { [NIGHT]: '#361610' });
    mat('RUG_L', '#d8b060', { [NIGHT]: '#4a3620' });
    mat('LOFT', '#4f7a52', { [NIGHT]: '#1c2616' });
    mat('LOFT_L', '#d8d2bc', { [NIGHT]: '#3a2e22' });
    // Radio tower: larch gone dark with age
    mat('TIMBER', '#5a3a22', { [GOLD]: '#5e3218', [DUSK]: '#3a2018', [NIGHT]: '#2a1a10', [DAWN]: '#4a3028' });
    mat('TIMBER_D', '#422a18', { [GOLD]: '#472412', [DUSK]: '#2c1812', [NIGHT]: '#1e130b', [DAWN]: '#3a2520' });
    mat('TIMBER_L', '#785232', { [GOLD]: '#8a4e26', [DUSK]: '#4a2a1e', [NIGHT]: '#35210f', [DAWN]: '#5e4034' });
    mat('TREE', '#35592e', { [GOLD]: '#4a5726', [DUSK]: '#2c3226', [NIGHT]: '#121c0e', [DAWN]: '#34443a' });
    mat('TREE_D', '#26452a', { [GOLD]: '#384620', [DUSK]: '#222a22', [NIGHT]: '#0d150b', [DAWN]: '#283830' });
    mat('TREE_L', '#4b7238', { [GOLD]: '#6e6c2c', [DUSK]: '#3a3a2a', [NIGHT]: '#1a2612', [DAWN]: '#445444' });
    mat('BIRCH', '#d6d2c4', { [NIGHT]: '#3a2c20' });
    // Victoria theatre
    mat('RUIN', '#a39480', { [GOLD]: '#c29a70', [DUSK]: '#6e5048', [NIGHT]: '#2e2018', [DAWN]: '#8a7a72' });
    mat('RUIN_D', '#857867', { [GOLD]: '#a07e5c', [DUSK]: '#583e3a', [NIGHT]: '#221710', [DAWN]: '#6e625c' });
    mat('RUIN_L', '#bcae98', { [GOLD]: '#dcb284', [DUSK]: '#80605a', [NIGHT]: '#3a2a1e', [DAWN]: '#a09084' });
    mat('RUIN_BRK', '#86503a', { [NIGHT]: '#2e1810' });
    mat('RUIN_BK', '#6c6050', { [GOLD]: '#88684c', [DUSK]: '#463230', [NIGHT]: '#1e140e', [DAWN]: '#5a4e4a' });
    // Rynek
    mat('TEN_Y', '#e2cb8c', { [NIGHT]: '#4c3a24' });
    mat('TEN_Y_D', '#c6ae72', { [NIGHT]: '#3a2c1c' });
    mat('TEN_G', '#b4c8a4', { [NIGHT]: '#3e3c28' });
    mat('TEN_G_D', '#98ad88', { [NIGHT]: '#2e2e1e' });
    mat('TEN_P', '#deaa98', { [NIGHT]: '#4a2e24' });
    mat('TEN_P_D', '#c28e7c', { [NIGHT]: '#38221a' });
    mat('TEN_T', '#f0ead8', { [NIGHT]: '#57452f' });
    mat('TILE_R', '#94442e', { [NIGHT]: '#2a140e' });
    mat('NEPT', '#93b5a4', { [GOLD]: '#b0aa78', [DUSK]: '#60665a', [NIGHT]: '#3e4232', [DAWN]: '#7c9088' });
    mat('NEPT_D', '#66897a', { [NIGHT]: '#282a20' });
    mat('WATER', '#9fc0c8', { [NIGHT]: '#4a3a2c' });
    // Mine
    mat('IRON', '#4a4644', { [GOLD]: '#463630', [DUSK]: '#2e2428', [NIGHT]: '#1c1410', [DAWN]: '#40383c' });
    mat('IRON_D', '#34302f', { [GOLD]: '#32261f', [DUSK]: '#221b1e', [NIGHT]: '#140e0b', [DAWN]: '#2e282c' });
    mat('IRON_L', '#65605c', { [GOLD]: '#6a4c40', [DUSK]: '#40343a', [NIGHT]: '#281c15', [DAWN]: '#564c50' });
    mat('WHEEL', '#312d2c', { [GOLD]: '#2c211c', [DUSK]: '#1e181c', [NIGHT]: '#5a3a24', [DAWN]: '#2a2428' });
    mat('WHEEL_M', '#c9a24a', { [NIGHT]: '#a06c34' });
    mat('GALL', '#79756a', { [GOLD]: '#8a6a50', [DUSK]: '#4c3c3e', [NIGHT]: '#241a13', [DAWN]: '#65606a' });
    mat('GALL_D', '#5e5a52', { [GOLD]: '#6a5040', [DUSK]: '#3a2e30', [NIGHT]: '#19120e', [DAWN]: '#4e4a52' });
    mat('HALDA', '#55504d', { [GOLD]: '#5e4a40', [DUSK]: '#37292c', [NIGHT]: '#1d140e', [DAWN]: '#4c4448' });
    mat('HALDA_L', '#67615c', { [GOLD]: '#755c4c', [DUSK]: '#463438', [NIGHT]: '#261a12', [DAWN]: '#5a5256' });
    mat('MINEGL', '#42504f', { [GOLD]: '#c28a50', [DUSK]: '#5a404c', [NIGHT]: '#1a1310', [DAWN]: '#8e7070' });
    mat('EMB', '#5d6547', { [GOLD]: '#6a5e38', [DUSK]: '#3a3230', [NIGHT]: '#17120c', [DAWN]: '#4e5048' });
    mat('RAILM', '#3e3c3a', { [NIGHT]: '#1c1410' });
    mat('CONC', '#b4ae9e', { [GOLD]: '#b8926c', [DUSK]: '#6e504a', [NIGHT]: '#3a2616', [DAWN]: '#938378' });
    mat('CONC_DK', '#938d7f', { [GOLD]: '#997858', [DUSK]: '#57403c', [NIGHT]: '#2c1c12', [DAWN]: '#7a6c64' });
    mat('ARENA', '#d3d5cf', { [GOLD]: '#dcb490', [DUSK]: '#8c6660', [NIGHT]: '#4a3020', [DAWN]: '#ab9c96' });
    mat('ARENA_D', '#a9aca8', { [GOLD]: '#b4906e', [DUSK]: '#6c4c4a', [NIGHT]: '#361f14', [DAWN]: '#8a7c7a' });
    // PRL block
    mat('PANEL', '#a39e91', { [NIGHT]: '#2e231a' });
    mat('PANEL_D', '#8a8578', { [NIGHT]: '#231a13' });
    mat('PLAST', '#b8ae98', { [NIGHT]: '#35281c' });
    mat('PLAST_D', '#988e7a', { [NIGHT]: '#281d14' });
    mat('AWN', '#7c2a22', { [NIGHT]: '#2e120c' });
    // Enamel sign boards: the street's colour by day, gone at night so only the glass is left
    mat('FAJ_OFF', '#dcc8ae', { [GOLD]: '#b4917a', [DUSK]: '#6e5048', [NIGHT]: '#4a3226', [DAWN]: '#a08c7c' });
    mat('EN_R', '#8a2a20', { [NIGHT]: '#1c0a07', [DUSK]: '#40140f' });
    mat('EN_B', '#2a5478', { [NIGHT]: '#0c1216', [DUSK]: '#1c2a38' });
    mat('EN_G', '#1f6e48', { [NIGHT]: '#08140d', [DUSK]: '#123022' });
    mat('EN_O', '#9a7228', { [NIGHT]: '#1a120a', [DUSK]: '#463416' });
    mat('EN_P', '#8c4664', { [NIGHT]: '#1a0c12', [DUSK]: '#42202e' });
    mat('EN_T', '#1e5a62', { [NIGHT]: '#091315', [DUSK]: '#122c30' });
    mat('EN_W', '#6c4620', { [NIGHT]: '#170e08', [DUSK]: '#32200f' });
    // Vehicles
    mat('TIRE', '#17161a');
    mat('CAR_K', '#2b2a2c', { [NIGHT]: '#4a4038' });
    mat('CAR_R', '#a83a2c', { [NIGHT]: '#6e2a1c' });
    mat('CAR_W', '#e0ddd4', { [NIGHT]: '#8f8478' });
    mat('CAR_B', '#3e5f7c', { [NIGHT]: '#3e4a50' });
    mat('CAR_G', '#5c6e54', { [NIGHT]: '#3e4634' });
    mat('CAR_Y', '#dcc48a', { [NIGHT]: '#90805c' });
    mat('CAR_DK', '#15141a', { [NIGHT]: '#1e1812' });
    mat('CAR_GLASS', '#7f9aa8', { [NIGHT]: '#2a2a2c' });
    mat('BUS', '#d4d2c8', { [NIGHT]: '#8a8074' });
    mat('BUS_D', '#7d7f7c', { [NIGHT]: '#4a443c' });
    mat('BELLOW', '#2a2826', { [NIGHT]: '#16110e' });
    mat('TR_Y', '#e6bc2c', { [GOLD]: '#efb03a', [DUSK]: '#94742e', [NIGHT]: '#6e5a26', [DAWN]: '#b89a48' });
    mat('TR_B', '#6e8494', { [GOLD]: '#8a7c7a', [DUSK]: '#4c4a56', [NIGHT]: '#2e2c2a', [DAWN]: '#60687a' });
    mat('TR_D', '#3a4048', { [NIGHT]: '#14100e' });
    // People
    mat('SKIN', '#e6bd98', { [NIGHT]: '#7a5c44' });
    mat('HAIR', '#2c2622', { [NIGHT]: '#161210' });
    mat('GREYH', '#c7c3bb', { [NIGHT]: '#5c5248' });
    mat('MINER', '#2e3440', { [NIGHT]: '#3a3638' });
    mat('HIVIZ', '#e08428', { [NIGHT]: '#a0621e' });
    mat('HELM', '#f0ede0', { [NIGHT]: '#b4ac96' });
    mat('TIN', '#9aa0a0', { [NIGHT]: '#5a564e' });
    mat('COAT', '#6a5a48', { [NIGHT]: '#4a3e32' });
    mat('COAT_R', '#9a3a30', { [NIGHT]: '#6a2a20' });
    mat('COAT_G', '#4a6450', { [NIGHT]: '#3a4436' });
    mat('COAT_B', '#3c4e6a', { [NIGHT]: '#38404a' });
    mat('PANTS', '#2c3040', { [NIGHT]: '#26221f' });
    mat('PACK_R', '#c8402c', { [NIGHT]: '#6a2a1e' });
    mat('PACK_B', '#2c74b8', { [NIGHT]: '#2a4a60' });
    mat('PACK_Y', '#e0b030', { [NIGHT]: '#7c6428' });
    mat('UMB', '#3a3f48', { [NIGHT]: '#4a3e38', [DUSK]: '#463a40' });
    mat('APRON', '#5a5a86', { [NIGHT]: '#2a2630' });
    mat('CUSHION', '#e6dcb4', { [GOLD]: '#efd09a' });
    mat('DOG', '#7a5230', { [NIGHT]: '#3e2a1a' });
    mat('DOG_D', '#54361f', { [NIGHT]: '#2a1c12' });
    mat('PIGEON', '#ece9e0', { [GOLD]: '#f0d4b0', [DUSK]: '#a88a84', [NIGHT]: '#4a3a2c' });
    mat('PIGEON_D', '#646d78', { [GOLD]: '#5a5050', [DUSK]: '#3e3438', [NIGHT]: '#241b14' });
    mat('CAT_W', '#e6dfd2', { [NIGHT]: '#6a5c4c' });
    mat('CAT_O', '#2a2622', { [NIGHT]: '#1a1512' });
    mat('CAT_K', '#1e1b18');

    neon('MOON_GLOW', '#e8bc84', '#c07830', 0.16);
    neon('SUN', '#fff4cf', '#ffdc9a', 0.3);
    neon('SUN_LOW', '#ffc070', '#ff6420', 0.7);
    neon('SODIUM', '#ffc476', '#ff7a14', 0.75);
    neon('SODIUM_HOT', '#ffe2a8', '#ff8a20', 0.9);
    neon('POOL', '#4e2a14', '#ff7a14', 0.03);
    neon('POOL_L', '#6e3c1a', '#ff7a14', 0.05);
    neon('FLOOD_LO', '#6e4424', '#c06a20', 0.05);
    neon('FLOOD', '#a8693a', '#e88030', 0.1);
    neon('FLOOD_HI', '#d89a5c', '#ff9a40', 0.17);
    neon('RUIN_LO', '#8a5428', '#d87020', 0.12);
    neon('RUIN_HI', '#cc8a48', '#ff8a30', 0.18);
    neon('KITCHEN', '#f0bc6c', '#ff9a30', 0.16);
    neon('KITCHEN_D', '#d89c58', '#c06a20', 0.1);
    neon('BARLOW', '#7c4e26', '#c06a20', 0.05);
    neon('TV', '#6a8cae', '#5090d0', 0.1);
    neon('MINEWIN', '#f0dc98', '#ffc050', 0.26);
    neon('CAGE', '#ffe0a0', '#ffb040', 0.6);
    neon('MON', '#a8e8ff', '#50c0ff', 0.22);
    neon('MON_D', '#3c6c88', '#2a7aa8', 0.06);
    neon('FAJ', '#fff0da', '#ff4a10', 1);
    neon('RED_T', '#ffc8b8', '#ff2418', 1);
    neon('COLD', '#d8f4ff', '#46c8ff', 1);
    neon('GRN', '#d4ffdd', '#14e070', 0.9);
    neon('AMBER', '#ffe8b0', '#ffa020', 0.9);
    neon('ROSE', '#ffd4e0', '#ff4a88', 0.85);
    neon('YEL', '#fff2bc', '#ffc81a', 0.85);
    neon('WHT', '#ffffff', '#e8e4d8', 0.7);
    neon('ROLL', '#ffb078', '#ff6a20', 0.85);
    neon('CABBAGE', '#e890c0', '#c02878', 0.85);
    neon('BEER', '#f0a828', '#ff9a14', 0.5);
    neon('FOAM', '#fffbe8', '#ffe8c0', 0.45);
    neon('BUSWIN', '#d6c48c', '#ffd890', 0.14);
    neon('FARCAR', '#fff0c8', '#ffe0a0', 0.5);
    neon('FARTAIL', '#ff5040', '#ff1a10', 0.5);
    neon('ARENA_L', '#cfe4ee', '#a0d0f0', 0.25);
    neon('EMBERP', '#ffb060', '#ff5a10', 0.5);
  };

  // ---- Paint helpers
  const brickWall = (w, x0, y0, W, H, r, soot = 0.12) => {
    for (let y = y0; y < y0 + H; y++) {
      for (let x = x0; x < x0 + W; x++) {
        const off = (y >> 1) % 2 ? 2 : 0;
        const joint = y % 2 === 1 || (x + off) % 4 === 0;
        const v = r();
        // Soot runs down from the eaves
        const s = soot * (1.4 - ((y - y0) / H) * 0.9);
        let m = joint ? M.BRK_M : M.BRK;
        if (v < s) m = M.BRK_S;
        else if (v > 0.97) m = M.BRK_L;
        w.px(x, y, m);
      }
    }
  };

  const ptext = (w, text, x, y, m) => {
    let cx = x;
    for (const c of text) {
      const g = w.fontRows(c);
      const dy = Math.floor((5 - g.length) / 2);
      w.glyph(c, cx, y + dy, (px, py) => w.px(px, py, m));
      cx += g[0].length + 1;
    }
  };

  // Light one letter of a sign differently: dead (group 0) or on its own bad contact
  const relight = (w, x, y, W, H, text, idx, n, g, font, gap = 1) => {
    const chars = [...text];
    const widths = chars.map((c) => w.fontRows(c, font)[0].length);
    const total = widths.reduce((a, b) => a + b + gap, -gap);
    let cx = x + Math.floor((W - total) / 2);
    chars.forEach((c, i) => {
      if (i === idx) w.glyph(c, cx, y + Math.floor((H - w.fontRows(c, font).length) / 2), (px, py) => w.light(px, py, n, g), font);
      cx += widths[i] + gap;
    });
  };

  // A familok window: red frame, segmental brick arch, stone sill, sometimes lace and geraniums
  const famWindow = (w, x, y, o = {}) => {
    const { n = 0, g = 0, lace = false, pots = 0, open = false } = o;
    w.rect(x - 1, y - 2, 9, 1, M.BRK_L);
    w.rect(x + 1, y - 3, 5, 1, M.BRK_L);
    w.rect(x - 1, y - 1, 9, 1, M.BRK_S);
    w.rect(x, y, 7, 10, M.FRAME);
    w.rect(x + 6, y, 1, 10, M.FRAME_D);
    for (const px of [x + 1, x + 4]) {
      w.rect(px, y + 1, 2, 2, M.FGL);
      w.rect(px, y + 4, 2, 5, M.FGL);
      if (!open) w.px(px, y + 4, M.FGL_H);
      w.px(px, y + 1, M.FGL_H);
      if (n && g) {
        w.lightRect(px, y + 1, 2, 2, n, g);
        w.lightRect(px, y + 4, 2, 5, n, g);
      }
      if (lace) {
        w.rect(px, y + 4, 2, 2, M.CURTAIN);
        if (n && g) w.lightRect(px, y + 4, 2, 2, N.KITCHEN_D, g);
      }
    }
    w.rect(x - 1, y + 10, 9, 1, M.STONE);
    w.rect(x - 1, y + 11, 9, 1, M.BRK_S);
    if (pots) {
      const xs = pots === 1 ? [x + 3] : pots === 2 ? [x + 1, x + 5] : [x, x + 3, x + 6];
      xs.forEach((px, i) => {
        w.px(px, y + 9, M.TERRA);
        w.px(px, y + 8, M.LEAF);
        w.px(px, y + 7, (i + x) % 3 === 0 ? M.GERAN_P : M.GERAN);
        if ((i + x) % 2) w.px(px + 1, y + 8, M.LEAF);
      });
    }
  };

  const famDoor = (w, x) => {
    const y = 102;
    w.rect(x - 1, y - 3, 9, 19, M.BRK_L);
    w.rect(x + 1, y - 4, 5, 1, M.BRK_L);
    w.rect(x, y - 2, 7, 18, M.FRAME_D);
    w.rect(x + 1, y - 1, 5, 2, M.FGL);
    w.rect(x, y + 1, 7, 15, M.FRAME);
    w.rect(x + 3, y + 1, 1, 15, M.FRAME_D);
    w.rect(x + 1, y + 3, 1, 4, M.FRAME_D);
    w.rect(x + 5, y + 3, 1, 4, M.FRAME_D);
    w.rect(x + 1, y + 9, 1, 5, M.FRAME_D);
    w.rect(x + 5, y + 9, 1, 5, M.FRAME_D);
    w.px(x + 2, y + 8, M.STONE);
    w.rect(x - 2, 117, 11, 1, M.STONE);
    w.rect(x + 3, y - 6, 2, 2, M.CURTAIN);
  };

  const chimney = (w, x, top, base, wd = 5) => {
    for (let y = top; y < base; y++) for (let i = 0; i < wd; i++) w.px(x + i, y, (y + i) % 3 === 0 ? M.BRK_S : i === wd - 1 ? M.BRK_BAND : M.BRK_M);
    w.rect(x - 1, top, wd + 2, 1, M.BRK_S);
    w.rect(x, top - 1, 2, 1, M.RUST);
    w.rect(x + wd - 2, top - 1, 1, 1, M.RUST);
  };

  // One long block of a workers' row. Three storeys, dark band between floors.
  const familok = (w, x0, x1, r, door) => {
    const top = 64;
    for (let y = 54; y < top; y++) {
      for (let x = x0; x < x1; x++) {
        const shingle = (x + (y % 2) * 2) % 4 === 0;
        w.px(x, y, y === 54 ? M.ROOFL : y % 2 ? M.ROOFD : shingle ? M.ROOFD : M.ROOFL);
      }
    }
    w.rect(x0, 63, x1 - x0, 1, M.ZINC);
    brickWall(w, x0, top, x1 - x0, 118 - top, r);
    w.rect(x0, top, x1 - x0, 2, M.BRK_BAND);
    w.rect(x0, 79, x1 - x0, 1, M.BRK_BAND);
    w.rect(x0, 80, x1 - x0, 1, M.BRK_L);
    w.rect(x0, 81, x1 - x0, 1, M.BRK_BAND);
    w.rect(x0, 96, x1 - x0, 1, M.BRK_BAND);
    w.rect(x0, 97, x1 - x0, 1, M.BRK_L);
    w.rect(x0, 98, x1 - x0, 1, M.BRK_BAND);
    w.rect(x0, 113, x1 - x0, 5, M.BRK_S);
    w.rect(x0, 113, x1 - x0, 1, M.STONE_D);
    for (const d of door) famDoor(w, d);
  };

  const drawFar = (w) => {
    const r = rng(11);
    // Low town under the haze
    for (let x = -40; x < 360; ) {
      const wd = 8 + Math.floor(r() * 14);
      const top = 92 + Math.floor(r() * 9);
      w.rect(x, top, wd, 118 - top, r() < 0.5 ? M.FAR1 : M.FAR2);
      if (r() < 0.5) for (let i = x + 2; i < x + wd - 2; i += 3) if (r() < 0.45) w.light(i, top + 3, N.WARM_DIM, w.farWin[Math.floor(r() * 5)]);
      x += wd;
    }
    // Cooling tower, hyperboloid waist two thirds of the way up
    const cx = 25;
    for (let y = 30; y < 78; y++) {
      const hw = Math.round(7.5 + Math.pow(Math.abs(y - 37) / 8, 1.7) * (y < 37 ? 1.2 : 1.05));
      for (let x = -hw; x <= hw; x++) w.px(cx + x, y, x > hw * 0.45 ? M.FAR3 : x > -hw * 0.5 ? M.FAR2 : M.FAR1);
    }
    w.rect(cx - 8, 30, 17, 1, M.FAR3);
    // Tall chimneys against the sunset
    const stack = (x, top, wd) => {
      for (let y = top; y < 90; y++) {
        const taper = Math.floor((y - top) / 18);
        for (let i = -taper; i < wd + taper; i++) w.px(x + i, y, i >= wd - 1 ? M.FAR3 : M.FAR_BRK);
      }
      w.rect(x - 1, top, wd + 2, 1, M.FAR3);
    };
    stack(-3, 18, 3);
    stack(48, 26, 3);
    stack(9, 30, 2);
    w.beacons.push([-2, 17], [49, 25]);
    // Hałda: long, flat-topped, a few self-seeded birches
    for (let x = 228; x < 360; x++) {
      const t = smooth(228, 300, x);
      const top = Math.round(mix(100, 56, t) + Math.sin(x * 0.3) * 0.8 + Math.sin(x * 0.11) * 1.3);
      for (let y = top; y < 118; y++) w.px(x, y, (y + Math.floor(x / 5)) % 7 === 0 ? M.HALDA_L : M.HALDA);
    }
    for (const bx of [246, 305, 313, 334, 346]) {
      const t = smooth(228, 300, bx);
      const top = Math.round(mix(100, 56, t) + Math.sin(bx * 0.3) * 0.8 + Math.sin(bx * 0.11) * 1.3);
      w.rect(bx, top - 3, 1, 3, M.BIRCH);
      w.rect(bx - 1, top - 5, 3, 2, M.TREE);
    }
    // Arena: an oval shell, far off, seen over the expressway
    const ax = 183;
    for (let x = -14; x <= 14; x++) {
      const h = Math.round(Math.sqrt(1 - (x * x) / 225) * 7);
      for (let y = 0; y <= h; y++) w.px(ax + x, 80 - y, y === h ? M.ARENA : (x + y * 2) % 5 === 0 ? M.ARENA_D : y > h - 2 ? M.ARENA : M.ARENA_D);
    }
    w.rect(ax - 14, 80, 29, 1, M.FAR3);
    for (let x = -12; x <= 12; x += 4) w.light(ax + x, 79, N.ARENA_L, w.softGroup);
    // DTŚ on its piers
    w.rect(-40, 82, 400, 1, M.CONC);
    w.rect(-40, 83, 400, 1, M.CONC_DK);
    for (let x = -36; x < 360; x += 19) w.rect(x, 84, 2, 18, M.CONC_DK);
    // Embankment, rails and catenary
    for (let x = -40; x < 360; x++) {
      const top = 101 + (Math.sin(x * 0.2) > 0.7 ? 1 : 0);
      for (let y = top; y < 118; y++) w.px(x, y, M.EMB);
      w.px(x, 100, M.RAILM);
    }
    for (let x = -30; x < 360; x += 34) {
      w.rect(x, 85, 1, 15, M.POLE_DK);
      w.rect(x - 2, 86, 5, 1, M.POLE_DK);
    }
    w.rect(-40, 87, 400, 1, M.WIRE);
  };

  const drawRadioTower = (w) => {
    const cx = 160;
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

  const tree = (w, cx, cy, rw, rh, r) => {
    for (let y = -rh; y <= rh; y++) {
      for (let x = -rw; x <= rw; x++) {
        const d = (x * x) / (rw * rw) + (y * y) / (rh * rh);
        if (d > 1 + (r() - 0.5) * 0.3) continue;
        const v = r();
        let m = M.TREE;
        if (y > rh * 0.2 || x > rw * 0.4) m = v < 0.7 ? M.TREE_D : M.TREE;
        else if (y < -rh * 0.25 && x < rw * 0.2) m = v < 0.55 ? M.TREE_L : M.TREE;
        else if (v < 0.3) m = M.TREE_D;
        w.px(cx + x, cy + y, m);
      }
    }
  };

  const drawPark = (w) => {
    const r = rng(77);
    // Low in front of the tower's feet, taller to the sides, so all four legs stay visible
    const spots = [
      [150, 107, 9, 7],
      [139, 103, 8, 9],
      [172, 107, 7, 7],
      [188, 109, 6, 6],
      [164, 111, 7, 5],
      [155, 112, 6, 4],
      [146, 110, 7, 6],
      [180, 113, 7, 4],
    ];
    for (const [x, y, rw, rh] of spots) tree(w, x, y, rw, rh, r);
    w.rect(132, 112, 62, 6, M.TREE_D);
    // Low wall and iron railings of the park
    w.rect(132, 115, 62, 3, M.STONE_D);
    w.rect(132, 115, 62, 1, M.STONE);
    for (let x = 132; x < 194; x += 2) w.rect(x, 110, 1, 5, M.IRON_D);
    w.rect(132, 111, 62, 1, M.IRON_D);
    // A gap for the gate and the path up to the tower
    w.rect(158, 110, 5, 8, M.DIRT);
    w.rect(157, 108, 1, 10, M.IRON_D);
    w.rect(163, 108, 1, 10, M.IRON_D);
  };

  const drawRuin = (w) => {
    const r = rng(5);
    const x0 = 110;
    const x1 = 148;
    // Broken top line of the wall, higher at the ends, bitten where the roof beams were
    const roofline = (x) => {
      const t = (x - x0) / (x1 - x0);
      return Math.round(68 + Math.sin(t * 9) * 1.5 + (t > 0.52 && t < 0.7 ? 4 : 0) + (t > 0.85 ? (t - 0.85) * 40 : 0));
    };
    const inArch = (x, y, ax, wd, top, bottom) => {
      const c = ax + (wd - 1) / 2;
      const rad = wd / 2;
      if (x < ax || x >= ax + wd || y > bottom) return false;
      if (y >= top + rad) return true;
      const dy = top + rad - y;
      const dx = x - c;
      return dx * dx + dy * dy <= rad * rad + 0.5;
    };
    // Back wall seen through the lower tier. The light is on the floor and fades as it climbs.
    for (let y = 96; y < 118; y++) {
      for (let x = x0 + 2; x < x1 - 2; x++) {
        w.px(x, y, (x + (y >> 1)) % 5 === 0 ? M.RUIN_D : M.RUIN_BK);
        if (y > 110) w.light(x, y, (x + y) % 3 === 0 ? N.RUIN_LO : N.RUIN_HI, w.ruinG);
        else if (y > 103) w.light(x, y, N.RUIN_LO, w.ruinG);
        else w.light(x, y, N.FLOOD_LO, w.ruinG);
      }
    }
    w.rect(x0 + 2, 115, x1 - x0 - 4, 3, M.DIRT);
    w.lightRect(x0 + 2, 115, x1 - x0 - 4, 3, N.RUIN_HI, w.ruinG);
    const upper = [0, 1, 2, 3].map((i) => x0 + 2 + Math.round(i * 8.8));
    const lower = [0, 1, 2].map((i) => x0 + 2 + i * 12);
    // Front wall with two tiers of open arches: sky through the upper, the lit interior through the lower
    for (let y = 66; y < 118; y++) {
      for (let x = x0; x < x1; x++) {
        if (y < roofline(x)) continue;
        const open = upper.some((a) => inArch(x, y, a, 7, 74, 91)) || lower.some((a) => inArch(x, y, a, 10, 97, 118));
        if (open) continue;
        const v = r();
        let m = (y + (x >> 2)) % 5 === 0 ? M.RUIN_D : M.RUIN;
        // Render has fallen away in patches, showing the old brick
        const patch = Math.sin(x * 0.7 + y * 0.31) + Math.sin(x * 0.23 - y * 0.6) > 1.1;
        if (patch) m = v < 0.75 ? M.RUIN_BRK : M.BRK_M;
        else if (v < 0.08) m = M.RUIN_L;
        else if (v > 0.94) m = M.RUIN_D;
        w.px(x, y, m);
      }
    }
    // String course survives in stretches
    for (let x = x0; x < x1; x++) {
      if (x % 13 < 10) w.px(x, 93, M.RUIN_L);
      w.px(x, 94, M.RUIN_D);
    }
    // Arch reveals: thickness of the wall, catching the light from below at night
    for (const a of upper) {
      for (let y = 78; y <= 91; y++) {
        if (y > 84) {
          w.px(a, y, M.RUIN_D);
          w.light(a, y, y > 87 ? N.RUIN_HI : N.RUIN_LO, w.ruinG);
        }
      }
      for (let i = 0; i < 7; i++) {
        w.px(a + i, 92, M.RUIN_L);
        w.light(a + i, 92, N.RUIN_LO, w.ruinG);
      }
      // Keystones
      w.px(a + 3, 73, M.RUIN_L);
      w.px(a + 3, 72, M.RUIN_L);
    }
    for (const a of lower) {
      for (let y = 102; y < 118; y++) w.px(a, y, M.RUIN_D);
      w.rect(a + 3, 96, 4, 1, M.RUIN_L);
    }
    // Weeds and a birch that has moved in on the wall top
    for (const x of [113, 119, 127, 141, 146]) {
      w.px(x, roofline(x) - 1, M.TREE);
      if (x % 2) w.px(x + 1, roofline(x) - 1, M.TREE_L);
    }
    w.rect(135, 68, 1, 5, M.BIRCH);
    w.rect(134, 66, 3, 2, M.TREE);
    w.px(135, 65, M.TREE_L);
  };

  const yard = (w, r) => {
    // Next row back across the yard, softened by haze
    for (let y = 72; y < 104; y++) for (let x = 50; x < 78; x++) w.px(x, y, (y + (x >> 1)) % 4 === 0 ? M.BRK_S : M.BRK_M);
    w.rect(50, 68, 28, 4, M.ROOFD);
    w.rect(50, 72, 28, 1, M.BRK_BAND);
    for (const [x, y, lit] of [[54, 75, 1], [62, 75, 0], [70, 75, 1], [54, 88, 0], [62, 88, 1], [70, 88, 1]]) {
      w.rect(x, y, 4, 7, M.FRAME_D);
      w.rect(x + 1, y + 1, 2, 5, M.FGL);
      if (lit) w.lightRect(x + 1, y + 1, 2, 5, N.KITCHEN_D, w.winGroups[(x + y) % 28]);
    }
    // Coal sheds: tar paper, plank doors, one left open with the coal showing
    w.rect(50, 103, 28, 2, M.TAR);
    w.rect(50, 105, 28, 13, M.SHED);
    for (let i = 0; i < 5; i++) {
      const x = 51 + i * 5.4;
      const dx = Math.round(x);
      w.rect(dx, 106, 4, 11, i === 2 ? M.COAL : M.SHED_L);
      if (i === 2) {
        w.rect(dx, 113, 4, 4, M.COAL_H);
        w.px(dx + 1, 112, M.COAL_H);
      } else {
        for (let k = 1; k < 4; k += 2) w.rect(dx + k, 106, 1, 11, M.SHED_D);
        w.px(dx + 3, 111, M.STONE);
      }
    }
    // The merchant's board
    w.rect(53, 95, 25, 8, M.PAINT_K);
    w.rect(55, 103, 1, 2, M.RUST);
    w.rect(75, 103, 1, 2, M.RUST);
    ptext(w, 'WĘGIEL', 54, 96, M.TEN_T);
    // Yard floor, spilled coal
    w.rect(50, 117, 28, 1, M.DIRT);
    for (const [x, y] of [[64, 117], [66, 117], [62, 116], [63, 117]]) w.px(x, y, M.COAL);
    // Trzepak: every yard in Silesia has one
    const tx = 54;
    w.rect(tx, 108, 1, 10, M.RUST);
    w.rect(tx + 16, 108, 1, 10, M.RUST);
    w.rect(tx, 107, 17, 1, M.RUST);
    w.rect(tx, 112, 17, 1, M.RUST);
    w.yardAt = [tx, 107];
  };

  const drawFamiloks = (w) => {
    const r = rng(1913);
    w.depth = 2;
    yard(w, r);
    familok(w, -40, 50, r, [-8, 22]);
    familok(w, 78, 110, r, [101]);
    // Stairwell fanlight glow
    w.lightRect(23, 101, 5, 2, N.KITCHEN_D, w.winGroups[2]);
    w.lightRect(102, 101, 5, 2, N.KITCHEN_D, w.winGroups[9]);
    const lit = [N.KITCHEN, N.KITCHEN, N.KITCHEN_D, N.TV];
    const rows = [67, 84, 101];
    // Block A
    const floorsA = [];
    for (let f = 0; f < 3; f++) {
      for (let x = -36; x < 46; x += 11) {
        if (f === 2 && (x === -3 + 0 || x > 19 && x < 30 || x > -12 && x < -3)) continue;
        floorsA.push([x, rows[f]]);
      }
    }
    floorsA.forEach(([x, y], i) => {
      const on = (i * 7 + 3) % 5 > 1;
      const pots = (i * 5) % 4 === 1 ? 2 : (i * 3) % 7 === 2 ? 3 : 0;
      const n = on ? lit[i % 4] : 0;
      famWindow(w, x, y, { n, g: n === N.TV ? w.tvG : w.winGroups[(i * 3) % 28], lace: n !== N.TV && (i * 11) % 3 === 0, pots });
    });
    famWindow(w, 30, 84, { n: N.KITCHEN, g: w.kitchenG, pots: 0 });
    w.kitchenAt = [30, 84];
    // Block B: grandma's window is left open on the first floor
    const bx = [81, 92];
    famWindow(w, bx[0], 67, { n: N.KITCHEN, g: w.winGroups[4], lace: true, pots: 2 });
    famWindow(w, bx[1], 67, { pots: 3 });
    famWindow(w, 102, 67, { n: N.KITCHEN_D, g: w.winGroups[17], lace: true });
    famWindow(w, bx[0], 84, { n: N.KITCHEN, g: w.grannyG, open: true });
    famWindow(w, bx[1], 84, { n: N.KITCHEN, g: w.winGroups[12], lace: true, pots: 1 });
    famWindow(w, 102, 84, { pots: 2 });
    famWindow(w, bx[0], 101, { n: N.KITCHEN_D, g: w.winGroups[20], pots: 2 });
    famWindow(w, bx[1], 101, { lace: true, n: N.KITCHEN, g: w.winGroups[7] });
    w.grannyAt = [bx[0], 84];
    // Pigeon loft, up on the ridge on posts, painted like a garden shed
    const lx = 83;
    const ly = 41;
    w.rect(lx + 1, ly + 9, 1, 5, M.SHED_D);
    w.rect(lx + 16, ly + 9, 1, 5, M.SHED_D);
    w.rect(lx, ly, 19, 9, M.LOFT);
    w.rect(lx, ly - 1, 19, 1, M.TAR);
    w.rect(lx - 1, ly - 2, 21, 1, M.TAR);
    w.rect(lx + 18, ly, 1, 9, M.SHED_D);
    for (let i = 0; i < 3; i++) {
      w.rect(lx + 2 + i * 6, ly + 3, 3, 4, M.COAL);
      w.rect(lx + 2 + i * 6, ly + 2, 3, 1, M.LOFT_L);
    }
    w.rect(lx - 3, ly + 7, 25, 1, M.LOFT_L);
    w.rect(lx, ly + 8, 19, 1, M.SHED_D);
    w.loftAt = [lx, ly + 6];
    // Dormers, aerials, and the one satellite dish that annoys the neighbours
    for (const dx of [-30, -4, 28]) {
      w.rect(dx, 52, 9, 2, M.ROOFL);
      w.rect(dx - 1, 51, 11, 1, M.TAR);
      w.rect(dx + 1, 53, 7, 7, M.FRAME_D);
      w.rect(dx + 2, 54, 5, 5, M.FGL);
      w.rect(dx + 4, 54, 1, 5, M.FRAME);
      if (dx === -4) w.lightRect(dx + 2, 54, 2, 5, N.KITCHEN_D, w.winGroups[5]);
    }
    for (const ax of [-12, 18, 47]) {
      w.rect(ax, 45, 1, 9, M.IRON_D);
      w.rect(ax - 2, 46, 5, 1, M.IRON_D);
      w.rect(ax - 1, 48, 3, 1, M.IRON_D);
    }
    w.rect(99, 50, 1, 4, M.IRON_D);
    w.sprite(['..#', '.##', '###', '##.'], { '#': M.ZINC }, 100, 47);
    // Chimneys
    chimney(w, -20, 44, 54);
    chimney(w, 8, 46, 54);
    chimney(w, 38, 44, 54);
    chimney(w, 79, 47, 54, 4);
    chimney(w, 105, 46, 54, 4);
    w.smoke = [[10, 44, 0.05], [40, 42, 0.11], [81, 45, 0.07]];
  };

  const smallWin = (w, x, y, wd, h, trim, n, g) => {
    w.rect(x - 1, y - 1, wd + 2, h + 2, trim);
    w.rect(x, y, wd, h, M.FGL);
    w.px(x, y, M.FGL_H);
    if (n) w.lightRect(x, y, wd, h, n, g);
    w.rect(x + Math.floor(wd / 2), y, 1, h, trim);
    w.rect(x, y + 2, wd, 1, trim);
    w.rect(x - 1, y + h + 1, wd + 2, 1, M.STONE);
  };

  const drawTenements = (w) => {
    const r = rng(3);
    const wall = (x, wd, top, a, b) => {
      for (let y = top; y < 118; y++) for (let i = 0; i < wd; i++) w.px(x + i, y, i >= wd - 2 ? b : r() < 0.06 ? b : a);
    };
    // T1, the narrowest, plain triangular gable with a finial
    const t1 = 190;
    wall(t1, 16, 66, M.TEN_Y, M.TEN_Y_D);
    for (let y = 57; y < 66; y++) {
      const hw = Math.round((y - 57) * 0.95);
      for (let i = -hw; i <= hw; i++) w.px(t1 + 8 + i, y, Math.abs(i) >= hw ? M.TEN_T : M.TEN_Y);
    }
    w.rect(t1 + 8, 54, 1, 3, M.IRON_D);
    w.rect(t1 + 7, 62, 3, 3, M.FGL);
    // T2, stepped gable
    const t2 = 206;
    wall(t2, 24, 66, M.TEN_G, M.TEN_G_D);
    const steps = [[0, 24, 62], [3, 18, 59], [6, 12, 56]];
    for (const [ins, wd, y] of steps) {
      w.rect(t2 + ins, y, wd, 66 - y, M.TEN_G);
      w.rect(t2 + ins, y, wd, 1, M.TEN_T);
    }
    w.rect(t2 + 10, 59, 4, 4, M.FGL);
    w.rect(t2 + 9, 58, 6, 1, M.TEN_T);
    // T3, curved baroque gable
    const t3 = 230;
    wall(t3, 22, 66, M.TEN_P, M.TEN_P_D);
    for (let y = 53; y < 66; y++) {
      const t = (y - 53) / 13;
      const hw = Math.round(3 + Math.pow(t, 2.2) * 8 + Math.sin(t * 3.14) * 2);
      for (let i = -hw; i <= hw; i++) w.px(t3 + 11 + i, y, Math.abs(i) === hw ? M.TEN_T : M.TEN_P);
    }
    w.rect(t3 + 8, 52, 7, 1, M.TEN_T);
    w.rect(t3 + 10, 57, 3, 4, M.FGL);
    w.rect(t3 + 11, 57, 1, 4, M.TEN_T);
    for (const [x, wd] of [[t1, 16], [t2, 24], [t3, 22]]) {
      w.rect(x, 66, wd, 1, M.TEN_T);
      w.rect(x, 81, wd, 1, M.TEN_T);
      w.rect(x, 96, wd, 2, M.TEN_T);
    }
    // Upper windows
    const g = w.winGroups;
    smallWin(w, 199, 69, 4, 8, M.TEN_T, N.KITCHEN, g[1]);
    smallWin(w, 199, 85, 4, 8, M.TEN_T, N.KITCHEN_D, g[14]);
    smallWin(w, 209, 69, 4, 8, M.TEN_T, N.KITCHEN, g[6]);
    smallWin(w, 215, 69, 3, 8, M.TEN_T);
    smallWin(w, 233, 85, 3, 8, M.TEN_T);
    smallWin(w, 238, 85, 3, 8, M.TEN_T, N.KITCHEN_D, g[23]);
    // Top floor of T3 knocked through into one wide window, for two monitors
    w.rect(231, 67, 13, 11, M.TEN_T);
    w.rect(232, 68, 11, 9, M.FGL);
    w.rect(232, 68, 2, 1, M.FGL_H);
    w.rect(235, 68, 1, 9, M.TEN_T);
    w.rect(239, 68, 1, 9, M.TEN_T);
    w.rect(232, 71, 11, 1, M.TEN_T);
    w.rect(231, 78, 13, 1, M.STONE);
    w.studioAt = [232, 68];
    // Street floors
    const shop = (x, wd) => {
      w.rect(x, 98, wd, 20, M.BOARD_K);
      w.rect(x, 115, wd, 3, M.STONE_D);
    };
    // Café
    shop(t1, 16);
    w.rect(t1 + 1, 102, 9, 12, M.FGL);
    w.lightRect(t1 + 1, 102, 9, 12, N.KITCHEN, w.cafeG);
    w.rect(t1 + 11, 102, 4, 16, M.SHED_L);
    w.rect(t1 + 12, 103, 2, 5, M.FGL);
    w.lightRect(t1 + 12, 103, 2, 5, N.KITCHEN, w.cafeG);
    w.rect(t1 + 1, 111, 9, 1, M.PAINT_K);
    w.rect(t1 + 3, 109, 3, 2, M.CURTAIN);
    w.px(t1 + 6, 109, M.CURTAIN);
    // Awning, striped, because the café is the one place on the square that bothered
    for (let i = 0; i < 16; i++) {
      w.px(t1 + i, 98, i % 4 < 2 ? M.AWN : M.TEN_T);
      w.px(t1 + i, 99, i % 4 < 2 ? M.AWN : M.TEN_T);
      w.px(t1 + i, 100, i % 4 < 2 ? M.AWN : M.TEN_T);
    }
    // Apteka
    shop(t2, 24);
    w.rect(t2 + 1, 106, 14, 9, M.FGL);
    w.lightRect(t2 + 1, 106, 14, 9, N.STORE, w.aptekaG);
    w.rect(t2 + 8, 106, 1, 9, M.PAINT_K);
    w.rect(t2 + 1, 112, 14, 1, M.TEN_T);
    for (let i = 0; i < 6; i++) w.px(t2 + 2 + i * 2, 111, i % 2 ? M.GERAN : M.PACK_B);
    w.rect(t2 + 16, 106, 7, 12, M.SHED_D);
    w.rect(t2 + 17, 107, 5, 6, M.FGL);
    w.lightRect(t2 + 17, 107, 5, 6, N.STORE, w.aptekaG);
    w.hsign(t2, 98, 24, 7, 'APTEKA', { n: N.GRN, g: w.aptekaSignG, board: M.EN_G, off: M.TEN_T });
    // Piekarnia: its window comes on at four, because that's when bakers start
    shop(t3, 22);
    w.rect(t3, 99, 22, 4, M.TEN_T);
    w.rect(t3 + 1, 104, 13, 11, M.FGL);
    w.lightRect(t3 + 1, 104, 13, 11, N.KITCHEN, w.bakeG);
    w.rect(t3 + 1, 108, 13, 1, M.SHED_D);
    w.rect(t3 + 1, 112, 13, 1, M.SHED_D);
    for (let i = 0; i < 6; i++) {
      w.rect(t3 + 2 + i * 2, 106, 2, 2, M.RUST);
      w.px(t3 + 3 + i * 2, 111, M.RUST);
      w.px(t3 + 2 + i * 2, 111, M.RUG_L);
    }
    w.rect(t3 + 15, 104, 6, 14, M.SHED_L);
    w.rect(t3 + 16, 105, 4, 5, M.FGL);
    w.lightRect(t3 + 16, 105, 4, 5, N.KITCHEN, w.bakeG);
    // Signs on the tenements
    w.vsign(190, 60, 'KAWIARNIA', { n: N.ROSE, g: w.kawiarniaG, w: 8, pad: 1, board: M.EN_P, off: M.TEN_T });
    // One letter on a bad contact
    relightV(w, 190, 60, 'KAWIARNIA', 6, N.ROSE, w.kawiarniaBadG, 8, 1);
    w.vsign(220, 60, 'KINO', { n: N.COLD, g: w.kinoG, w: 10, font: 5, pad: 2, board: M.EN_B, off: M.TEN_T });
    w.kinoAt = [220, 60, 10, 35];
    w.vsign(244, 60, 'PIEKARNIA', { n: N.YEL, g: w.piekarniaG, w: 8, pad: 1, board: M.EN_O, off: M.TEN_T });
    // Pharmacy cross on a bracket
    const cross = [[2, 0], [3, 0], [4, 0], [2, 1], [3, 1], [4, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [0, 4], [1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [2, 5], [3, 5], [4, 5], [2, 6], [3, 6], [4, 6]];
    w.rect(t2 + 2, 84, 11, 11, M.TEN_T);
    w.rect(t2 + 3, 85, 9, 9, M.EN_G);
    for (const [i, j] of cross) w.tube(t2 + 4 + i, 86 + j, M.TEN_T, N.GRN, w.crossG);
    w.rect(t2 + 7, 95, 1, 3, M.IRON_D);
  };

  // Same layout as vsign, for re-lighting one letter
  const relightV = (w, x, y, text, idx, n, g, wd, pad, font) => {
    let cy = y + pad;
    [...text].forEach((c, i) => {
      const rows = w.fontRows(c, font);
      if (i === idx) w.glyph(c, x + Math.floor((wd - 1 - rows[0].length) / 2), cy, (px, py) => w.light(px, py, n, g), font);
      cy += rows.length + 1;
    });
  };

  const drawFajrant = (w) => {
    // Rooftop letters on a steel frame, the way the PRL mounted them
    const x = 197;
    const y = 30;
    const W = 58;
    const H = 15;
    for (const px of [x + 3, x + 28, x + 54]) w.rect(px, y + H, 1, 56 - y - H + 8, M.IRON_D);
    w.rect(x, y, W, 1, M.IRON);
    w.rect(x, y + H - 1, W, 1, M.IRON);
    for (let i = 0; i < W; i += 6) {
      line(x + i, y, Math.min(x + i + 6, x + W - 1), y + H - 1, (px, py) => w.px(px, py, M.IRON_D));
    }
        w.hsign(x + 2, y + 2, W - 4, H - 4, 'fajrant', { n: N.FAJ, g: w.fajG, board: M.EN_R, off: M.FAJ_OFF, gap: 2 });
    // Time clock under it, so you can see the sign keep its word
    w.rect(x + 18, y + H, 23, 9, M.BOARD_K);
    w.rect(x + 18, y + H + 8, 23, 1, M.IRON_D);
    w.clockAt = [x + 20, y + H + 2];
  };

  const crossedHammers = (w, x, y, n, g) => {
    const t = (px, py) => w.tube(x + px, y + py, M.TUBE, n, g);
    // Hammer: handle lower left to upper right, thick blunt head across the end
    line(1, 12, 9, 4, t);
    line(7, 0, 12, 5, t);
    line(8, 0, 12, 4, t);
    line(7, 1, 11, 5, t);
    // Pick: handle lower right to upper left, thin long head
    line(11, 12, 3, 4, t);
    line(0, 6, 5, 1, t);
    t(6, 0);
    t(0, 7);
  };

  const drawMine = (w) => {
    // Headframe: riveted steel legs and X-bracing, two sheaves side by side on the deck
    const lx = 264;
    const rx = 290;
    const deck = 33;
    for (let y = deck; y < 90; y++) {
      w.px(lx, y, M.IRON);
      w.px(lx + 1, y, M.IRON_L);
      w.px(rx, y, M.IRON);
      w.px(rx - 1, y, M.IRON_D);
      w.px(lx + 12, y, M.IRON_D);
      w.px(lx + 14, y, M.IRON_D);
      // Work lights catch the legs
      if ((y + lx) % 2 === 0) {
        w.light(lx + 1, y, N.FLOOD_LO, w.wheelG);
        w.light(rx - 1, y, N.FLOOD_LO, w.wheelG);
      }
    }
    for (let y = deck; y < 80; y += 11) {
      line(lx + 1, y, lx + 12, y + 11, (x, py) => w.px(x, py, M.IRON));
      line(lx + 12, y, lx + 1, y + 11, (x, py) => w.px(x, py, M.IRON));
      line(lx + 14, y, rx - 1, y + 11, (x, py) => w.px(x, py, M.IRON));
      line(rx - 1, y, lx + 14, y + 11, (x, py) => w.px(x, py, M.IRON));
      w.rect(lx, y, rx - lx + 1, 1, M.IRON_L);
    }
    // Rivets along the deck plate girder
    w.rect(lx - 7, deck - 1, rx - lx + 15, 3, M.IRON);
    for (let x = lx - 6; x < rx + 8; x += 2) w.px(x, deck, M.IRON_L);
    w.rect(lx - 7, deck + 2, rx - lx + 15, 1, M.IRON_D);
    // Handrail
    for (let x = lx - 7; x <= rx + 7; x += 3) w.px(x, deck - 2, M.IRON_D);
    w.rect(lx - 7, deck - 3, rx - lx + 15, 1, M.IRON_D);
    // Struts out to the winding engines, one on each side
    for (const [ax, bx] of [[lx - 6, 248], [rx + 6, 318]]) {
      line(ax, deck + 2, bx, 92, (x, y) => {
        w.px(x, y, M.IRON);
        w.px(x + 1, y, M.IRON_D);
      });
    }
    // Sheave rims stay put; the spokes are painted each frame
    w.wheels = [
      { x: 268, y: 22, r: 9, dir: 1, a: 0 },
      { x: 287, y: 22, r: 9, dir: -1, a: 0.6 },
    ];
    for (const s of w.wheels) {
      for (let a = 0; a < 6.283; a += 0.05) {
        const x = s.x + Math.round(Math.cos(a) * s.r);
        const y = s.y + Math.round(Math.sin(a) * s.r);
        w.px(x, y, M.WHEEL);
        w.light(x, y, N.FLOOD_LO, w.wheelG);
        const x2 = s.x + Math.round(Math.cos(a) * (s.r - 1));
        const y2 = s.y + Math.round(Math.sin(a) * (s.r - 1));
        w.px(x2, y2, M.WHEEL);
      }
      // Bearing frame
      line(s.x, s.y, s.x - 4, deck - 1, (x, y) => w.px(x, y, M.IRON_D));
      line(s.x, s.y, s.x + 4, deck - 1, (x, y) => w.px(x, y, M.IRON_D));
    }
    // Ropes
    line(259, 22, 246, 76, (x, y) => w.px(x, y, M.PAINT_K));
    line(296, 22, 316, 76, (x, y) => w.px(x, y, M.PAINT_K));
    w.beacons.push([277, 27]);
    for (const x of [lx - 6, rx + 6]) w.lightRect(x, deck - 4, 1, 1, N.CAGE, w.mineLampG);
    w.lightRect(lx + 13, 45, 1, 1, N.CAGE, w.mineLampG);
    w.lightRect(lx + 13, 62, 1, 1, N.CAGE, w.mineLampG);

    // Inclined conveyor gallery, on trestles, across the tower and off behind the block
    const gall = (x) => Math.round(36 + (x - 258) * 0.62);
    for (const [tx, end] of [[304, 100], [324, 100]]) {
      w.rect(tx, gall(tx) + 4, 1, end - gall(tx) - 4, M.IRON_D);
      w.rect(tx + 4, gall(tx) + 6, 1, end - gall(tx) - 6, M.IRON_D);
      for (let y = gall(tx) + 8; y < end; y += 8) line(tx, y, tx + 4, y + 6, (x, py) => w.px(x, py, M.IRON));
    }
    for (let x = 258; x < 345; x++) {
      const y = gall(x);
      w.px(x, y - 1, M.IRON_L);
      for (let j = 0; j < 4; j++) w.px(x, y + j, x % 4 === 0 ? M.GALL_D : M.GALL);
      w.px(x, y + 4, M.IRON_D);
      if (x % 8 === 3) {
        w.px(x, y + 1, M.MINEGL);
        w.px(x + 1, y + 1, M.MINEGL);
        w.light(x, y + 1, N.KITCHEN_D, w.mineLampG);
        w.light(x + 1, y + 1, N.KITCHEN_D, w.mineLampG);
      }
    }

    // Winding house: brick hall with a pediment, big arched windows
    const hx = 252;
    const hw = 48;
    const r = rng(1898);
    for (let y = 66; y < 118; y++) {
      for (let x = hx; x < hx + hw; x++) {
        const off = (y >> 1) % 2 ? 2 : 0;
        const joint = y % 2 === 1 || (x + off) % 4 === 0;
        w.px(x, y, r() < 0.09 ? M.BRK_S : joint ? M.BRK_M : M.BRK_L);
      }
    }
    for (let y = 52; y < 66; y++) {
      const half = Math.round(((y - 52) / 14) * (hw / 2 - 1) + 1);
      const c = hx + hw / 2;
      for (let x = c - half; x < c + half; x++) w.px(x, y, (x + y) % 5 === 0 ? M.BRK_S : M.BRK_M);
      w.px(c - half, y, M.STONE_D);
      w.px(c + half - 1, y, M.STONE_D);
      if (y % 2 === 0) {
        w.px(c - half + 1, y, M.STONE_D);
        w.px(c + half - 2, y, M.STONE_D);
      }
    }
    w.rect(hx, 72, hw, 1, M.STONE);
    // SZCZĘŚĆ BOŻE, the miners' greeting, over the windows
    ptext(w, 'SZCZĘŚĆ BOŻE', hx + 1, 67, M.TEN_T);
    crossedHammers(w, hx + hw / 2 - 7, 52, N.AMBER, w.hammerG);
    for (let i = 0; i < 3; i++) {
      const ax = hx + 4 + i * 15;
      const top = 74;
      const wd = 10;
      for (let y = top; y < 87; y++) {
        const rad = wd / 2;
        for (let x = 0; x < wd; x++) {
          if (y < top + rad) {
            const dx = x - (wd - 1) / 2;
            const dy = top + rad - y;
            if (dx * dx + dy * dy > rad * rad) continue;
          }
          const bar = x % 3 === 2 || y % 4 === 0;
          w.px(ax + x, y, bar ? M.IRON_D : M.MINEGL);
          if (!bar) w.light(ax + x, y, N.MINEWIN, w.windingG);
        }
      }
      w.rect(ax - 1, 87, wd + 2, 1, M.STONE);
    }
  };

  const drawBars = (w) => {
    const x = 252;
    const wd = 48;
    w.rect(x, 88, wd, 30, M.PLAST);
    w.rect(x, 115, wd, 3, M.STONE_D);
    w.rect(x, 88, wd, 1, M.STONE_D);
    // KLUSKI board across the roofline, a tube dumpling at each end
    w.hsign(x, 88, wd, 11, 'KLUSKI', { n: N.COLD, g: w.kluskiG, font: 5, board: M.EN_T, off: M.TEN_T });
    w.rect(x + 8, 86, 1, 2, M.IRON_D);
    w.rect(x + 39, 86, 1, 2, M.IRON_D);
    for (const dx of [x + 2, x + 41]) {
      for (const [i, j] of [[1, 0], [2, 0], [3, 0], [0, 1], [4, 1], [0, 2], [4, 2], [0, 3], [4, 3], [1, 4], [2, 4], [3, 4], [2, 2]]) w.tube(dx + i, 91 + j, M.TEN_T, N.WHT, w.plateG);
    }
    // ROLADA fascia, over the plate
    w.hsign(x + 1, 99, 26, 7, 'ROLADA', { n: N.YEL, g: w.roladaG, board: M.EN_W, off: M.TEN_T });
    // Bar window, warm behind the neon plate
    w.rect(x + 1, 106, 26, 9, M.ROOM);
    w.lightRect(x + 1, 106, 26, 9, N.BARLOW, w.barG);
    // Door
    w.rect(x + 28, 100, 3, 18, M.SHED);
    w.rect(x + 29, 101, 1, 6, M.FGL);
    w.lightRect(x + 29, 101, 1, 6, N.KITCHEN, w.barG);
    // Plate with a roulade, two dumplings with the dimple they're famous for, red cabbage
    const plate = [
      '....WWWWWWWWW....',
      '..WW.........WW..',
      '.W..OOOO..CCC..W.',
      'W..OOSSOO.CCCC..W',
      'W..OOOOOO..CC...W',
      '.W.WWW.WWW.....W.',
      '..WWdWWWdWW..WW..',
      '....WWWWWWWWW....',
    ];
    const px = x + 6;
    const py = 106;
    plate.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        const c = row[i];
        if (c === 'W') w.tube(px + i, py + j, M.TUBE, N.WHT, w.plateG);
        else if (c === 'O') w.tube(px + i, py + j, M.RUST, N.ROLL, w.plateG);
        else if (c === 'S') w.tube(px + i, py + j, M.SHED_D, N.AMBER, w.plateG);
        else if (c === 'C') w.tube(px + i, py + j, M.AWN, N.CABBAGE, w.plateG);
        else if (c === 'd') w.px(px + i, py + j, M.ROOM);
      }
    });
    // PIWO over the second window, where the mug lives
    w.hsign(x + 31, 99, 17, 7, 'PIWO', { n: N.AMBER, g: w.piwoG, board: M.EN_O, off: M.TEN_T });
    w.rect(x + 32, 106, 15, 9, M.ROOM);
    w.lightRect(x + 32, 106, 15, 9, N.BARLOW, w.barG);
    // Two regulars at the counter
    w.rect(x + 43, 108, 2, 3, M.PAINT_K);
    w.rect(x + 42, 111, 4, 3, M.PAINT_K);
    w.rect(x + 13, 113, 1, 1, M.PAINT_K);
  };

  const drawBlock = (w) => {
    // PRL block closes the frame on the right
    const x = 300;
    const top = 70;
    w.rect(x, top, 60, 48, M.PANEL);
    for (let y = top; y < 118; y += 12) w.rect(x, y, 60, 1, M.PANEL_D);
    for (let px = x + 13; px < 360; px += 13) w.rect(px, top, 1, 48, M.PANEL_D);
    w.rect(x, top, 60, 2, M.ZINC);
    w.rect(x, 113, 60, 5, M.PANEL_D);
    for (let f = 0; f < 3; f++) {
      for (let i = 0; i < 4; i++) {
        const wx = x + 3 + i * 13;
        const wy = top + 4 + f * 12;
        w.rect(wx, wy, 9, 6, M.PAINT_K);
        w.rect(wx + 1, wy + 1, 7, 4, M.FGL);
        if ((f * 3 + i * 5) % 5 > 0) w.lightRect(wx + 1, wy + 1, 7, 4, (f + i) % 3 ? N.KITCHEN : N.FLUO, w.winGroups[(f * 5 + i * 3 + 8) % 28]);
        w.rect(wx + 4, wy + 1, 1, 4, M.PAINT_K);
      }
    }
    // SZTYGAR hangs out over the bars, in front of the mine it's named after
    w.vsign(300, 55, 'SZTYGAR', { n: N.RED_T, g: w.sztygarG, w: 10, font: 5, pad: 2, board: M.EN_R, off: M.TEN_T });
    // HOTEL, down the corner. The T went dead sometime in the nineties.
    w.vsign(312, 72, 'HOTEL', { n: N.COLD, g: w.hotelG, w: 8, pad: 1, board: M.EN_B, off: M.TEN_T });
    relightV(w, 312, 72, 'HOTEL', 2, 0, 0, 8, 1);
  };

  const lamp = (w, x, top, dir, g) => {
    w.depth = 3;
    w.rect(x, top, 1, 118 - top, M.POLE);
    w.rect(x, top + 26, 1, 6, M.POLE_DK);
    w.rect(x - 1, 116, 3, 2, M.POLE_DK);
    for (let i = 1; i <= 6; i++) w.px(x + dir * i, top - (i < 3 ? 1 : 2), M.POLE);
    w.px(x, top - 1, M.POLE);
    const hx = x + dir * 7;
    const left = Math.min(hx, hx + dir * 3);
    w.rect(left, top - 3, 4, 1, M.LAMP_OFF);
    w.rect(left, top - 2, 4, 1, M.LAMP_OFF);
    w.lightRect(left, top - 2, 4, 1, N.SODIUM_HOT, g);
    w.lightRect(left + 1, top - 1, 2, 1, N.SODIUM, g);
    w.lampHeads.push([left + 2, g]);
    // A pool of orange on the bricks below
    const cx = hx + dir;
    for (let y = 118; y < 127; y++) {
      const span = 9 + (y - 118) * 1.3;
      for (let i = -Math.round(span); i <= Math.round(span); i++) {
        const d = Math.abs(i) / span;
        if ((i + y * 2) % 4 === 0 && d < 1) w.light(cx + i, y, d < 0.5 ? N.POOL_L : N.POOL, g);
        else if ((i + y) % 2 === 0 && d < 0.45) w.light(cx + i, y, N.POOL, g);
      }
    }
    w.depth = 2;
  };

  const drawStreet = (w) => {
    const r = rng(9);
    // Clinker, laid in running bond
    for (let y = 118; y < 127; y++) {
      for (let x = -40; x < 360; x++) {
        const joint = (x + ((y >> 1) % 2) * 3) % 6 === 0 || y % 2 === 1;
        w.px(x, y, joint ? M.WALK_D : M.WALK);
      }
    }
    w.rect(-40, 127, 400, 2, M.CURB);
    w.rect(-40, 128, 400, 1, M.CONC_DK);
    for (let y = 129; y < 150; y++) {
      for (let x = -40; x < 360; x++) {
        const v = r();
        w.px(x, y, v < 0.06 ? M.ROAD_D : v > 0.95 ? M.ROAD_L : M.ROAD);
      }
    }
    // The old setts still show along the gutter, where the tarmac never quite stuck
    for (let x = -40; x < 360; x++) {
      w.px(x, 129, (x >> 1) % 2 ? M.COBBLE : M.COBBLE_D);
      w.px(x, 130, ((x + 1) >> 1) % 2 ? M.COBBLE : M.COBBLE_D);
    }
    // Patches
    for (const [x, wd] of [[36, 24], [168, 16], [270, 30]]) w.rect(x, 138, wd, 7, M.ROAD_L);
    for (let x = -36; x < 360; x += 16) w.rect(x, 139, 8, 1, M.LINE);
    w.rect(214, 142, 6, 2, M.MANHOLE);
    w.rect(70, 133, 6, 2, M.MANHOLE);
    // Near pavement
    for (let y = 148; y < 150; y++) for (let x = -40; x < 360; x++) w.px(x, y, (x + y * 3) % 6 === 0 ? M.WALK_D : M.WALK);
    w.rect(-40, 147, 400, 1, M.CURB);
    w.rect(-40, 150, 400, 40, M.WALK_D);
  };

  const drawFountain = (w) => {
    const x = 180;
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

  const drawStreetBits = (w) => {
    // Bus stop: a post and a timetable, no more than that
    w.rect(116, 102, 1, 16, M.POLE);
    w.rect(113, 98, 7, 5, M.PACK_Y);
    w.rect(114, 99, 5, 3, M.TEN_T);
    w.px(116, 100, M.PACK_B);
    w.rect(113, 110, 1, 6, M.PAINT_K);
    w.rect(113, 105, 1, 5, M.TEN_T);
    // Bench in front of the park railings
    w.rect(143, 116, 13, 1, M.SHED);
    w.rect(143, 113, 13, 1, M.SHED);
    w.rect(143, 115, 13, 1, M.SHED_D);
    w.rect(144, 117, 1, 2, M.IRON_D);
    w.rect(154, 117, 1, 2, M.IRON_D);
  };

  // The stock ramp dithers between stops a long way apart, which reads as a halftone screen rather than smog
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

  const build = (w, ctx) => {
    M = ctx.M;
    N = ctx.N;
    w.fontRows = (c, font) => (font === 5 && ctx.FONT5[c]) || ctx.GLYPH[c] || ctx.FONT3[c] || ctx.FONT3[' '];
    for (let key = NOON; key <= DAWN; key++) smoothSky(w, key, ctx);
    w.noSignal = true;
    w.walkTop = 118;
    w.roadTop = 127;
    w.lanes = [136, 146];
    w.rainFloor = 147;
    w.roadMats = new Set([M.ROAD, M.ROAD_D, M.ROAD_L, M.COBBLE, M.COBBLE_D, M.LINE, M.MANHOLE]);

    // Fajrant goes at the stroke of six. Everything else on the street waits its turn.
    w.fajG = w.addGroup(18.0, 28.7);
    w.hammerG = w.addGroup(18.22, 28.6);
    w.aptekaSignG = w.addGroup(18.3, 28.9);
    w.crossG = w.addGroup(18.28, 30);
    w.kluskiG = w.addGroup(18.35, 26.5);
    w.sztygarG = w.addGroup(18.42, 27.2);
    w.kinoG = w.addGroup(18.48, 25.5);
    w.plateG = w.addGroup(18.52, 26.5);
    w.roladaG = w.addGroup(18.58, 26.5);
    w.piwoG = w.addGroup(18.64, 27.2);
    w.piekarniaG = w.addGroup(18.7, 30);
    w.kawiarniaG = w.addGroup(18.76, 24.5);
    w.kawiarniaBadG = w.addGroup(18.76, 24.5, 'neon', { broken: true });
    w.hotelG = w.addGroup(18.82, 30);
    w.lampG = w.addGroup(18.15, 29.4, 'neon', { soft: true });
    w.lampBadG = w.addGroup(18.15, 29.4, 'neon', { soft: true });
    w.towerG = w.addGroup(18.3, 29.2, 'neon', { soft: true });
    w.wheelG = w.addGroup(18.2, 29.4, 'neon', { soft: true });
    w.mineLampG = w.addGroup(17.9, 29.5, 'room');
    w.windingG = w.addGroup(17.7, 29.8, 'room');
    w.ruinG = w.addGroup(18.5, 26.8, 'neon', { soft: true });
    w.fountainG = w.addGroup(18.6, 25.5, 'neon', { soft: true });
    w.cafeG = w.addGroup(16.5, 23.5, 'room');
    w.barG = w.addGroup(16.8, 26.8, 'room');
    w.aptekaG = w.addGroup(12, 40, 'room');
    w.bakeG = w.addGroup(27.9, 36, 'room');
    w.grannyG = w.addGroup(18.9, 22.8, 'room');
    // Shipping something. Still shipping it at three in the morning.
    w.studioG = w.addGroup(20.2, 30.6, 'room');
    w.tvG = w.addGroup(18.6, 25.8, 'room');
    w.kitchenG = w.addGroup(17.9, 22.6, 'room');

    w.depth = 0;
    drawFar(w);
    w.depth = 2;
    drawRadioTower(w);
    drawRuin(w);
    drawPark(w);
    drawFamiloks(w);
    drawMine(w);
    drawTenements(w);
    drawFajrant(w);
    drawBlock(w);
    drawBars(w);
    drawFountain(w);
    w.depth = 2;
    drawStreet(w);
    drawStreetBits(w);
    w.lampHeads = [];
    lamp(w, 30, 88, 1, w.lampG);
    lamp(w, 118, 88, -1, w.lampBadG);
    lamp(w, 187, 88, -1, w.lampG);
    lamp(w, 300, 84, -1, w.lampG);

    w.strata = [
      { x: 10, y: 14, w: 70, v: 0.6 },
      { x: 150, y: 33, w: 90, v: 0.4 },
      { x: 270, y: 9, w: 60, v: 0.75 },
      { x: -40, y: 44, w: 110, v: 0.3 },
    ];
    w.train = { x: -120, wait: 2 };
    w.mine = { t: 0, a: 0, pos: 0 };
    w.flock = [];
    for (let i = 0; i < 9; i++) w.flock.push({ p: i * 0.2, r: 0.8 + (i % 4) * 0.08, a: 0, grey: i % 3 === 0, home: 2 + i * 2 });
    w.pig = { t: 8, air: 0, force: 0 };
    w.dog = { bark: 0 };
    w.cat.x = 58;
    w.cat.y = 94;
    w.granny = { fist: 0 };

    w.cars.push(
      { x: 40, lane: 1, dir: 1, kind: 'sedan', len: 25, speed: 40, color: M.CAR_R },
      { x: 200, lane: 1, dir: 1, kind: 'sedan', len: 25, speed: 36, color: M.CAR_G },
      { x: 330, lane: 1, dir: 1, kind: 'maluch', len: 15, speed: 26 },
      { x: 280, lane: 0, dir: -1, kind: 'bus', len: 58, speed: 30, stop: 0, stopX: 97 },
      { x: 90, lane: 0, dir: -1, kind: 'sedan', len: 25, speed: 38, color: M.CAR_W },
      { x: -20, lane: 0, dir: -1, kind: 'sedan', len: 25, speed: 35, color: M.CAR_B },
    );
    const baseCar = w.drawCar.bind(w);
    w.drawCar = (car, x, y) => {
      if (car.kind === 'bus') drawBus(w, car, x, y);
      else if (car.kind === 'maluch') drawMaluch(w, car, x, y);
      else baseCar(car, x, y);
    };

    // Everyone on the street; students by day, the shift all hours and a crowd of them at six
    const person = (x, y, dir, speed, kind, extra = {}) => w.peds.push({ x, y, dir, speed, kind, phase: (x * 7) % 3, ...extra });
    person(60, 124, 1, 8, 'student', { pack: M.PACK_R, top: M.COAT_B, dayOnly: true });
    person(170, 122, -1, 9, 'student', { pack: M.PACK_Y, top: M.COAT_R, dayOnly: true });
    person(20, 125, 1, 9.5, 'student', { pack: M.PACK_B, top: M.COAT, dayOnly: true });
    person(0, 122, 1, 8.5, 'student', { pack: M.PACK_Y, top: M.COAT_G, dayOnly: true });
    person(240, 124, -1, 7, 'plain', { top: M.COAT });
    person(110, 123, -1, 6, 'plain', { top: M.COAT_R, hair: M.GREYH });
    person(300, 125, 1, 7.5, 'plain', { top: M.COAT_B, nightOnly: true });
    person(215, 122, 1, 6.5, 'plain', { top: M.COAT_G, nightOnly: true });
    person(275, 125, -1, 7.5, 'miner');
    person(305, 123, -1, 7.5, 'miner', { shift: true });
    person(322, 125, -1, 6.8, 'miner', { shift: true });
    person(343, 122, -1, 7.2, 'miner', { shift: true });
    person(360, 124, -1, 7, 'miner', { shift: true });
  };

  // ---- Vehicles
  const drawBus = (w, car, x, y) => {
    const L = car.len;
    const flip = car.dir < 0;
    const col = (i) => (flip ? x + L - 1 - i : x + i);
    const lit = w.dark > 0.35;
    const stopped = (car.v ?? car.speed) < 2;
    for (let i = 1; i < L - 1; i++) w.px(x + i, y + 1, M.ROAD_D);
    for (let i = 0; i < L; i++) {
      const cx = col(i);
      const bellows = i >= 27 && i <= 30;
      if (bellows) {
        for (let j = y - 13; j < y - 1; j++) w.px(cx, j, (i + j) % 2 ? M.BELLOW : M.CAR_DK);
        continue;
      }
      for (let j = y - 14; j <= y - 1; j++) w.px(cx, j, j >= y - 3 ? M.BUS_D : j === y - 14 ? M.BUS_D : M.BUS);
      // One long ribbon of glass, as low-floor buses are
      if (i > 1 && i < L - 1 && i !== 13 && i !== 26 && i !== 31 && i !== 44) {
        for (let j = y - 12; j <= y - 6; j++) {
          w.px(cx, j, M.CAR_GLASS);
          if (lit) w.pxLight(cx, j, N.BUSWIN);
        }
      }
    }
    // Doors, full height. They open at the stop.
    for (const d of [4, 22, 34, 50]) {
      for (let i = 0; i < 4; i++) {
        const cx = col(d + i);
        const gap = stopped && (i === 1 || i === 2);
        for (let j = y - 12; j <= y - 2; j++) {
          if (i === 0 || i === 3) w.px(cx, j, M.BUS_D);
          else if (gap) {
            w.px(cx, j, M.CAR_DK);
            if (lit) w.pxLight(cx, j, N.BUSWIN);
          } else {
            w.px(cx, j, M.CAR_GLASS);
            if (lit) w.pxLight(cx, j, N.BUSWIN);
          }
        }
      }
    }
    // Heads of passengers
    for (const i of [8, 11, 17, 25, 38, 41, 47]) {
      w.px(col(i), y - 8, lit ? M.PAINT_K : M.CAR_DK);
      w.px(col(i), y - 9, lit ? M.PAINT_K : M.CAR_DK);
    }
    // Wheels
    for (const c of [9, 24, 46]) {
      for (let i = 0; i < 4; i++) {
        w.px(col(c + i), y, M.TIRE);
        w.px(col(c + i), y - 1, M.TIRE);
        if (i < 3) w.px(col(c + i), y - 2, M.TIRE);
      }
      w.px(col(c + 1), y - 1, M.BUS_D);
    }
    // Front and rear lights, side destination strip
    w.px(col(L - 1), y - 3, M.CAR_W);
    w.px(col(0), y - 3, M.CAR_R);
    if (w.dark > 0.3) {
      w.pxLight(col(L - 1), y - 3, N.HEAD);
      w.pxLight(col(L - 1), y - 4, N.HEAD);
      w.pxLight(col(0), y - 3, N.TAIL);
      w.pxLight(col(0), y - 4, N.TAIL);
    }
    for (let i = 3; i < 11; i++) {
      w.px(col(L - i), y - 13, M.PAINT_K);
      if (i % 2) w.pxLight(col(L - i), y - 13, N.LED);
    }
  };

  // The little Fiat every Silesian uncle had, still going
  const drawMaluch = (w, car, x, y) => {
    const L = car.len;
    const flip = car.dir < 0;
    const col = (i) => (flip ? x + L - 1 - i : x + i);
    for (let i = 1; i < L - 1; i++) w.px(x + i, y + 1, M.ROAD_D);
    const tops = [4, 5, 5, 6, 8, 9, 9, 9, 9, 9, 8, 7, 5, 4, 4];
    for (let i = 0; i < L; i++) {
      const top = tops[Math.min(i, tops.length - 1)];
      for (let j = y - top; j <= y - 1; j++) w.px(col(i), j, j === y - 1 ? M.CAR_DK : M.CAR_Y);
    }
    for (let i = 4; i < 11; i++) {
      if (i === 7) continue;
      for (let j = y - 8; j <= y - 6; j++) if (j >= y - tops[i] + 1) w.px(col(i), j, M.CAR_GLASS);
    }
    for (const c of [2, 10]) {
      for (let i = 0; i < 3; i++) {
        w.px(col(c + i), y, M.TIRE);
        w.px(col(c + i), y - 1, M.TIRE);
      }
    }
    w.px(col(L - 1), y - 3, M.CAR_W);
    w.px(col(0), y - 3, M.CAR_R);
    if (w.dark > 0.3) {
      w.pxLight(col(L - 1), y - 3, N.HEAD);
      w.pxLight(col(0), y - 3, N.TAIL);
    }
  };

  const drawFarTraffic = (w, t) => {
    for (let i = 0; i < 7; i++) {
      const east = i % 2 === 0;
      const v = 16 + (i * 7) % 11;
      const span = 440;
      const off = i * 67;
      const x = east ? Math.floor((((t * v + off) % span) + span) % span) - 50 : Math.floor(span - ((t * v + off) % span)) - 50;
      w.pxBehind(x, 81, M.CAR_K, east ? N.FARTAIL : N.FARCAR, 2);
      w.pxBehind(x + 1, 81, M.CAR_K, east ? N.FARTAIL : N.FARCAR, 2);
    }
  };

  const drawTrainFar = (w, dt) => {
    const tr = w.train;
    if (tr.wait > 0) {
      tr.wait -= dt;
      return;
    }
    tr.x += dt * 34;
    if (tr.x > 370) {
      tr.x = -110;
      tr.wait = 7;
    }
    const x0 = Math.round(tr.x);
    const y = 99;
    const lit = w.dark > 0.35;
    const L = 86;
    for (let i = 0; i < L; i++) {
      const x = x0 + i;
      const car = Math.floor(i / 29);
      const inCar = i % 29;
      if (inCar === 28) {
        for (let j = y - 3; j < y; j++) w.pxBehind(x, j, M.TR_D);
        continue;
      }
      w.pxBehind(x, y - 8, M.TR_D);
      for (let j = y - 7; j <= y - 1; j++) w.pxBehind(x, j, j >= y - 3 ? M.TR_Y : M.TR_B);
      if (inCar > 2 && inCar < 26 && inCar % 7 !== 0) {
        for (let j = y - 6; j <= y - 5; j++) {
          if (lit) w.pxBehind(x, j, M.TR_D, N.BUSWIN, 1);
          else w.pxBehind(x, j, M.TR_D);
        }
      }
      if (inCar % 7 === 0 && inCar > 0) for (let j = y - 7; j <= y - 2; j++) w.pxBehind(x, j, M.TR_Y);
      if (car === 2 && inCar > 25) for (let j = y - 7; j <= y - 2; j++) w.pxBehind(x, j, M.TR_Y);
      if (inCar === 6 || inCar === 22) {
        w.pxBehind(x, y, M.TIRE);
        w.pxBehind(x + 1, y, M.TIRE);
      }
    }
    // Pantograph up to the catenary
    w.pxBehind(x0 + 40, y - 9, M.TR_D);
    w.pxBehind(x0 + 41, y - 10, M.TR_D);
    w.pxBehind(x0 + 40, y - 11, M.TR_D);
    if (w.dark > 0.3) {
      w.pxBehind(x0 + L - 1, y - 3, M.CAR_W, N.HEAD, 1);
      w.pxBehind(x0, y - 3, M.CAR_R, N.TAIL, 1);
    }
  };

  // ---- Sky
  const drawSky = (w, dt, hour) => {
    const h = hour;
    if (h < 18.4) {
      const t = clamp((h - 12) / (18.1 - 12));
      const low = smooth(15.6, 17.4, h);
      w.sun(mix(118, 8, t), mix(16, 58, t * t * t), low > 0.3 ? 6 : 5, low);
    } else if (h > 29.2) {
      const t = clamp((h - 29.2) / (36 - 29.2));
      const low = 1 - smooth(30.2, 31.8, h);
      w.sun(mix(304, 118, t), mix(82, 16, Math.sqrt(t)), low > 0.3 ? 6 : 5, low);
    }
    if (h > 18.6 && h < 29.4) w.moon(mix(96, 142, (h - 18.6) / 10.8), mix(30, 18, Math.sin(((h - 18.6) / 10.8) * Math.PI)));
    for (const c of w.strata) {
      c.x += c.v * dt;
      if (c.x > 370) c.x = -c.w - 40;
      const cx = Math.round(c.x);
      for (let i = 0; i < c.w; i++) {
        const edge = Math.min(i, c.w - i);
        const thick = Math.round(Math.min(edge * 0.12, 1.5) + Math.sin(i * 0.17 + c.w) * 0.8 + 0.5);
        for (let j = -thick; j <= 0; j++) {
          if ((i + j * 3 + c.y) % 5 === 0 && edge < 18) continue;
          w.pxSky(cx + i, c.y + j, j === 0 ? M.CLOUD_SH : M.CLOUD);
        }
      }
    }
  };

  const drawSmoke = (w, dt, hurry) => {
    const t = w.t;
    // Cooling tower plume leans with the wind and thins out
    const lean = 18 + hurry * 14;
    for (let k = 0; k < 16; k++) {
      const age = (t * 0.06 + k / 16) % 1;
      const x = 25 + Math.sin(age * 5 + k) * 3 + age * lean * 3.2;
      const y = 29 - age * 22;
      const rad = 4 + age * 6;
      for (let j = -rad; j <= rad; j += 1) {
        for (let i = -rad * 1.3; i <= rad * 1.3; i += 1) {
          if ((i * i) / (rad * rad * 1.7) + (j * j) / (rad * rad) > 1) continue;
          // Dithered more as it ages, until it's only haze
          if (((Math.round(x + i) * 3 + Math.round(y + j) * 5 + k) & 7) < age * 7) continue;
          w.pxSky(Math.round(x + i), Math.round(y + j), j > 0 ? M.SMOKE_D : M.SMOKE);
        }
      }
    }
    // Brick stacks and house chimneys: a thread each
    const threads = [...w.smoke, [-2, 17, 0.08], [49, 25, 0.1], [10, 29, 0.06]];
    threads.forEach(([sx, sy, sp], n) => {
      for (let k = 0; k < 7; k++) {
        const age = (t * sp + k / 7 + n * 0.13) % 1;
        const x = Math.round(sx + age * 16 + Math.sin(age * 6 + n) * 1.5);
        const y = Math.round(sy - age * 15);
        w.pxSky(x, y, M.SMOKE);
        if (age > 0.35) w.pxSky(x + 1, y, M.SMOKE_D);
      }
    });
  };

  // ---- Mine
  const drawMineLive = (w, dt) => {
    const m = w.mine;
    m.t += dt;
    // Sixteen seconds' wind, then a pause at the bank, then the other way
    const cycle = 20;
    const phase = m.t % (cycle * 2);
    const leg = phase % cycle;
    const dirn = phase < cycle ? 1 : -1;
    const speed = smooth(0, 2, leg) * (1 - smooth(14, 16, leg)) * dirn;
    const frac = smooth(0, 16, leg);
    const pos = dirn > 0 ? frac : 1 - frac;
    for (const s of w.wheels) {
      s.a += s.dir * speed * dt * 1.5;
      for (let k = 0; k < 6; k++) {
        const a = s.a + (k * Math.PI) / 3;
        const ca = Math.cos(a);
        const sa = Math.sin(a);
        for (let r = 1; r < s.r - 1; r++) {
          const x = s.x + Math.round(ca * r);
          const y = s.y + Math.round(sa * r);
          w.px(x, y, k === 0 ? M.WHEEL_M : M.WHEEL);
          if (k === 0) w.pxLight(x, y, N.AMBER, 2);
          else w.pxLight(x, y, N.FLOOD_LO, 2);
        }
      }
      w.rect(s.x - 1, s.y - 1, 3, 3, M.IRON_L);
    }
    // Two cages in the shaft, always passing each other
    const cage = (x, f) => {
      const y = Math.round(mix(38, 62, f));
      w.rect(x, y, 5, 5, M.IRON_D);
      w.rect(x + 1, y + 1, 3, 3, M.MINEGL);
      w.lightRect(x + 2, y + 2, 1, 2, N.CAGE, 2);
      w.rect(x + 2, 34, 1, y - 34, M.PAINT_K);
    };
    cage(267, pos);
    cage(281, 1 - pos);
  };

  // ---- Pigeons
  const drawPigeons = (w, dt, hour, hurry) => {
    const day = w.dark < 0.55;
    const p = w.pig;
    const [lx, ly] = w.loftAt;
    p.t -= dt;
    if (p.force > 0) p.force -= dt;
    // Up for half a minute, home for a quarter
    const flying = p.force > 0 || (day && p.t > 0);
    if (p.t < -14) p.t = 32;
    p.air = clamp(p.air + (flying ? dt * 0.55 : -dt * 0.4));
    const air = p.air * p.air * (3 - 2 * p.air);
    p.spin = (p.spin || 0) + dt * (0.72 + hurry * 0.6);
    const flap = Math.floor(w.t * 9);
    w.flock.forEach((b, i) => {
      if (!day && p.air === 0) return;
      const a = p.spin + b.p;
      const cx = 66 + Math.cos(a) * 42 * b.r;
      const cy = 30 + Math.sin(a) * 11 * b.r + Math.sin(a * 2 + i) * 2;
      const hx = lx + b.home;
      const x = Math.round(mix(hx, cx, air));
      const y = Math.round(mix(ly, cy, air));
      const m = b.grey ? M.PIGEON_D : M.PIGEON;
      w.px(x, y, m);
      w.px(x + 1, y, m);
      if (air < 0.02) {
        w.px(x, y - 1, m);
      } else if ((flap + i) % 2) {
        w.px(x - 1, y - 1, m);
        w.px(x + 2, y - 1, m);
      } else {
        w.px(x - 1, y + 1, m);
        w.px(x + 2, y + 1, m);
      }
    });
    // Pigeon man on the ridge, waving a pole to keep them up
    if (day) {
      const mx = lx + 21;
      const my = 53;
      const sway = flying ? Math.round(Math.sin(w.t * 2.2) * 2) : 0;
      w.rect(mx, my - 2, 3, 2, M.PANTS);
      w.rect(mx, my - 6, 3, 4, M.COAT);
      w.rect(mx, my - 9, 3, 3, M.SKIN);
      w.rect(mx - 1, my - 9, 5, 1, M.SHED_D);
      if (flying) {
        line(mx + 3, my - 5, mx + 5 + sway * 2, my - 17, (x, y) => w.px(x, y, M.SHED_D));
        const fx = mx + 5 + sway * 2;
        w.rect(fx, my - 17, 3, 2, M.GERAN);
      } else {
        line(mx + 4, my - 1, mx + 4, my - 13, (x, y) => w.px(x, y, M.SHED_D));
      }
    }
  };

  const drawGranny = (w, dt) => {
    const [x, y] = w.grannyAt;
    if (w.dark > 0.5) return;
    const g = w.granny;
    if (g.fist > 0) g.fist -= dt;
    // Looks down the street one way, then the other; nothing gets past this window
    const look = Math.sin(w.t * 0.23) + Math.sin(w.t * 0.61) * 0.4;
    const dx = look > 0.45 ? 1 : look < -0.45 ? -1 : 0;
    const hx = x + 2;
    const hy = y + 1;
    // Dark room behind
    w.rect(x + 1, y + 1, 2, 2, M.COAL);
    w.rect(x + 4, y + 1, 2, 2, M.COAL);
    w.rect(x + 1, y + 4, 2, 5, M.COAL);
    w.rect(x + 4, y + 4, 2, 5, M.COAL);
    // Headscarf and face
    w.rect(hx + dx, hy, 3, 1, M.APRON);
    w.rect(hx + dx, hy + 1, 3, 2, M.SKIN);
    w.px(hx + dx + (dx >= 0 ? 0 : 2), hy + 1, M.APRON);
    w.px(hx + dx + (dx >= 0 ? 2 : 0), hy + 2, M.HAIR);
    w.rect(hx + dx, hy + 3, 3, 1, M.GREYH);
    // Shoulders, arms folded on the cushion
    w.rect(x + 1, y + 5, 5, 3, M.APRON);
    w.px(x + 3, y + 6, M.CURTAIN);
    w.px(x + 2, y + 7, M.CURTAIN);
    w.rect(x - 1, y + 8, 9, 2, M.CUSHION);
    w.rect(x - 1, y + 9, 9, 1, M.TEN_Y_D);
    w.rect(x, y + 7, 2, 1, M.SKIN);
    w.rect(x + 5, y + 7, 2, 1, M.SKIN);
    if (g.fist > 0) {
      const up = Math.floor(w.t * 8) % 2;
      w.rect(x + 7, y + 3 + up, 1, 4, M.APRON);
      w.rect(x + 7, y + 1 + up, 2, 2, M.SKIN);
    }
  };

  const drawYardLife = (w, dt, hurry) => {
    const [tx, ty] = w.yardAt;
    const day = w.dark < 0.4;
    // Washing across the yard
    if (day) {
      const ly = 74;
      w.wire(50, ly, 78, ly, 2, M.IRON_D);
      const items = [[54, 7, 8, M.CURTAIN], [63, 5, 6, M.COAT_B], [70, 5, 7, M.GERAN]];
      for (const [x, wd, h, m] of items) {
        for (let i = 0; i < wd; i++) {
          const sag = w.wireY(50, ly, 78, ly, 2, x + i);
          const sway = Math.round(Math.sin(w.t * (1.6 + hurry * 6) + x + i * 0.4) * (0.7 + hurry * 2));
          for (let j = 0; j < h - (i % 3 === 0 ? 1 : 0); j++) w.px(x + i + (j > h / 2 ? sway : 0), sag + 1 + j, m);
        }
      }
    }
    // Rug over the trzepak, and a cloud from every whack
    w.rect(tx + 4, ty + 1, 9, 7, M.RUG);
    for (let i = 0; i < 9; i += 2) w.px(tx + 4 + i, ty + 7, M.RUG_L);
    w.rect(tx + 5, ty + 3, 7, 1, M.RUG_L);
    w.rect(tx + 7, ty + 2, 3, 4, M.COAT_B);
    if (!day) return;
    const beat = (w.t * 1.15) % 3;
    const swing = beat < 1.4 ? Math.floor(beat * 5) % 2 : 0;
    const bx = tx + 17;
    w.rect(bx, 114, 3, 3, M.PANTS);
    w.rect(bx, 108, 3, 6, M.COAT_R);
    w.rect(bx, 105, 3, 3, M.SKIN);
    w.rect(bx, 105, 3, 1, M.GREYH);
    if (swing) line(bx - 1, 109, tx + 11, 106, (x, y) => w.px(x, y, M.SHED_L));
    else line(bx - 1, 109, tx + 12, 111, (x, y) => w.px(x, y, M.SHED_L));
    if (beat < 1.4 && swing) for (let i = 0; i < 5; i++) w.px(tx + 6 + ((i * 3 + Math.floor(w.t * 6)) % 7), ty - 1 - (i % 3), M.SMOKE_D);
  };

  const drawBench = (w, dt, hour) => {
    const present = hour < 20.6 || hour > 30.5;
    const x = 146;
    w.dog.bark = Math.max(0, w.dog.bark - dt);
    if (present) {
      // Grandfather, flat cap, stick, the pipe going
      w.rect(x, 110, 3, 6, M.COAT);
      w.rect(x + 3, 114, 3, 2, M.PANTS);
      w.rect(x + 5, 116, 1, 3, M.PANTS);
      w.rect(x + 6, 118, 1, 1, M.CAR_DK);
      w.rect(x, 107, 3, 3, M.SKIN);
      w.rect(x - 1, 106, 5, 1, M.SHED_D);
      w.rect(x, 105, 3, 1, M.SHED_D);
      w.px(x + 3, 109, M.SHED_D);
      if (w.dark > 0.2 && Math.sin(w.t * 1.2) > 0) w.pxLight(x + 4, 109, N.EMBERP);
      else w.px(x + 4, 109, M.SHED_D);
      const puff = (w.t * 0.5) % 1;
      w.pxSky(x + 5 + Math.round(puff * 4), 106 - Math.round(puff * 8), M.SMOKE);
      w.rect(x + 8, 110, 1, 9, M.SHED_D);
    }
    // The dog goes in with the old man
    if (!present) return;
    const dx = x + 11;
    const wag = Math.floor(w.t * (w.dog.bark > 0 ? 12 : 4)) % 2;
    const up = w.dog.bark > 0 && Math.floor(w.t * 7) % 2 ? 1 : 0;
    w.rect(dx, 120 - up, 6, 2, M.DOG);
    w.rect(dx, 122, 1, 1, M.DOG_D);
    w.rect(dx + 5, 122, 1, 1, M.DOG_D);
    w.rect(dx + 1, 122, 1, 1, M.DOG_D);
    w.rect(dx + 4, 122, 1, 1, M.DOG_D);
    w.rect(dx - 2, 118 - up, 3, 3, M.DOG);
    w.px(dx - 3, 119 - up, M.DOG_D);
    w.px(dx - 1, 118 - up, M.DOG_D);
    w.px(dx - 2, 119 - up, M.PAINT_K);
    w.px(dx + 6, wag ? 118 : 119, M.DOG_D);
    w.px(dx + 6, 120, M.DOG_D);
    if (w.dog.bark > 0 && up) {
      w.px(dx - 5, 118, M.TEN_T);
      w.px(dx - 6, 117, M.TEN_T);
    }
  };

  const drawFountainLive = (w) => {
    const x = 180;
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

  const drawSignsLive = (w, dt, hour) => {
    const t = w.t;
    // Time clock, the FAJRANT sign's alibi
    const hh = Math.floor(hour % 24);
    const mm = Math.floor((hour % 1) * 60);
    const text = `${hh < 10 ? '0' : ''}${hh}:${mm < 10 ? '0' : ''}${mm}`;
    let cx = w.clockAt[0];
    const blink = Math.sin(t * Math.PI) > -0.3;
    for (const ch of text) {
      if (ch !== ':' || blink) w.glyph(ch, cx, w.clockAt[1], (x, y) => w.pxLight(x, y, N.LED));
      cx += ch === ':' ? 4 : 4;
    }
    // Kino: bulbs chase around the board
    const [kx, ky, kw, kh] = w.kinoAt;
    const lv = w.levels[w.kinoG];
    if (lv > 0.2) {
      const chase = Math.floor(t * 8);
      let idx = 0;
      const bulb = (x, y) => {
        if ((idx++ + chase) % 3 === 0) w.pxLight(x, y, N.YEL);
      };
      for (let i = 0; i < kw - 1; i += 2) bulb(kx + i, ky);
      for (let j = 2; j < kh; j += 2) bulb(kx + kw - 2, ky + j);
      for (let i = kw - 3; i >= 0; i -= 2) bulb(kx + i, ky + kh - 1);
      for (let j = kh - 3; j > 0; j -= 2) bulb(kx, ky + j);
    }
    // Mug fills from the tap, tips to the street, starts again
    const mx = 285;
    const my = 105;
    const piwo = w.levels[w.piwoG] > 0.3;
    const cyc = (t * 0.22) % 1;
    const fill = cyc < 0.55 ? cyc / 0.55 : cyc < 0.75 ? 1 : 1 - (cyc - 0.75) / 0.25;
    const tilt = piwo ? smooth(0.58, 0.68, cyc) * (1 - smooth(0.92, 1, cyc)) : 0;
    const H = 10;
    const put = (i, j, n) => {
      const x = mx + i + Math.round(tilt * ((H - j) / 3.2));
      const y = my + j;
      if (piwo) {
        w.px(x, y, M.TUBE);
        if (n) w.pxLight(x, y, n, 1);
      } else if (n === N.AMBER) w.px(x, y, M.TUBE);
    };
    for (let j = 0; j < H; j++) {
      put(0, j, N.AMBER);
      put(5, j, N.AMBER);
    }
    for (let i = 0; i < 6; i++) put(i, H - 1, N.AMBER);
    // Handle
    put(6, 2, N.AMBER);
    put(6, 6, N.AMBER);
    put(7, 3, N.AMBER);
    put(7, 4, N.AMBER);
    put(7, 5, N.AMBER);
    const level = Math.round((H - 2) * fill);
    for (let k = 0; k < level; k++) for (let i = 1; i < 5; i++) put(i, H - 2 - k, N.BEER);
    if (level > 0) for (let i = 1; i < 5; i++) put(i, H - 2 - level, N.FOAM);
    if (piwo && fill > 0.95 && !tilt) for (let i = 0; i < 6; i++) put(i, -1, N.FOAM);
    // Steam off the plate
    if (w.levels[w.plateG] > 0.3) {
      const steam = Math.floor(t * 3);
      for (const sx of [260, 264]) {
        const up = (steam + sx) % 3;
        w.pxLight(sx, 105 - up, N.FLOOD);
      }
    }
    // Sodium lamp on a bad ballast: dies, tries twice, comes back
    const f = t % 19;
    if (w.levels[w.lampBadG] > 0.5 && f < 1.1) {
      const on = f > 0.28 && f < 0.36;
      const on2 = f > 0.58 && f < 0.7;
      w.levels[w.lampBadG] = on || on2 ? 0.8 : 0.08;
    }
  };

  const drawWindowsLive = (w) => {
    // Evening news: the blue jumps with every cut
    const cut = Math.floor(w.t * 1.7);
    if (w.levels[w.tvG] > 0.3) w.levels[w.tvG] = 0.55 + ((cut * 2654435761) >>> 28) / 34;
    // Somebody going between the stove and the table
    if (w.levels[w.kitchenG] > 0.3) {
      const [x, y] = w.kitchenAt;
      const pos = Math.round(1 + (Math.sin(w.t * 0.5) + Math.sin(w.t * 0.17)) * 1.1 + 1.6);
      for (let j = 3; j < 9; j++) {
        const hw = j < 5 ? 1 : 2;
        for (let i = 0; i < hw; i++) {
          const px = x + pos + i;
          if (px === x + 3 || px >= x + 6 || j === 3) continue;
          w.px(px, y + j, M.BRK_S);
        }
      }
    }
  };

  const drawStudio = (w) => {
    if (w.levels[w.studioG] < 0.3) return;
    const [x, y] = w.studioAt;
    const t = w.t;
    // Barely any light: only what two monitors throw on a desk
    w.rect(x, y, 11, 9, M.COAL);
    w.rect(x + 3, y + 6, 8, 1, M.SHED_D);
    for (let i = 4; i < 11; i++) w.pxLight(x + i, y + 6, N.MON_D);
    // Two screens, code crawling up them
    for (const mx of [x + 4, x + 8]) {
      for (let j = 0; j < 4; j++) {
        const row = Math.floor(t * 1.4) + j + mx;
        for (let i = 0; i < 3; i++) {
          w.px(mx + i, y + 1 + j, M.PAINT_K);
          // Each line a different length, so it reads as text and not a lamp
          if (i < 1 + ((row * 5) % 3)) w.pxLight(mx + i, y + 1 + j, N.MON);
          else w.pxLight(mx + i, y + 1 + j, N.MON_D);
        }
      }
      w.px(mx + 1, y + 5, M.PAINT_K);
    }
    // In profile on the chair, typing
    w.rect(x + 1, y + 1, 2, 3, M.PAINT_K);
    w.rect(x, y + 4, 3, 3, M.PAINT_K);
    w.pxLight(x + 2, y + 2, N.MON_D);
    w.pxLight(x + 2, y + 5, N.MON_D);
    const key = Math.floor(t * 9) % 3 === 0 ? 1 : 0;
    w.px(x + 3, y + 5 - key, M.PAINT_K);
    w.pxLight(x + 3, y + 5 - key, N.MON_D);
    w.px(x + 1, y + 7, M.SHED_D);
  };

  // ---- People
  const drawFolk = (w, dt, hour) => {
    const rainy = w.rain > 0.35;
    const sorted = [...w.peds].sort((a, b) => a.y - b.y);
    const dead = hour > 26.5 && hour < 29.5;
    const day = hour < 18 || hour > 30;
    const shiftHour = (hour > 17.9 && hour < 19.6) || (hour > 21.6 && hour < 22.8) || (hour > 13.7 && hour < 14.6) || (hour > 29.6 && hour < 30.6);
    sorted.forEach((p, idx) => {
      p.x += p.dir * p.speed * dt;
      if (p.x > 370) p.x = -40;
      if (p.x < -40) p.x = 370;
      if (p.dayOnly && !day) return;
      if (p.nightOnly && hour < 17.5) return;
      if (p.shift && !shiftHour) return;
      if (dead && idx % 3) return;
      const x = Math.round(p.x);
      const y = p.y;
      const step = Math.floor(((p.x * 0.5 + p.phase) % 2) + 2) % 2;
      const flip = p.dir < 0;
      const miner = p.kind === 'miner';
      const top = miner ? M.MINER : p.top;
      w.px(x, y + 1, M.WALK_D);
      w.px(x + 1, y + 1, M.WALK_D);
      w.px(x + 2, y + 1, M.WALK_D);
      const leg = M.PANTS;
      if (step) {
        w.px(x, y, leg);
        w.px(x + 2, y, leg);
        w.px(x, y - 1, leg);
        w.px(x + 2, y - 1, leg);
      } else {
        w.px(x + 1, y, leg);
        w.px(x + 1, y - 1, leg);
      }
      w.rect(x, y - 2, 3, 1, leg);
      w.rect(x, y - 6, 3, 4, top);
      w.rect(x, y - 9, 3, 3, M.SKIN);
      if (miner) {
        // Reflective stripe, helmet with the brim, lamp on the front, lunch tin swinging
        w.rect(x, y - 4, 3, 1, M.HIVIZ);
        w.rect(x, y - 10, 3, 2, M.HELM);
        w.px(flip ? x - 1 : x + 3, y - 8, M.HELM);
        const lampX = flip ? x - 1 : x + 3;
        w.px(lampX, y - 9, M.TIN);
        if (w.dark > 0.2) {
          w.pxLight(lampX, y - 9, N.HEAD);
          w.pxLight(flip ? x - 2 : x + 4, y - 9, N.POOL_L);
        }
        const tx = flip ? x + 3 : x - 1;
        w.rect(tx, y - 3 + step, 1, 2, M.TIN);
        w.px(flip ? tx + 1 : tx - 1, y - 3 + step, M.TIN);
        w.px(flip ? tx + 1 : tx - 1, y - 2 + step, M.TIN);
      } else {
        w.rect(x, y - 9, 3, 1, p.hair || M.HAIR);
        w.px(flip ? x + 2 : x, y - 8, p.hair || M.HAIR);
        if (p.pack) {
          const bx = flip ? x + 3 : x - 1;
          w.rect(bx, y - 6, 1, 4, p.pack);
          w.rect(flip ? bx + 1 : bx - 1, y - 5, 1, 3, p.pack);
        }
        if (rainy) {
          const ux = x + 1;
          for (let i = -3; i <= 3; i++) {
            const uy = y - 11 - (Math.abs(i) < 2 ? 2 : Math.abs(i) < 3 ? 1 : 0);
            w.px(ux + i, uy, M.UMB);
          }
          w.px(ux, y - 14, M.SHIRT);
          w.px(ux, y - 10, M.STEEL_LT);
        }
      }
    });
  };

  const draw = (w, dt, hour, hurry) => {
    drawSky(w, dt, hour);
    drawSmoke(w, dt, hurry);
    w.drawBeacons();
    drawFarTraffic(w, w.t);
    drawTrainFar(w, dt);
    drawMineLive(w, dt);
    drawYardLife(w, dt, hurry);
    drawPigeons(w, dt, hour, hurry);
    drawGranny(w, dt);
    drawFountainLive(w);
    drawSignsLive(w, dt, hour);
    drawStudio(w);
    drawWindowsLive(w);
    drawBench(w, dt, hour);
    w.drawCat(dt, hour);
    // The bus pulls in at the stop for a few seconds, cars queue behind it
    for (const car of w.cars) {
      if (car.kind !== 'bus') continue;
      if (car.stop > 0) {
        car.stop -= dt;
        car.speed = car.stop > 0 ? 0 : 30;
        if (car.stop <= 0) car.left = true;
      } else if (!car.left && car.x < car.stopX + 8 && car.x > car.stopX) {
        car.stop = 5;
        car.speed = 0;
      } else if (car.x > 300) car.left = false;
    }
    w.drawTraffic(dt);
    drawFolk(w, dt, hour);
  };

  // Sodium on wet tarmac: the long orange smears a lamp makes, wider than reflect() gets from a tiny head
  const sodiumStreaks = (w) => {
    if (w.wet < 0.05 || w.dark < 0.3) return;
    const pix = w.rgba;
    const road = w.roadMats;
    const tick = Math.floor(w.t * 6);
    for (const [hx, g] of w.lampHeads) {
      const lv = w.levels[g];
      if (lv < 0.2) continue;
      for (let y = 129; y < 147; y++) {
        const fall = 1 - (y - 129) / 22;
        for (let i = -3; i <= 3; i++) {
          const wob = w.shimmer[(hx * 7 + y * 13 + i * 3 + tick) & 1023];
          const x = hx + i + (wob >> 1);
          if (x < -40 || x >= 360) continue;
          const j = (y + PAD_Y) * BW + x + PAD_X;
          if (!road.has(w.fmat[j])) continue;
          if (Math.abs(wob) > 2 && (y & 1)) continue;
          const a = lv * w.wet * fall * (1 - Math.abs(i) / 4.5);
          const k = j * 4;
          pix[k] = Math.min(255, pix[k] + 118 * a);
          pix[k + 1] = Math.min(255, pix[k + 1] + 56 * a);
          pix[k + 2] = Math.min(255, pix[k + 2] + 14 * a);
        }
      }
    }
  };

  const post = (w, dt) => {
    w.drawBeams();
    w.reflect();
    sodiumStreaks(w);
    w.drawRain(dt);
  };

  const startle = (w) => {
    w.pig.force = 14;
    w.dog.bark = 1.6;
    w.cat.puff = 1.4;
    w.granny.fist = 2.2;
  };

  CitySwitch.define('gliwice-switch', {
    city: 'Gliwice',
    label: 'Dark mode',
    tube: ['#ff5a14', '#46c8ff'],
    body: ['#e4dccb', '#100c0a'],
    glass: 'rain',
    grade,
    sky: SKY,
    weather: (h) => {
      const on = smooth(19.5, 20.5, h);
      return {
        rain: 0.45 * on * (1 - smooth(27.5, 28.5, h)),
        wet: 0.8 * on * (1 - smooth(29, 30.5, h)),
        glass: 0.6 * on * (1 - smooth(28, 29.5, h)),
      };
    },
    glyphs: {
      // Tall bent-glass letters for the one sign that matters
      f: ['######', '######', '##....', '##....', '#####.', '#####.', '##....', '##....', '##....'],
      a: ['.####.', '######', '##..##', '##..##', '######', '######', '##..##', '##..##', '##..##'],
      j: ['...###', '...###', '....##', '....##', '....##', '....##', '##..##', '######', '.####.'],
      r: ['#####.', '######', '##..##', '##..##', '#####.', '####..', '##.##.', '##..##', '##..##'],
      n: ['##..##', '###.##', '###.##', '######', '######', '##.###', '##.###', '##..##', '##..##'],
      t: ['######', '######', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..'],
      // The stock 3x5 W reads as H, and that's the one letter WĘGIEL and PIWO can't lose
      W: ['#...#', '#...#', '#.#.#', '#.#.#', '.#.#.'],
      // Accents sit above a 3x5 body; padded so a centred draw keeps the baseline
      Ę: ['...', '###', '#..', '##.', '#..', '###', '..#'],
      Ś: ['..#', '.#.', '###', '#..', '###', '..#', '###', '...', '...'],
      Ć: ['..#', '.#.', '###', '#..', '#..', '#..', '###', '...', '...'],
      Ż: ['.#.', '...', '###', '..#', '.#.', '#..', '###', '...', '...'],
    },
    street: (M) => [M.COBBLE, M.COBBLE_D],
    palette,
    build,
    draw,
    post,
    startle,
  });
})();
