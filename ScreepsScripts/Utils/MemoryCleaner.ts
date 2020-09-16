export function CleanMemory(): void {
    for(const creepName in Memory.creeps){
        if(!(creepName in Game.creeps)){
            if(!!Memory.creeps[creepName].source){
                const source = Memory.creeps[creepName].source || "";
                if(!!Memory.sources[source]){
                    Memory.sources[source].creeps = Memory.sources[source].creeps
                        .filter(c => c != creepName);
                }
            }
            delete Memory.creeps[creepName];
        }
    }
}