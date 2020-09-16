export function PixelGenerator(): void{
    if(Game.cpu.bucket >= 9999){
        Game.cpu.generatePixel();
    }
}