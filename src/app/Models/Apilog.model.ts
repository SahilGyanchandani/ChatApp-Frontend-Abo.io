export interface ApiLog {
    id: string,
    userId: string,
    userName: string,
    clientIpAddress: string,
    action: string,
    applicationName: string,
    browserInfo: string,
    creationTime: string
}