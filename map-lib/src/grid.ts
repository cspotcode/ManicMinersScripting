// A 2D grid of values
export class Grid<T = number> {
    constructor(defaultValue: T) {
        this.defaultValue = defaultValue;
    }
    /** Used when resizing to fill new grid squares */
    defaultValue: T;
    grid: Array<Array<T>> = [];
    get width(): number {
        return this._width;
    }
    get height(): number {
        return this._height;
    }
    private _height: number = 0;
    private _width: number = 0;
    resize(width: number, height: number) {
        // resize rows that are not new
        if(width < this._width) {
            // decrease width
            for(let y = 0, till = Math.min(height, this._height); y < till; y++) {
                this.grid[y].length = width;
            }
        } else {
            // increase width
            const addCols = width - this._width;
            for(let y = 0, till = Math.min(height, this._height); y < till; y++) {
                const row = this.grid[y];
                for(let i = addCols; i > 0; i--) {
                    row.push(this.defaultValue);
                }
            }
        }
        // increase height
        for(let h = this._height; h < height; h++) {
            this.grid.push(createArray(width, this.defaultValue));
        }
        // decrease height
        if(height < this._height) {
            this.grid.length = height;
        }
        // save new width and height
        this._width = width;
        this._height = height;
    }
    clear() {
        for(let y = 0; y < this._height; y++) {
            for(let x = 0; x < this._width; x++) {
                this.grid[y][x] = this.defaultValue;
            }
        }
    }
    set(x: number, y: number, value: T) {
        this.grid[y][x] = value;
    }
    get(x: number, y: number): T {
        return this.grid[y][x];
    }
}

function createArray<T>(length: number, value: T): Array<T> {
    return (new Array(length)).map(v => value);
}
