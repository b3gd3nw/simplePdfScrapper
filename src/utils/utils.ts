import * as fs from 'fs';
import axios from 'axios';
import * as path from 'path';
import { logger } from './logger';
import { handleError } from './errorHandler';
import { Catalog } from '../types/types';

export async function downloadPDF(pdfUrl: string, savePath: string, resultPath: string): Promise<void> {
    const resultFilePath = path.join(resultPath, savePath);
    const writer = fs.createWriteStream(resultFilePath);
    try {
        const response = await axios({
            url: pdfUrl,
            method: 'GET',
            responseType: 'stream',
        });

        response.data.pipe(writer);

        logger.info(`PDF ${pdfUrl} downloaded and saved to ${resultFilePath}`);
    } catch (error) {
        handleError(error, `Error downloading PDF ${pdfUrl}`);
    }
}

export async function createDirIfNotExists(dirPath: string): Promise<void> {
    try {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        logger.info(`Results will be saved in folder: ${dirPath}`);
        logger.info('-------------------------------------------------------');
    } catch (error) {
        handleError(error, `Error creating directory at ${dirPath}`);
    }
}

export async function saveJsonResults(filePath: string, catalogs: Catalog[]): Promise<void> {
    try {
        logger.info('-------------------------------------------------------');
        logger.info(`Saving JSON results`);

        fs.writeFileSync(filePath, JSON.stringify(catalogs, null, 2));

        logger.info(`JSON results saved`);
    } catch (error) {
        handleError(error, `Error saving JSON results to ${filePath}`);
    }
}
