function convertFormData(formObject, recursive = false, config, formData = config.polyfill("FormData", true, true), ancestors = []) {
    Object.entries(formObject).forEach(([key, value]) => {
        let formKey = ancestors.reduce((acc, ancestor) => (acc ? `${acc}[${ancestor}]` : ancestor), null);
        formKey = formKey ? `${formKey}[${key}]` : key;
        if (value instanceof Array || (globalThis.FileList && value instanceof FileList)) {
            // @ts-ignore
            for (const item of value)
                formData.append(formKey, item);
        } else {
            // @ts-ignore
            if (recursive && typeof value === "object" && (!(recursive instanceof Array) || !recursive.includes(key))) {
                if (value !== null) {
                    convertFormData(value, recursive, config, formData, [...ancestors, key]);
                }
            } else {
                formData.append(formKey, value);
            }
        }
    });
    return formData;
}
/**
 * Adds the ability to convert a an object to a FormData and use it as a request body.
 *
 * ```js
 * import FormDataAddon from "wretch/addons/formData"
 *
 * wretch().addon(FormDataAddon)
 * ```
 */
const formData = {
    wretch: {
        formData(formObject, recursive = false) {
            //@ts-ignore
            let formData = convertFormData(formObject, recursive, this._config);
            //@ts-ignore
            return this.headers(formData.headers).body(formData.stream);
        }
    }
};
export default formData;