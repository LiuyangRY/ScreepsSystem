// Creep 属性
// 强化逻辑
Object.defineProperty(Creep.prototype, "boosts", {
    get() {
        if(!this.boosts) {
            this._boosts = _.compact(_.unique(_.map(this.body as BodyPartDefinition[], 
                bodyPart => bodyPart.boost))) as _ResourceConstantSansEnergy[];
        }
        return this._boosts;
    }
});

Object.defineProperty(Creep.prototype, "boostCounts", {
    get() {
        if(!this._boostCounts) {
            this._boostCounts = _.countBy(this.body as BodyPartDefinition[], bodyPart => bodyPart.boost);
        }
    },
    configurable: true
});

Object.defineProperty(Creep.prototype, "inRampart", {
    get() {
        return !!this.pos.lookForStructture(STRUCTURE_RAMPART);     // 假设敌人不能站在我的城墙上
    },
    configurable: true
});