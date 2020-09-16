export function AssignToSouce(creep: Creep, source: Source): boolean {
    Memory.sources = Memory.sources || {};
    if(!Memory.sources[source.id]){
        const newSourceMemory = Memory.sources[source.id] || { spots: 0, creeps: {} };
        newSourceMemory.spots = CalculateAvailableSpots(source);
        newSourceMemory.creeps = [];
        Memory.sources[source.id] = newSourceMemory as SourceMemory;
    }
    const sourceMemory = Memory.sources[source.id];
    if(sourceMemory.creeps.length < sourceMemory.spots) {
        sourceMemory.creeps.push(creep.name);
        creep.memory.source = source.id;
        return true;
    }
    return false;
}

// 计算可用的点
function CalculateAvailableSpots(source: Source): number {
    let availableSpots = 0;
    for(let x = source.pos.x - 1; x <= source.pos.x + 1; x++){
        for(let y = source.pos.y - 1; y <= source.pos.y + 1; y++){
            const lookAt = source.room.lookAt(x, y);
            if(IsWalkable(lookAt)){
                availableSpots++;
                source.room.visual.circle(x, y, { radius: 0.5, stroke: "#00aa00", fill: "#005500"});
            }
        }
    }
    return availableSpots;
}

// 是否可以通行
function IsWalkable(objects: LookAtResult[]): boolean {
    return objects.filter(o => {
        o.type === LOOK_TERRAIN && IsNonWalkableTerrain(o) ||
        o.type === LOOK_STRUCTURES && IsWalkableStructure(o) ||
        o.type === LOOK_SOURCES
    }).length === 0;
}

// 是否是可以通过的地形
function IsNonWalkableTerrain(terrain: LookAtResult): boolean {
    return terrain.terrain === "wall";
}

// 是否是可以通过的建筑
function IsWalkableStructure(structure: LookAtResult): boolean {
    return structure.structure?.structureType === STRUCTURE_CONTAINER
        || structure.structure?.structureType === STRUCTURE_ROAD
        || structure.structure?.structureType === STRUCTURE_RAMPART;
}