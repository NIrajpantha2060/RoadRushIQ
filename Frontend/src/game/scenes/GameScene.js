import Phaser from 'phaser';

// ── Road layout ────────────────────────────────
const LANES      = 4;
const ROAD_FRAC  = 0.80;

// ── Speed ──────────────────────────────────────
const BASE_SPEED    = 160;
const MAX_SPEED     = 520;
const ACCEL         = 60;
const BRAKE         = 100;
const PASSIVE_DECEL = 22;

// ── Hitboxes ───────────────────────────────────
const BIKE_HW   = 11;
const BIKE_HH   = 26;
const CAR_HW    = 14;
const CAR_HH    = 30;
const TRUCK_HW  = 16;
const TRUCK_HH  = 42;
const COIN_R    = 16;

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {}

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.W = W;
    this.H = H;

    // Road geometry
    this.roadWidth  = W * ROAD_FRAC;
    this.roadLeft   = (W - this.roadWidth) / 2;
    this.laneWidth  = this.roadWidth / LANES;

    // Lane centres
    this.laneCentres = Array.from({ length: LANES }, (_, i) =>
      this.roadLeft + this.laneWidth * i + this.laneWidth / 2
    );

    // Game state
    this.speed       = BASE_SPEED * 0.5;
    this.currentLane = 2;
    this.fromLane    = 2;
    this.toLane      = 2;
    this.laneT       = 1;
    this.isChanging  = false;
    this.alive       = true;
    this.score       = 0;
    this.coins       = 0;

    // Registry
    this.registry.set('score',    0);
    this.registry.set('coins',    0);
    this.registry.set('speed',    0);
    this.registry.set('gameOver', false);

    // Object pools
    this._traffic       = [];
    this._coins         = [];
    this._spawnTimer    = 0;
    this._coinTimer     = 0;
    this._spawnInterval = 1400;
    this._coinInterval  = 1000;

    // Build scene
    this._createRoad();
    this._createDivider();
    this._createLaneDashes();
    this._createBike();

    // Input
    this.keys = this.input.keyboard.addKeys({
      up:    Phaser.Input.Keyboard.KeyCodes.UP,
      down:  Phaser.Input.Keyboard.KeyCodes.DOWN,
      left:  Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      d: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this._prevLeft  = false;
    this._prevRight = false;

    // Launch HUD
    if (!this.scene.isActive('UIScene')) {
      this.scene.launch('UIScene');
    } else {
      this.registry.set('gameOver', false);
    }
    this.scene.bringToTop('UIScene');

    // Score ticker
    this.time.addEvent({
      delay: 100, loop: true,
      callback: () => {
        if (!this.alive) return;
        this.score += Math.round(this.speed / 14);
        this.registry.set('score', this.score);
      },
    });
  }

  // ─── UPDATE ──────────────────────────────────
  update(_, delta) {
    if (!this.alive) return;
    const dt = delta / 1000;

    this._handleInput(dt);

    // Ramp spawn intervals with speed
    const t = Phaser.Math.Clamp((this.speed - 80) / (MAX_SPEED - 80), 0, 1);
    this._spawnInterval = Phaser.Math.Linear(1600, 550, t);
    this._coinInterval  = Phaser.Math.Linear(1100, 480, t);

    // Spawn
    this._spawnTimer += delta;
    this._coinTimer  += delta;
    if (this._spawnTimer >= this._spawnInterval) { this._spawnTimer = 0; this._spawnTraffic(); }
    if (this._coinTimer  >= this._coinInterval)  { this._coinTimer  = 0; this._spawnCoinGroup(); }

    // Move traffic
    this._updateTraffic(dt);

    // Lane tween
    if (this.isChanging) {
      this.laneT = Math.min(this.laneT + dt / 0.18, 1);
      const ease = this._easeInOut(this.laneT);
      const x = Phaser.Math.Linear(
        this.laneCentres[this.fromLane],
        this.laneCentres[this.toLane],
        ease
      );
      this.bike.x       = x;
      this.bikeShadow.x = x;
      this.bikeGlow.x   = x;
      this.bike.angle   = (this.toLane > this.fromLane ? 1 : -1) * 12 * Math.sin(this.laneT * Math.PI);
      if (this.laneT >= 1) {
        this.isChanging  = false;
        this.currentLane = this.toLane;
        this.bike.angle  = 0;
      }
    }

    // Scroll dashes
    this._scrollDashes(dt);

    // Speed lines
    this._renderSpeedLines();

    // Collisions
    this._checkCollisions();

    // Speed display (km/h feel)
    this.registry.set('speed', Math.round(this.speed * 0.72));
  }

  // ═══════════════════════════════════════════
  //  ROAD
  // ═══════════════════════════════════════════

  _createRoad() {
    const W = this.W, H = this.H;

    this.add.rectangle(W / 2, H / 2, W, H, 0x0d0d1a).setDepth(0);

    const sW = (W - this.roadWidth) / 2;
    this.add.rectangle(sW / 2,     H / 2, sW, H, 0x0a100a).setDepth(0);
    this.add.rectangle(W - sW / 2, H / 2, sW, H, 0x0a100a).setDepth(0);

    const halfW = this.roadWidth / 2;
    // Left half — oncoming lanes (slightly darker)
    this.add.rectangle(this.roadLeft + halfW / 2,           H / 2, halfW, H, 0x1a1c30).setDepth(1);
    // Right half — player lanes
    this.add.rectangle(this.roadLeft + halfW + halfW / 2,   H / 2, halfW, H, 0x1e2038).setDepth(1);

    // Edge kerbs
    this.add.rectangle(this.roadLeft - 3,                   H / 2, 5, H, 0xffffff).setAlpha(0.22).setDepth(2);
    this.add.rectangle(this.roadLeft + this.roadWidth + 3,  H / 2, 5, H, 0xffffff).setAlpha(0.22).setDepth(2);

    // Subtle texture
    for (let i = 0; i < 6; i++) {
      this.add.rectangle(
        this.roadLeft + (i + 1) * (this.roadWidth / 7),
        H / 2, 1, H, 0xffffff
      ).setAlpha(0.03).setDepth(2);
    }
  }

  _createDivider() {
    const H  = this.H;
    const cx = this.roadLeft + this.roadWidth / 2;
    this.add.rectangle(cx,     H / 2, 5, H, 0xf7c948).setAlpha(0.9).setDepth(3);
    this.add.rectangle(cx - 8, H / 2, 2, H, 0xf7c948).setAlpha(0.25).setDepth(3);
    this.add.rectangle(cx + 8, H / 2, 2, H, 0xf7c948).setAlpha(0.25).setDepth(3);
  }

  _createLaneDashes() {
    const H       = this.H;
    const dashH   = 46;
    const gapH    = 38;
    this._dashCycle = dashH + gapH;
    this.laneDashes = [];

    // Dashes between lane 0-1 (left side) and lane 2-3 (right side)
    const dashCols = [1, 3];
    for (const col of dashCols) {
      const x     = this.roadLeft + this.laneWidth * col;
      const count = Math.ceil(H / this._dashCycle) + 2;
      for (let row = 0; row < count; row++) {
        const dash = this.add
          .rectangle(x, row * this._dashCycle - dashH / 2, 3, dashH, 0xffffff)
          .setAlpha(0.14).setDepth(3);
        this.laneDashes.push({ dash, side: col === 1 ? 'left' : 'right' });
      }
    }
  }

  _scrollDashes(dt) {
    const H     = this.H;
    const shift = this.speed * dt;
    const count = Math.ceil(H / this._dashCycle) + 2;

    for (const { dash, side } of this.laneDashes) {
      if (side === 'right') {
        // Player side — dashes scroll down (same direction as traffic behind)
        dash.y += shift;
        if (dash.y > H + this._dashCycle) {
          dash.y -= count * this._dashCycle;
        }
      } else {
        // Oncoming side — dashes scroll up
        dash.y -= shift;
        if (dash.y < -this._dashCycle) {
          dash.y += count * this._dashCycle;
        }
      }
    }
  }

  // ═══════════════════════════════════════════
  //  PLAYER BIKE
  // ═══════════════════════════════════════════

  _createBike() {
    const x = this.laneCentres[this.currentLane];
    const y = this.H * 0.75;

    this.bikeGlow   = this.add.ellipse(x, y + 4,  34, 14, 0x00c3ff, 0.18).setDepth(8);
    this.bikeShadow = this.add.ellipse(x, y + 10, 28, 10, 0x000000, 0.35).setDepth(9);

    const gfx = this._drawBike();
    this.bike  = this.add.container(x, y, [gfx]).setDepth(10);

    this.speedLineGfx = this.add.graphics().setDepth(7);
  }

  _drawBike() {
    const g = new Phaser.GameObjects.Graphics(this);

    // Rear wheel
    g.fillStyle(0x111122, 1);
    g.fillEllipse(0, 22, 18, 10, 16);
    g.fillStyle(0x3a3a5c, 1);
    g.fillEllipse(0, 22, 12, 7, 16);
    g.fillStyle(0x888899, 0.7);
    g.fillCircle(0, 22, 3);

    // Front wheel
    g.fillStyle(0x111122, 1);
    g.fillEllipse(0, -22, 16, 9, 16);
    g.fillStyle(0x3a3a5c, 1);
    g.fillEllipse(0, -22, 10, 6, 16);
    g.fillStyle(0x888899, 0.7);
    g.fillCircle(0, -22, 2.5);

    // Body
    g.fillStyle(0xe74c3c, 1);
    g.fillRoundedRect(-7, -16, 14, 32, 4);

    // Fuel tank
    g.fillStyle(0xc0392b, 1);
    g.fillRoundedRect(-6, -14, 12, 14, 3);

    // Windscreen
    g.fillStyle(0x7ec8e3, 0.80);
    g.fillRoundedRect(-4, -18, 8, 8, 2);

    // Headlight
    g.fillStyle(0xfff5aa, 0.95);
    g.fillRoundedRect(-4, -26, 8, 5, 2);

    // Tail light
    g.fillStyle(0xff3333, 0.9);
    g.fillRoundedRect(-4, 17, 8, 4, 2);

    // Rider helmet
    g.fillStyle(0x2c3e50, 1);
    g.fillCircle(0, -8, 7);
    g.fillStyle(0x3d5166, 1);
    g.fillRoundedRect(-5, -12, 10, 6, 2);

    // Visor
    g.fillStyle(0x7ec8e3, 0.6);
    g.fillRoundedRect(-4, -10, 8, 3, 1);

    // Exhausts
    g.fillStyle(0x888899, 0.8);
    g.fillRect(7,   2, 4, 14);
    g.fillRect(-11, 2, 4, 14);

    // Mirrors
    g.fillStyle(0x555566, 1);
    g.fillRect(-10, -6, 4, 2);
    g.fillRect(6,   -6, 4, 2);

    return g;
  }

  _renderSpeedLines() {
    const g = this.speedLineGfx;
    g.clear();
    if (this.speed < BASE_SPEED * 0.9) return;

    const intensity = Phaser.Math.Clamp((this.speed - BASE_SPEED * 0.8) / MAX_SPEED, 0, 0.55);
    const cx = this.bike.x;
    const cy = this.bike.y;

    g.lineStyle(1.5, 0xffffff, intensity * 0.7);
    const count = Math.floor(intensity * 10) + 3;
    for (let i = 0; i < count; i++) {
      const ox  = (i % 2 === 0 ? -1 : 1) * (16 + i * 5);
      const len = 18 + i * 7;
      g.beginPath();
      g.moveTo(cx + ox, cy + 28);
      g.lineTo(cx + ox, cy + 28 + len);
      g.strokePath();
    }
  }

  // ═══════════════════════════════════════════
  //  TRAFFIC
  // ═══════════════════════════════════════════

  /**
   * Returns a Set of lane indices that currently have a vehicle
   * inside the danger window ahead of the player.
   * Used to prevent spawning a 3-lane block.
   */
  _countDangerLanes() {
    const dangerTop = this.bike.y - 420;
    const dangerBot = this.bike.y - 80;
    const occupied  = new Set();

    for (const tr of this._traffic) {
      const y = tr.container.y;
      if (y > dangerTop && y < dangerBot) {
        occupied.add(tr.lane);
      }
    }
    return occupied;
  }

  /**
   * Spawns a single traffic vehicle with its own independent speed.
   *
   * CHANGES vs original:
   * 1. Each NPC gets a `npcSpeed` property — its own absolute world speed.
   *    Trucks are slow, cars are varied, occasional fast cars appear.
   * 2. Danger-window guard: if 3+ lanes are already occupied near the player,
   *    or if the target lane is already occupied in that window, skip the spawn.
   *    This guarantees a fair escape route is always available.
   */
  _spawnTraffic() {
    const isOncoming = Math.random() < 0.50;
    const lanePool   = isOncoming ? [0, 1] : [2, 3];
    const lane       = Phaser.Utils.Array.GetRandom(lanePool);
    const isTruck    = Math.random() < 0.28;

    // ── Independent NPC speed ─────────────────────────────────────────────
    // Each vehicle gets its own world speed in px/s, independent of the player.
    // Trucks: 60–110  |  Normal cars: 90–200  |  Fast cars (15% chance): 200–320
    let npcSpeed;
    if (isTruck) {
      npcSpeed = Phaser.Math.Between(60, 110);
    } else if (Math.random() < 0.15) {
      npcSpeed = Phaser.Math.Between(200, 320); // fast car
    } else {
      npcSpeed = Phaser.Math.Between(90, 200);  // normal car
    }

    const COLORS = [0xe74c3c, 0x2ecc71, 0xf39c12, 0x9b59b6, 0xdddddd,
                    0x1abc9c, 0xe67e22, 0x3498db, 0xfd79a8];
    const color  = Phaser.Utils.Array.GetRandom(COLORS);
    const halfH  = isTruck ? 55 : 45;

    // ── Per-lane minimum spacing guard ────────────────────────────────────
    const MIN_SPACING = isTruck ? 160 : 130;
    for (const tr of this._traffic) {
      if (tr.lane === lane) {
        const dist = Math.abs(tr.container.y - (-halfH));
        if (dist < MIN_SPACING) return;
      }
    }

    // ── Danger-window guard ───────────────────────────────────────────────
    // Prevent spawning when 3+ lanes are already dangerous, or when the
    // chosen lane is already occupied near the player — ensures a fair escape.
    const danger = this._countDangerLanes();
    if (danger.size >= 3)      return; // all lanes nearly blocked — skip
    if (danger.has(lane))      return; // chosen lane already dangerous — skip

    // ── Spawn ─────────────────────────────────────────────────────────────
    const spawnY = -halfH;
    const gfx    = isTruck ? this._drawTruck(color) : this._drawCar(color);

    const shadow = this.add.ellipse(
      this.laneCentres[lane], spawnY + (isTruck ? 40 : 30),
      isTruck ? 34 : 28, isTruck ? 12 : 10,
      0x000000, 0.28
    ).setDepth(9);

    const container = this.add.container(
      this.laneCentres[lane], spawnY, [gfx]
    ).setDepth(10);

    if (isOncoming) container.scaleY = -1;

    this._traffic.push({
      container, shadow, lane,
      oncoming: isOncoming,
      isTruck,
      hw:    isTruck ? TRUCK_HW : CAR_HW,
      hh:    isTruck ? TRUCK_HH : CAR_HH,
      speed: npcSpeed,   // ← own independent speed, never changes
    });
  }

  /**
   * Moves traffic using RELATIVE VELOCITY — not player speed directly.
   *
   * CHANGES vs original:
   * - Oncoming vehicles: closing speed = player.speed + npc.speed
   *   They rush toward the player at a combined rate. Braking slows the
   *   approach only from the player's side; the NPC still charges at its
   *   own speed.
   * - Same-direction vehicles: relative speed = player.speed - npc.speed
   *   If player is faster → NPC appears to scroll backward (player overtakes).
   *   If player brakes below NPC speed → NPC drives away from the player.
   *   The NPC never slows down just because the player brakes.
   * - Culling: both directions move downward, so cull when past bottom edge.
   */
  _updateTraffic(dt) {
    for (const tr of this._traffic) {
      let dy;

      if (tr.oncoming) {
        // Closing speed: player rushing forward + NPC rushing toward player.
        // Both contributions are always positive, so the NPC always approaches.
        const closingSpeed = this.speed + tr.speed;
        dy = closingSpeed * dt;
      } else {
        // Relative speed: positive → player overtakes (NPC scrolls down).
        // Negative → player is slower; NPC moves upward (drives away).
        const relativeSpeed = this.speed - tr.speed;
        dy = relativeSpeed * dt;
      }

      tr.container.y += dy;
      tr.shadow.y    += dy;
    }

    // Cull off-screen vehicles (both directions move downward overall)
    this._traffic = this._traffic.filter(tr => {
      const offBottom = tr.container.y >  this.H + 120;
      const offTop    = tr.container.y < -300;  // same-dir drifted off top if player braked hard
      if (offBottom || offTop) {
        tr.container.destroy();
        tr.shadow.destroy();
      }
      return !offBottom && !offTop;
    });
  }

  _drawCar(color) {
    const g = new Phaser.GameObjects.Graphics(this);

    g.fillStyle(color, 1);
    g.fillRoundedRect(-15, -28, 30, 56, 5);

    const dark = Phaser.Display.Color.IntegerToColor(color);
    dark.darken(25);
    g.fillStyle(dark.color, 1);
    g.fillRoundedRect(-11, -18, 22, 26, 4);

    g.fillStyle(0xb4e6ff, 0.75);
    g.fillRoundedRect(-8, -16, 16, 12, 3);

    g.fillStyle(0xb4e6ff, 0.5);
    g.fillRoundedRect(-7, 8, 14, 9, 2);

    g.fillStyle(0xfff5aa, 0.95);
    g.fillRoundedRect(-13, -26, 7, 5, 2);
    g.fillRoundedRect(6,   -26, 7, 5, 2);

    g.fillStyle(0xff3333, 0.9);
    g.fillRoundedRect(-13, 23, 7, 5, 2);
    g.fillRoundedRect(6,   23, 7, 5, 2);

    g.fillStyle(0x111122, 1);
    g.fillRoundedRect(-17, -20, 6, 12, 2);
    g.fillRoundedRect(11,  -20, 6, 12, 2);
    g.fillRoundedRect(-17,  10, 6, 12, 2);
    g.fillRoundedRect(11,   10, 6, 12, 2);

    return g;
  }

  _drawTruck(color) {
    const g = new Phaser.GameObjects.Graphics(this);

    g.fillStyle(color, 1);
    g.fillRoundedRect(-16, -10, 32, 50, 4);

    g.lineStyle(1, 0x000000, 0.12);
    g.strokeRect(-16, 8,  32, 1);
    g.strokeRect(-16, 24, 32, 1);

    const dark = Phaser.Display.Color.IntegerToColor(color);
    dark.darken(22);
    g.fillStyle(dark.color, 1);
    g.fillRoundedRect(-14, -38, 28, 30, 5);

    g.fillStyle(0xb4e6ff, 0.7);
    g.fillRoundedRect(-10, -35, 20, 14, 3);

    g.fillStyle(0xfff5aa, 0.95);
    g.fillRoundedRect(-15, -38, 7, 5, 2);
    g.fillRoundedRect(8,   -38, 7, 5, 2);

    g.fillStyle(0xff3333, 0.9);
    g.fillRoundedRect(-16, 38, 8, 6, 2);
    g.fillRoundedRect(8,   38, 8, 6, 2);

    g.fillStyle(0x888899, 0.9);
    g.fillRect(-19, -28, 4, 16);
    g.fillRect(15,  -28, 4, 16);

    g.fillStyle(0x111122, 1);
    g.fillRoundedRect(-20, -26, 6, 12, 2);
    g.fillRoundedRect(14,  -26, 6, 12, 2);
    g.fillRoundedRect(-20,  12, 6, 12, 2);
    g.fillRoundedRect(14,   12, 6, 12, 2);
    g.fillRoundedRect(-20,  26, 6, 12, 2);
    g.fillRoundedRect(14,   26, 6, 12, 2);

    return g;
  }

  // ═══════════════════════════════════════════
  //  COINS
  // ═══════════════════════════════════════════

  _spawnCoinGroup() {
    const r    = Math.random();
    const lane = Phaser.Utils.Array.GetRandom([2, 3]);
    const type = this._coinType();
    const baseY = -60;

    if (r < 0.28) {
      for (let i = 0; i < 5; i++) this._addCoin(lane, baseY - i * 44, 'gold');
    } else if (r < 0.50) {
      this._addCoin(2, baseY, 'gold');
      this._addCoin(3, baseY, 'gold');
    } else if (r < 0.70) {
      for (let i = 0; i < 4; i++) this._addCoin(i % 2 === 0 ? 2 : 3, baseY - i * 50, 'gold');
    } else if (r < 0.88) {
      const seq = [2, 2, 3, 3, 2];
      seq.forEach((l, i) => this._addCoin(l, baseY - i * 46, 'gold'));
    } else {
      this._addCoin(lane, baseY, type);
    }
  }

  _addCoin(lane, y, type) {
    const CONFIGS = {
      gold: { color: 0xf7c948, rim: 0xe07b10, r: 13 },
      blue: { color: 0x00c3ff, rim: 0x0077cc, r: 12 },
      red:  { color: 0xff4d6d, rim: 0xbb0033, r: 12 },
    };
    const cfg = CONFIGS[type];
    const gfx = new Phaser.GameObjects.Graphics(this);
    this.add.existing(gfx);
    gfx.setDepth(9);
    gfx.setPosition(this.laneCentres[lane], y);

    this._coins.push({
      gfx, lane, type,
      points: type === 'gold' ? 1 : type === 'blue' ? 5 : 20,
      collected: false,
      _angle: Math.random() * 360,
      cfg,
    });

    this._redrawCoin(this._coins[this._coins.length - 1]);
  }

  _redrawCoin(coin) {
    const g   = coin.gfx;
    const cfg = coin.cfg;
    g.clear();

    coin._angle = (coin._angle + 3) % 360;
    const squeeze = Math.abs(Math.cos(Phaser.Math.DegToRad(coin._angle)));
    const rx = Math.max(cfg.r * (0.25 + squeeze * 0.75), 2);
    const ry = cfg.r;

    g.fillStyle(cfg.rim, 1);
    g.fillEllipse(0, 0, rx * 2 + 3, ry * 2 + 3);
    g.fillStyle(cfg.color, 1);
    g.fillEllipse(0, 0, rx * 2, ry * 2);
    if (rx > ry * 0.4) {
      g.fillStyle(0xffffff, 0.35);
      g.fillEllipse(-rx * 0.22, -ry * 0.25, rx * 0.65, ry * 0.5);
    }
  }

  _coinType() {
    const r = Math.random();
    if (r < 0.80) return 'gold';
    if (r < 0.95) return 'blue';
    return 'red';
  }

  // ═══════════════════════════════════════════
  //  COLLISIONS
  // ═══════════════════════════════════════════

  _checkCollisions() {
    const bx = this.bike.x;
    const by = this.bike.y;
    const dt = 1 / 60;

    // Coins scroll down same as road (player-perspective)
    for (const c of this._coins) {
      if (c.collected) continue;
      c.gfx.y += this.speed * dt;
      this._redrawCoin(c);

      const dx = Math.abs(bx - c.gfx.x);
      const dy = Math.abs(by - c.gfx.y);
      if (dx < COIN_R && dy < COIN_R + BIKE_HH * 0.5) {
        c.collected = true;
        this._collectCoin(c);
      }
    }

    // Traffic collision
    for (const tr of this._traffic) {
      const dx = Math.abs(bx - tr.container.x);
      const dy = Math.abs(by - tr.container.y);
      if (dx < BIKE_HW + tr.hw && dy < BIKE_HH + tr.hh) {
        this._crashBike();
        return;
      }
    }

    // Cull coins
    this._coins = this._coins.filter(c => {
      if (c.collected || c.gfx.y > this.H + 40) {
        c.gfx.destroy();
        return false;
      }
      return true;
    });
  }

  _collectCoin(c) {
    this.coins += c.points;
    this.registry.set('coins', this.coins);

    const color = c.type === 'gold' ? '#f7c948' : c.type === 'blue' ? '#00c3ff' : '#ff4d6d';
    const label = c.type === 'gold' ? '+1' : c.type === 'blue' ? '+5' : '+20';

    const txt = this.add.text(c.gfx.x, c.gfx.y, label, {
      fontSize: '18px', fontFamily: 'system-ui, sans-serif',
      fontStyle: 'bold', color, stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20);

    this.tweens.add({
      targets: txt, y: c.gfx.y - 65, alpha: 0, scaleX: 1.3, scaleY: 1.3,
      duration: 700, ease: 'Cubic.easeOut',
      onComplete: () => txt.destroy(),
    });

    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const dot   = this.add.circle(c.gfx.x, c.gfx.y, 4, c.cfg.color).setDepth(19);
      this.tweens.add({
        targets: dot,
        x: c.gfx.x + Math.cos(angle) * 26,
        y: c.gfx.y + Math.sin(angle) * 26,
        alpha: 0, scaleX: 0, scaleY: 0,
        duration: 420, ease: 'Cubic.easeOut',
        onComplete: () => dot.destroy(),
      });
    }
  }

  // ═══════════════════════════════════════════
  //  INPUT
  // ═══════════════════════════════════════════

  _handleInput(dt) {
    const up    = this.keys.up.isDown    || this.keys.w.isDown;
    const down  = this.keys.down.isDown  || this.keys.s.isDown;
    const left  = this.keys.left.isDown  || this.keys.a.isDown;
    const right = this.keys.right.isDown || this.keys.d.isDown;

    if (up)        this.speed = Math.min(this.speed + ACCEL * dt, MAX_SPEED);
    else if (down) this.speed = Math.max(this.speed - BRAKE * dt, 0);
    else           this.speed = Math.max(this.speed - PASSIVE_DECEL * dt, BASE_SPEED * 0.3);

    const leftPressed  = left  && !this._prevLeft;
    const rightPressed = right && !this._prevRight;

    if (leftPressed  && !this.isChanging) this._changeLane(-1);
    if (rightPressed && !this.isChanging) this._changeLane(+1);

    this._prevLeft  = left;
    this._prevRight = right;

    const glowAlpha = 0.10 + (this.speed / MAX_SPEED) * 0.35;
    this.bikeGlow.setAlpha(glowAlpha);
  }

  _changeLane(dir) {
    const next = this.currentLane + dir;
    if (next < 0 || next >= LANES) return;
    this.fromLane   = this.currentLane;
    this.toLane     = next;
    this.laneT      = 0;
    this.isChanging = true;
  }

  _easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  // ═══════════════════════════════════════════
  //  CRASH
  // ═══════════════════════════════════════════

  _crashBike() {
    if (!this.alive) return;
    this.alive = false;

    this.cameras.main.shake(500, 0.022);
    this.cameras.main.flash(350, 255, 60, 60);

    this.tweens.add({
      targets: this.bike,
      angle: 180, scaleX: 0, scaleY: 0, alpha: 0,
      duration: 550, ease: 'Cubic.easeIn',
    });

    this.time.delayedCall(800, () => {
      this.registry.set('gameOver', true);
    });
  }
}