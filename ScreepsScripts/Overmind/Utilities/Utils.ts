import { alignedNewLine, bullet } from "./StringConstants";

// 获取所有殖民的房间
export function GetAllColonyRooms(): Room[] {
    return _.filter(_.values(Game.rooms), room => room.my);
}

// 打印房间名称
export function PrintRoomName(roomName: string): string {
    return `<a href="#!/room/${Game.shard.name}/roomName">${roomName}</a>`;
}

// 返回指定颜色信息
export function Color(str: string, color: string): string {
    return `<font color="${color}">${str}</font>`;
}

// 正确的负数模运算
export function Mod(n: number, m: number): number {
    return ((n % m) + m) % m;
}

// 如果 value 在 最大值和最小值之间，返回 value，否则返回最大值或最小值
export function MinMax(value: number, min: number, max: number): number {
    return Math.max(Math.min(value, max), min);
}

// 是否有矿物
export function HasMinerals(store: { [resourceType: string]: number}): boolean {
    for(const resourceType in store) {
        if(resourceType != RESOURCE_ENERGY && (store[<ResourceConstant>resourceType] || 0) > 0) {
            return true;
        }
    }
    return false;
}

// 包含玩家的用户名
export function GetUsernamr(): string {
    for(const roomName in Game.rooms) {
        const room = Game.rooms[roomName];
        if(room.controller && room.controller.my) {
            return room.controller.owner.username;
        }
    }
    for(const creepName in Game.creeps) {
        const creep = Game.creeps[creepName];
        if(creep.owner) {
            return creep.owner.username;
        }
    }
    console.log("错误：无法确定用户名，你可以在 src/settings/settings_user 中进行设置。");
    return "错误： 无法确定用户名";
}

// 是否为刚开始孵化
export function HasJustSpwned(): boolean {
    return _.keys(Overmind.colonies).length == 1 && _.keys(Game.creeps).length == 0 && _.keys(Game.spawns).length == 1;
}

// 是否在公有服务器
export function OnPublicServer(): boolean {
    return Game.shard.name.includes("shard");
}

// 是否为测试环境
export function OnTrainingEnvironment(): boolean {
    return !!Memory.reinforcementLearning && !!Memory.reinforcementLearning.enabled;
}

// 强化学习
export function GetReinforcementLearningTrainingVerbosity(): number {
    if(Memory.reinforcementLearning) {
        if(Memory.reinforcementLearning.verbosity != undefined) {
            return Memory.reinforcementLearning.verbosity;
        }
    }
}

// 转换为列配置
interface ToColumnOpts {
    PadChar: string;
    Justify: boolean;
}

// 项目符号
export function bulleted(text: string[], aligned = true, startWithNewLine = true): string {
    if(text.length == 0) {
        return "";
    }
    const prefix = (startWithNewLine ? (aligned ? alignedNewLine : "\n") : "") + bullet;
    if(aligned) {
        return prefix + text.join(alignedNewLine + bullet);
    }else {
        return prefix + text.join("\n" + bullet);
    }
}
// 从对象的字符串键值对创建列队其的文本数组
export function ToColumns(obj: { [key: string]: string}, opts = {} as ToColumnOpts): string[] {
    _.defaults(opts, {
        PadChar: " ",
        Justify: false
    });

    const result = [];
    const keyPadding = _.max(_.map(_.keys(obj), str => str.length)) + 1;
    const valPadding = _.max(_.mapValues(obj, str => str.length));

    for(const key in obj) {
        if(opts.Justify) {
            result.push(key.PadRight(keyPadding, opts.PadChar) + obj[key].PadLeft(valPadding, opts.PadChar));
        }else {
            result.push(key.PadRight(keyPadding, opts.PadChar) + obj[key]);
        }
    }

    return result;
}

// 合并一些存储的对象，将重叠的键相加。在计算能量资源的时候很有用。
export function MergeSum(objects: { [key: string]: number | undefined }[]): { [key: string]: number} {
    const result : { [key: string]: number } = null;
    for(const object of objects) {
        for(const key in object) {
            const amount = object[key] || 0;
            if(!result[key]){
                result[key] = 0;
            }
            result[key] += amount;
        }
    }
    return result;
}

// 坐标名称
export function CoordName(coord: Coord): string {
    return coord.x + ":" + coord.y;
}

const CHARCODE_A = 65;

// 返回由两个字符组成的坐标编码
export function CompactCoordName(coord: Coord): string {
    return String.fromCharCode(CHARCODE_A + coord.x, CHARCODE_A + coord.y);
}

