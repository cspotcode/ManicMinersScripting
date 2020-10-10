export class Transform {
    x: number = 0;
    y: number = 0;
    z: number = 0;
    pitch: number = 0;
    yaw: number = 0;
    roll: number = 0;
    xScale: number = 1;
    yScale: number = 1;
    zScale: number = 1;
    fromTransform(other: Transform) {
        this.x = other.x;
        this.y = other.y;
        this.z = other.z;
        this.pitch = other.pitch;
        this.yaw = other.yaw;
        this.roll = other.roll;
        this.xScale = other.xScale;
        this.yScale = other.yScale;
        this.zScale = other.zScale;
    }
    parse(content: string) {
        const [, sx, sy, sz, spitch, syaw, sroll, sxscale, syscale, szscale] = content.match(/^Translation: X=(-?\d+\.\d+) Y=(-?\d+\.\d+) Z=(-?\d+\.\d+) Rotation: P=(-?\d+\.\d+) Y=(-?\d+\.\d+) R=(-?\d+\.\d+) Scale X=(-?\d+\.\d+) Y=(-?\d+\.\d+) Z=(-?\d+\.\d+)$/)!;
        this.x = parseFloat(sx);
        this.y = parseFloat(sy);
        this.z = parseFloat(sz);
        this.pitch = parseFloat(spitch);
        this.yaw = parseFloat(syaw);
        this.roll = parseFloat(sroll);
        this.xScale = parseFloat(sxscale);
        this.yScale = parseFloat(syscale);
        this.zScale = parseFloat(szscale);
    }
    serialize() {
        return `Translation: X=${formatNumber(this.x, 3)} Y=${formatNumber(this.y, 3)} Z=${formatNumber(this.z, 3)
        } Rotation: P=${formatNumber(this.pitch, 6)} Y=${formatNumber(this.yaw, 6)} R=${formatNumber(this.roll, 6)
        } Scale X=${formatNumber(this.xScale, 3)} Y=${formatNumber(this.yScale, 3)} Z=${formatNumber(this.zScale, 3)}`
    }
}

export function formatNumber(number: number, digitsAfterDecimalPoint: number) {
    let a = number.toString();
    if(!a.includes('.')) a += '.';
    a += '000000';
    a = a.slice(0, a.indexOf('.') + 1 + digitsAfterDecimalPoint);
    return a;
}
