import {BrowserWindow} from 'electron';


export type notificationBundle = {
    status: "error" | "warn" | "success",
    message: string,
    description: string
}

function sendNotification(bundle: notificationBundle) {
    BrowserWindow.getAllWindows()[0].webContents.send('notification_show', bundle)
}

export function sendSuccess(message: string, desc: string) {
    sendNotification({status: "success", message: message, description: desc});
}

export function sendWarning(message: string, desc: string) {
    sendNotification({status: "warn", message: message, description: desc});
}

export function sendError(message: string, desc: string) {
    sendNotification({status: "error", message: message, description: desc});
}