export function DerefCoords(coordName: string, roomName: string): RoomPosition {
    const [x, y] = coordName.split(":");
    return new RoomPosition(parseInt(x, 10), parseInt(y, 10), roomName);
}

// 根据字符串获取坐标
export function GetPosFromString(str: string | undefined | null): RoomPosition | undefined {
    if(!str) return;
    const posName = _.first(str.match(/(E|W)\d+(N|S)\d+:\d+:\d+/g) || []);
    if(posName) {
        const [roomName, x, y] = posName.split(":");
        return new RoomPosition(parseInt(x, 10), parseInt(y, 10), roomName);
    }
}

// 位置是否相同
export function EqualXYR(pos1: ProtoPos, pos2: ProtoPos): boolean {
    return pos1.x == pos2.x && pos1.y == pos2.y && pos1.roomName == pos2.roomName;
}

// 通过映射对象迭代器平均一个对象列表
export function AverageBy<T>(objects: T[], iteratee: ((obj: T) => number)): number | undefined {
    if(objects.length == 0) {
        return undefined;
    }else {
        return _.sum(objects, obj => iteratee(obj)) / objects.length;
    }
}

// 与 lodash.minBy 方法相同
export function MinBy<T>(objects: T[], iteratee: ((obj: T) => number | false)): T | undefined {
    let minObj: T | undefined;
    let minVal = Infinity;
    let val: number | false;
    for(const i in objects) {
        val = iteratee(objects[i]);
        if(val !== false && val < minVal) {
            minVal = val;
            minObj = objects[i];
        }
    }
    return minObj;
}

// 与 lodash.maxBy 方法相同
export function MaxBy<T>(objects: T[], iteratee: ((obj: T) => number | false)): T | undefined {
    let maxObj: T | undefined;
    let maxVal = -Infinity;
    let val: number | false;
    for(const i in objects) {
        val = iteratee(objects[i]);
        if(val !== false && val > maxVal) {
            maxVal = val;
            maxObj = objects[i];
        }
    }
    return maxObj;
}

// 堆状态日志
export function LogHeapStats(): void {
    if(typeof Game.cpu.getHeapStatistics === "function") {
        const heapStats = Game.cpu.getHeapStatistics();
        const heapPercent = Math.round(100 * (heapStats.total_heap_size + heapStats.externally_allocated_size) / heapStats.heap_size_limit);
        const heapSize = Math.round((heapStats.total_heap_size) / 1048576);
        const externalHeapSize = Math.round((heapStats.externally_allocated_size) / 1048576);
        const heapLimit = Math.round(heapStats.heap_size_limit / 1048576);
        console.log(`Heap usage: ${heapSize} MB + ${externalHeapSize} MB of ${heapLimit} MB (${heapPercent} %。)`)
    }
}

// IVM 是否可用
export function IsIVM(): boolean {
    return typeof Game.cpu.getHeapStatistics === "function";
}

// 生成随机缓存过期时间
export function GetCacheExpiration(timeout: number, offset: number = 5): number {
    return Game.time + timeout + Math.round((Math.random() * offset * 2) - offset);
}

// 生成一个固定长度的16进制字符串
const hexChars = '0123456789abcdef';
export function RandomHex(lenth: number): string {
    let result = "";
    for(let i = 0; i < length; i++) {
        result += hexChars[Math.floor(Math.random() * hexChars.length)];
    }
    return result;
}

// 计算移动平均指数
export function ExponentialMovingAverage(current: number, avg: number | undefined, window: number): number {
    return (current + (avg || 0) * (window - 1)) / window;
}

// 计算不均匀间隔样品的平均移动指数
export function IrregularExponentialMovingAverage(current: number, avg: number, dt: number, window: number): number {
    return (current * dt + avg * (window - dt)) / window;
}

// 创建一个二维数组的浅拷贝
export function Clone2DArray<T>(a: T[][]): T[][] {
    return _.map(a, e => e.slice());
}

// 将一个正方形矩形顺时针旋转90度
function RotatedMatrix<T>(matrix: T[][]): void {
    // 反转行
    matrix.reverse();
    // 交换对称元素
    for(let i = 0; i < matrix.length; i++) {
        for(let j = 0; j < 1; j++) {
            const temp = matrix[i][j];
            matrix[i][j] = matrix[j][i];
            matrix[j][i] = temp;
        }
    }
}

// 返回一个顺时针旋转了指定次数90度二维数组
export function RotateMatrix<T>(matrix: T[][], clockwiseTurns: 0 | 1 | 2 | 3): T[][] {
    const mat = Clone2DArray(matrix);
    for(let i = 0; i < clockwiseTurns; i++) {
        RotatedMatrix(mat);
    }
    return mat;
}