import * as PIXI from 'pixi.js';
import Render from "../../global/Render";

export default class HashPattern extends PIXI.Graphics {

    constructor()  {
        super();
        this.alpha = .35;
    }

    /**
     * @param minx {number}
     * @param miny {number}
     * @param maxx {number}
     * @param maxy {number}
     */
    draw(minx, miny, maxx, maxy ) {
        let x, y, dif, step=15;

        this.clear();
        this.lineStyle(1, 0, 1, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);

        dif = Math.ceil(Math.max(maxx-minx, maxy-miny) / step) * step;

        for (x=minx, y=miny; x<=maxx || y<=maxy; x+=step, y+=step) {
            this.moveTo(x, miny);
            this.lineTo(minx, y);
            this.moveTo(x, miny+dif);
            this.lineTo(minx+dif, y);
        }
    }
}