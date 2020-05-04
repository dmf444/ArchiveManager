export enum FileState {
    NEW, //File has been entered into the system, temp downloaded, but not actually
    ACCEPTED, //User has accepted the file for download. This is basically new, but without the new flag.
    NORMAL, //File is in the processor path, waiting for data input and upload
    ERROR,
    WARN,
    DUPLICATE
}
