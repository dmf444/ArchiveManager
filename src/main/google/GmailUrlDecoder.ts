/**
 * Originally written in Javascript by Dan Rouse, 2018.
 * Posted to gist here: https://gist.github.com/danrouse/52212f0de2fbfe33cfc56583f20ccb74
 *
 * Converted to Typescript for the purpose of this project.
 */
import log from "electron-log";
var converter = require('hex2dec');

export class GmailUrlDecoder {

    private fullAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    private restrictedAlphabet = 'BCDFGHJKLMNPQRSTVWXZbcdfghjklmnpqrstvwxz';
    private threadPrefix = 'thread-';
    private messagePrefix = 'msg-';

    private isWhitespace = str => /^[\s\xa0]*$/.test(str);
    private isInvalidString = str => str ? (str.indexOf(this.threadPrefix) !== -1 || str.indexOf(this.messagePrefix) !== -1) : false;

    private atob = (str: string):string => Buffer.from(str, 'base64').toString('binary');
    private btoa = (str: string):string => Buffer.from(str, 'binary').toString('base64');

    public encode(str) {
        if (this.isWhitespace(str)) return str;
        str = str.replace(this.threadPrefix, '');
        return this.transliterate(this.btoa(str).replace(/=/g, ''), this.fullAlphabet, this.restrictedAlphabet);
    };

    public decode(str): string {
        if (this.isInvalidString(str) || !/^[BCDFGHJKLMNPQRSTVWXZbcdfghjklmnpqrstvwxz]*$/.test(str)) return str;
        try {
            const transliterated = this.atob(this.transliterate(str, this.restrictedAlphabet, this.fullAlphabet))
            return transliterated.indexOf(this.threadPrefix) === -1 ? this.threadPrefix + transliterated : transliterated;
        } catch (err) {
            log.error(err);
            return str;
        }
    };

    /**
     * Added function - returns the ID used by the google API, as thread ID.
     * Info taken from: https://stackoverflow.com/questions/50800330/gmail-api-does-not-support-new-thread-ids
     * @param urlHash
     */
    parseUrlEncoding(urlHash: string): string|null {
        let hash = this.decode(urlHash);
        if(!hash.includes("thread-f:")) return null;

        hash = hash.replace('thread-f:', '');
        const conversion: string = converter.decToHex(hash);
        return conversion.substring(2).toUpperCase();
    }

    parseFullUrl(url: string) {
        let parts = url.match('https?:\\/\\/mail.google.com\\/.*\\/(.*)');
        if(parts.length == 0) return null;

        return this.parseUrlEncoding(parts[1]);
    }


    private transliterate(subject, inputAlphabet, outputAlphabet) {
        if (!outputAlphabet) throw Error('rd');

        let i, j;
        const inputAlphabetSize = inputAlphabet.length;
        const outputAlphabetSize = outputAlphabet.length;

        let isEqual = true;
        for (i = 0; i < subject.length; i++)
            if (subject.charAt(i) != inputAlphabet.charAt(0)) {
                isEqual = false;
                break;
            }
        if (isEqual) return outputAlphabet.charAt(0);

        const inputAlphabetMap = {};
        for (i = 0; i < inputAlphabetSize; i++) inputAlphabetMap[inputAlphabet.charAt(i)] = i;

        const inputIndices = [];
        for (i = subject.length - 1; i >= 0; i--) {
            const char = subject.charAt(i);
            if (typeof inputAlphabetMap[char] === 'undefined') throw Error("sd`" + subject + "`" + inputAlphabet + "`" + char);
            inputIndices.push(inputAlphabetMap[char]);
        }

        const outputIndices = [];
        for (i = inputIndices.length - 1; i >= 0; i--) {
            let offset = 0;
            for (j = 0; j < outputIndices.length; j++) {
                let index = outputIndices[j] * inputAlphabetSize + offset;
                if (index >= outputAlphabetSize) {
                    const remainder = index % outputAlphabetSize;
                    offset = (index - remainder) / outputAlphabetSize;
                    index = remainder;
                } else {
                    offset = 0;
                }
                outputIndices[j] = index;
            }
            while (offset) {
                const remainder = offset % outputAlphabetSize;
                outputIndices.push(remainder);
                offset = (offset - remainder) / outputAlphabetSize;
            }

            offset = inputIndices[i];
            for (j = 0; offset; j++) {
                if (j >= outputIndices.length) outputIndices.push(0);
                let index = outputIndices[j] + offset;
                if (index >= outputAlphabetSize) {
                    const remainder = index % outputAlphabetSize;
                    offset = (index - remainder) / outputAlphabetSize;
                    index = remainder;
                } else {
                    offset = 0;
                }
                outputIndices[j] = index;
            }
        }

        const outputBuffer = [];
        for (i = outputIndices.length - 1; i >= 0; i--) {
            const index = outputIndices[i];
            if (index >= outputAlphabet.length || index < 0) throw Error("td`" + outputIndices + "`" + index);
            outputBuffer.push(outputAlphabet.charAt(index));
        }
        return outputBuffer.join('');
    }
}