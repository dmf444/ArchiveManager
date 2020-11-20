var fileSystem = require('fs');
var path = require('path');
let decode = require('image-decode');
let encode = require('image-encode');

/**
 * SOURCE: https://github.com/renanbastos93/image-to-base64/blob/master/image-to-base64.js
 *
 *
 */
export class ImageRendering {

    private static validTypeImage(image) {
        return /(?<=\S+)\.(jpg|png|jpeg|tiff|gif|tif|webp)/gi.test(image);
    }

    private static isTiffImage(image) {
        return /(?<=\S+)\.(tiff|tif|webp)/gi.test(image);
    }

    private static base64ToNode(buffer) {
        let {data, width, height} = decode(buffer);
        let newData : ArrayBuffer = encode(data, [width, height], 'jpg');
        return btoa(String.fromCharCode.apply(null, new Uint8Array(newData)));
    }

    private static base64ToNodeOriginal(buffer) {
        return buffer.toString('base64');
    }

    private static readFileAndConvert(fileName) {
        if (fileSystem.statSync(fileName).isFile()) {
            if(this.isTiffImage(fileName)) {
                return ImageRendering.base64ToNode(fileSystem.readFileSync(path.resolve(fileName)));
            } else {
                return this.base64ToNodeOriginal(fileSystem.readFileSync(path.resolve(fileName)).toString('base64'));
            }

        }
        return null;
    }

    private static isImage(urlOrImage) {
        if (ImageRendering.validTypeImage(urlOrImage)) {
            return Promise.resolve(ImageRendering.readFileAndConvert(urlOrImage));
        } else {
            return Promise.reject('[*] An error occured: Invalid image [validTypeImage === false]');
        }
    }

    public static imageToBase64(urlOrImage) {
        return ImageRendering.isImage(urlOrImage);
    }



}