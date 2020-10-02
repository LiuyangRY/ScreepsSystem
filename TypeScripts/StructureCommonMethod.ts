// 查找血量最低的入侵者
export function FindBrokenHostile(tower: StructureTower, hostiles: Creep[] | undefined): Creep | undefined{
    let hostile: Creep | null;
    if(!!hostiles){
        // 找出血量最低的入侵者
        for(let hits = 100; hits <= 99999; hits = hits + 100){
            hostile = tower.pos.findClosestByPath(hostiles, {
                filter: (creep: Creep) => (creep.hits <= hits)
            });
            if(!!hostile){
                return hostile;
            }
        }
    }else {
        return undefined;
    }
}