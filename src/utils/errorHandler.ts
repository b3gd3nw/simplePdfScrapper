import { logger } from './logger';
import { ParserError } from '../errors/errors';

export function handleError(error: any, message: string): void {
    let parserError: ParserError;

    if (error instanceof ParserError) {
        parserError = error;
    } else {
        parserError = new ParserError(message, 500, error instanceof Error ? error.message : String(error));
    }

    logger.error(parserError.message, {
        statusCode: parserError.statusCode,
    });

    throw parserError;
}
