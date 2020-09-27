String.prototype.PadRight = function(length: number, char = ' '): string {
    return this + char.repeat(Math.max(length - this.length, 0));
};

String.prototype.PadLeft = function(length: number, char = ' '): string {
    return char.repeat(Math.max(length - this.length, 0)) + this;
};

Number.prototype.ToPercent = function(decimals: number = 0): string {
    return (this * 100).toFixed(decimals) + "%";
};

Number.prototype.Truncate = function(decimals: number): number {
    const rex = new RegExp("(\\d+\\.\\d{" + decimals + "})(\\d)"),
        m = this.toString().match(rex);
    return m ? parseFloat(m[1]) : this.valueOf();
};

Object.defineProperty(ConstructionSite.prototype, "IsWalkable", {
    get() {
        return this.structrueType == STRUCTURE_ROAD ||
            this.structrueType == STRUCTURE_CONTAINER ||
            this.structrueType == STRUCTURE_RAMPART;
    },
    configurable: true
});