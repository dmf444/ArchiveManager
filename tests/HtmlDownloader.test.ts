import {HtmlDownloader} from "@main/downloader/downloaders/HtmlDownloader";
const FileUtils = require("@main/downloader/FileUtils");


jest.mock('@main/downloader/FileUtils', () => {
        return {
            FileUtils: {
                getFilePath: (bool) => {return "HHNAWDBASIDKBNA"}
            }
        }
    }
);




describe('URL acceptance tests', () => {
    let downloader = new HtmlDownloader();

    test('Proper HTML url', () => {
        expect(downloader.acceptsUrl('https://www.utsc.utoronto.ca/~bretscher/b20/index.html')).toBeTruthy();
    });
    test('Webpage without HTML', () => {
        expect(downloader.acceptsUrl('https://jestjs.io/docs/setup-teardown')).toBeFalsy();
    });
    test('Non-webpage, with html at end', () => {
        expect(downloader.acceptsUrl('TangoTek_is_the_best_youtuber_around.html')).toBeFalsy();
    });
});

describe('Download Content Tests', () => {
   let downloader = new HtmlDownloader();

   beforeAll(() => {

   });

   test('Download from HTML', () => {
       expect(downloader.downloadUrl('https://www.utsc.utoronto.ca/~bretscher/b20/index.html', false)).toContainEqual({});
   });

    test('Download from random webpage (served http content)', () => {
        expect(downloader.downloadUrl('https://jestjs.io/docs/setup-teardown', false)).toContainEqual({});
    });

    test('No valid data', () => {
        expect(downloader.downloadUrl('ImpulseSV_is_the_best_youtuber_around.html', false)).toContainEqual({});
    });

    afterAll(() => {

    });

});
