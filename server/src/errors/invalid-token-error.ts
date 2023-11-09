export class InvalidTokenError extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
        this.message = message;

        Object.setPrototypeOf(this, InvalidTokenError.prototype);
    }
}