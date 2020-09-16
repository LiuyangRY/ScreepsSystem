function Cpu(): Record<string, any> {
    // Cpu 状态
    const cpuStats = {
        used: Game.cpu.getUsed(),   // Cpu 使用量
        mainComponents: Memory.mainComponentsTime,
        bucket: Game.cpu.bucket,
        heap: undefined as unknown as HeapStatistics
    };
    if(typeof Game.cpu.getHeapStatistics === "function"){
        cpuStats.heap = Game.cpu.getHeapStatistics();
    }
    return cpuStats;
}

interface HarvestEvent {
    targetId: string,
    amount: number
}

interface UpgradeEvent {
    energyCost: number,
    amount: number
}

function Rcl(): Record<string, any> {
    const rooms = {} as { [roomName: string]: Record<string, any> };

    function CalcEnergyHarvested(room: Room): number {
        return room.getEventLog()
            .filter(e => EVENT_HARVEST == e.event)
            .map(e => e.data as HarvestEvent)
            .map(e => e.amount)
            .reduce((sum, amount) => sum + amount, 0)
    }

    function CalcUpgrade(room: Room): UpgradeEvent {
        return room.getEventLog()
            .filter(e => EVENT_UPGRADE_CONTROLLER === e.event)
            .map(e => e.data as UpgradeEvent)
            .reduce((aggregate, event) => {
                return {
                    amount: aggregate.amount + event.amount,
                    energyCost: aggregate.energyCost + event.energyCost
                }
            }, { amount: 0, energyCost: 0 } as UpgradeEvent);
    }

    for(const roomName in Game.rooms){
        const room = Game.rooms[roomName];
        rooms[roomName] = {
            name: roomName,
            progress: room.controller ? room.controller.progress : 0,
            prograssTotal: room.controller ? room.controller.progressTotal : 0,
            upgraded: CalcUpgrade(room),
            energy: room.energyAvailable,
            energyCapacity: room.energyCapacityAvailable,
            energyHarvested: CalcEnergyHarvested(room)
        };
    }
    return rooms;
}