import axios from 'axios';
import * as path from 'path';
import { error } from 'console';
import * as dotenv from 'dotenv';
import * as cheerio from 'cheerio';
import { Catalog } from './types/types';
import { logger, handleError, downloadPDF, createDirIfNotExists, saveJsonResults } from './utils';

dotenv.config();

async function parseCatalogs(): Promise<void> {

    const url = decodeURIComponent(process.env.TARGET_URL!);

    logger.info(`Target URL: ${url}`);

    const $ = await fetchHTML(url);
    const catalogs: Catalog[] = [];

    logger.info('Finding catalogs...');

    const data = $('#s2 > div > ul.custom-slick-slider li');

    if (data.length !== 0) {
        logger.info('Catalogs find (' + data.length + '). Start parsing...');
        logger.info('-------------------------------------------------------');

        data.each((index, element) => {

            const title: string = $(element).find('h3').text().trim();

            logger.info(`Scraping catalog ${index + 1}, ${title}`);

            const pdfLink: string = $(element)
                .find("div > div.hover > figure > figcaption > a.link-icon.solid.pdf")
                .attr("href") || '';
            const dateRange: string = `${$(element).find("div > p > time:nth-child(1)")
                .attr("datetime")}-${$(element)
                    .find("div > p > time:nth-child(2)")
                    .attr("datetime")}`;

            catalogs.push({ title, pdfLink, dateRange });
        });
        logger.info(`Catalogs parsed (${catalogs.length}).`);
    } else {
        logger.info('Catalogs not found.');
        return;
    }

    const resultPath = path.join(__dirname, '../results');;

    await createDirIfNotExists(resultPath);

    for (const catalog of catalogs) {
        logger.info(`Loading: ${catalog.title}`);
        await downloadPDF(catalog.pdfLink, path.join(`${catalog.title.replace(/\s+/g, '_')}.pdf`), resultPath);
    }

    await saveJsonResults(`${resultPath}/catalogs.json`, catalogs);
}

async function fetchHTML(url: string): Promise<cheerio.CheerioAPI> {
    try {
        const response = await axios.get(url);

        logger.info(`HTML on ${url} fetched. Status code: ${response.status}`);

        return cheerio.load(response.data);
    } catch (error) {
        handleError(error, `Failed to fetch HTML on this url: ${url}`);
    }
    throw error;
}

parseCatalogs().catch(console.error);
