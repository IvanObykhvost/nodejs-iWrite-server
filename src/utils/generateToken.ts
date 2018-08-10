export class Generate{
    constructor(){
        this.rand;
    }

    private rand(): string {
        return Math.random().toString(36).substr(2); // remove `0.`
    }

    public getToken(): string {
        return this.rand() + this.rand();
    }
}