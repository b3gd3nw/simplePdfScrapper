
export class ParserError extends Error {
    statusCode?: number;
    details?: string;

    constructor(message: string, statusCode?: number, details?: string) {
        super(message);
        this.name = 'ParserError';
        this.statusCode = statusCode;
        this.details = details;
    }
}