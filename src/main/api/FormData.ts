import FormData from "formdata-node";
import {Config} from "wretch";

function convertFormData(
    formObject: object,
    recursive: string[] | boolean = false,
    config: Config,
    formData = config.polyfill("FormData", true, true),
    ancestors = [] as string[]) {
    Object.entries(formObject).forEach(([key, value]: [string, any]) => {
        let formKey = ancestors.reduce((acc, ancestor) => (acc ? `${acc}[${ancestor}]` : ancestor), null);
        formKey = formKey ? `${formKey}[${key}]` : key;
        if (value instanceof Array || (globalThis.FileList && value instanceof FileList)) {
            const list = value as File[];
            if(list.length == 0) {
                formData.append(`${formKey}[]`, "");
                return;
            }
            list.forEach(item => formData.append(`${formKey}[]`, item));
        } else {
            // @ts-ignore
            if (recursive && typeof value === "object" && (!(recursive instanceof Array) || !recursive.includes(key))) {
                if (value !== null) {
                    convertFormData(value, recursive, config, formData, [...ancestors, key]);
                }
            } else {
                if (value == undefined) return;

                if(value.hasOwnProperty("file_title") && value.hasOwnProperty("file_data")) {
                    formData.set(formKey, value.file_data, value.file_title);
                    return;
                }

                formData.append(formKey, value);
            }
        }
    });
    return formData;
}
/**
 * Adds the ability to convert an object to a FormData and use it as a request body.
 *
 * ```js
 * import FormDataAddon from "wretch/addons/formData"
 *
 * wretch().addon(FormDataAddon)
 * ```
 */
const formData = {
    wretch: {
        formData(formObject: {}, recursive = false) {
            //@ts-ignore
            let formData = convertFormData(formObject, recursive, this._config);
            //@ts-ignore
            return this.headers(formData.headers).body(formData.stream);
        }
    }
};
export default formData;