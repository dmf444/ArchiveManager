import {BrowserWindow} from 'electron';


export type notificationBundle = {
    status: "error" | "warning" | "success" | "info",
    message: string,
    description: string,
    notificationId?: string
}

function sendNotification(bundle: notificationBundle) {
    BrowserWindow.getAllWindows()[0].webContents.send('notification_show', bundle);
}

export function sendSuccess(message: string, desc: string, uid: string = null) {
    sendNotification({status: "success", message: message, description: desc, notificationId: uid});
}

export function sendWarning(message: string, desc: string) {
    sendNotification({status: "warning", message: message, description: desc});
}

export function sendError(message: string, desc: string, uid: string = null) {
    sendNotification({status: "error", message: message, description: desc, notificationId: uid});
}

export function sendInfo(message: string, desc: string, uid: string = null) {
    sendNotification({status: "info", message: message, description: desc, notificationId: uid});
}