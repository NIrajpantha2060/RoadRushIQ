import Phaser from 'phaser';

export function extendGraphics() {
    const proto = Phaser.GameObjects.Graphics.prototype;

    if (proto.fillTrapezoid) return;

    proto.fillTrapezoid = function (x1, y1, x2, y2, x3, y3, x4, y4) {
        this.fillPoints([
            { x: x1, y: y1 },
            { x: x2, y: y2 },
            { x: x3, y: y3 },
            { x: x4, y: y4 },
        ], true);
    };
}