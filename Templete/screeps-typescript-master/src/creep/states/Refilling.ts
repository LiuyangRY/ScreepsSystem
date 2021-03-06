import {MovingState, ReplayFunction, resolveAndReplay, StateResolver} from "./CreepState";

export function refill(creep: Creep, state: StateResolver): void {
  if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
    resolveAndReplay(creep, state);
    return;
  }

  let storage;

  if (creep.memory.container &&
    Game.getObjectById(creep.memory.container)?.store.getUsedCapacity(RESOURCE_ENERGY)) {
    storage = Game.getObjectById(creep.memory.container);
  } else {
    storage = creep.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: s =>
        (s.structureType === STRUCTURE_STORAGE && s.my && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0) ||
        (s.structureType === STRUCTURE_LINK && s.my && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0) ||
        (s.structureType === STRUCTURE_CONTAINER && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
    });
  }

  if (storage) {
    const result = creep.withdraw(storage, RESOURCE_ENERGY)
    switch (result) {
      case OK:
        break;
      case ERR_NOT_IN_RANGE:
        goToStorage(creep, storage, state.replay);
        break;
      default:
        console.log(`Refilling: withdraw result ${result}`);
    }
  }
}

function goToStorage(creep: Creep, assignedStorage: Structure, replay: ReplayFunction | undefined) {
  setTargetStorage(creep, assignedStorage);
  creep.say("🥾");
  resolveAndReplay(creep, {nextState: MovingState, replay});
}

function setTargetStorage(creep: Creep, storage: Structure): void {
  creep.memory.storage = storage.id;
  creep.memory.targetPos = {
    x: storage.pos.x,
    y: storage.pos.y,
    room: storage.pos.roomName,
  };
}
