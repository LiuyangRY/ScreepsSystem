// 远距离移动
function ApplyDistanceTransform(foregroundPixels: CostMatrix, oob = 255): CostMatrix {
    const dist = foregroundPixels;

    let UL, U, UR: number;
    let L, mid, R: number;
    let BL, B, BR: number;

    let x, y, value: number;

    for(y = 0; y < 50; ++y) {
        for(x = 0; x < 50; ++x) {
            if(foregroundPixels.get(x, y) !== 0) {
                UL = dist.get(x - 1, y - 1);
                U = dist.get(x, y - 1);
                UR = dist.get(x + 1, y - 1);
                L = dist.get(x - 1, y);
                if(y == 0) {
                    UL = oob;
                    U = oob;
                    UR = oob;
                }
                if (x == 0) {
                    UL = oob;
                    L = oob;
                }
                if(x == 49) {
                    UR = oob;
                }
                dist.set(x, y, Math.min(UL, U, UR, L, 254) + 1);
            }
        }
    }
    for(y = 49; y >= 0; --y) {
        for(x = 49; x >= 0; --x) {
            mid = dist.get(x, y);
            R = dist.get(x + 1, y);
            BL = dist.get(x - 1, y + 1);
            B = dist.get(x, y + 1);
            BR = dist.get(x + 1, y + 1);
            if(y == 49) {
                BL = oob;
                B = oob;
                BR = oob;
            }
            if(x == 49) {
                R = oob;
                BR = oob;
            }
            if(x == 0) {
                BL = oob;
            }
            value = Math.min(mid, R + 1, BL + 1, B + 1, BR + 1);
            dist.set(x, y, value);
        }
    }
    return dist;
}

// 计算移动到房间内可到达的位置的成本
function WalkablePixelsForRoom(roomName: string): CostMatrix {
    const constMatrix = new PathFinder.CostMatrix();
    const terrain = Game.map.getRoomTerrain(roomName);
    for(let y = 0; y < 50; ++y) {
        for(let x = 0; x < 50; ++x) {
            if(terrain.get(x, y) != TERRAIN_MASK_WALL) {
                constMatrix.set(x, y, 1);
            }
        }
    }
    return constMatrix;
}

// 墙壁或临近出口
function WallOrAdjacentToExit(x: number, y: number, roomName: string): boolean {
    const terrain = Game.map.getRoomTerrain(roomName);

    if(1 < x && x < 48 && 1 < y && y < 48) {
        return terrain.get(x, y) == TERRAIN_MASK_WALL;
    }
    if(0 == x || 0 == y || 49 == x || 49 == y) {
        return true;
    }
    if(terrain.get(x, y) == TERRAIN_MASK_WALL) {
        return true;
    }

    // 如果已经到达了出口
    let A, B, C;
    if( x == 1) {
        A = terrain.get(0, y - 1);
        B = terrain.get(0, y);
        C = terrain.get(0, y + 1);
    } else if (x == 48) {
        A = terrain.get(49, y - 1);
        B = terrain.get(49, y);
        C = terrain.get(49, y + 1);
    }
    if(y == 1) {
        A = terrain.get(x - 1, 0);
        B = terrain.get(x, 0);
        C = terrain.get(x + 1, 0);
    } else if(y == 48) {
        A = terrain.get(x - 1, 49);
        B = terrain.get(x, 49);
        C = terrain.get(x + 1, 49);
    }
    return !(A == TERRAIN_MASK_WALL && B == TERRAIN_MASK_WALL && C == TERRAIN_MASK_WALL);
}

// 计算房间中无法通过的建筑的位置
function BlockablePixelsForRoom(roomName: string): CostMatrix {
    const costMatrix = new PathFinder.CostMatrix();
    for(let y = 0; y < 50; ++y) {
        for(let x = 0; x < 50; ++x) {
            if(!WallOrAdjacentToExit(x, y, roomName)) {
                costMatrix.set(x, y, 1);
            }
        }
    }
    return costMatrix;
}

// 显示全局成本矩阵
function DisplayCostMatrix(costMatrix: CostMatrix, color = "#ff0000"): void {
    const vis = new RoomVisual();

    let max = 1;
    for(let y = 0; y < 50; ++y) {
        for(let x = 0; x < 50; ++x) {
            max = Math.max(max, costMatrix.get(x, y));
        }
    }
    for(let y = 0; y < 50; ++y) {
        for(let x = 0; x < 50; ++x) {
            const value = costMatrix.get(x, y);
            if(value > 0) {
                vis.circle(x, y, { radius: costMatrix.get(x, y) / max / 2, fill: color });
            }
        }
    }
}

// 测试远距离移动
export function TestDistanceTransform(roomName = "sim") {
    const dt = ApplyDistanceTransform(WalkablePixelsForRoom(roomName));
    DisplayCostMatrix(dt);
}

// 远距离移动
export function DistanceTransform(roomName: string): CostMatrix {
    return ApplyDistanceTransform(WalkablePixelsForRoom(roomName));
}