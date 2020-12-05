export interface IPostMessage {
    data: any;
    origin: string;
  }

export interface UserPasses {
    mail:string,
    password:string
}

export interface User {
    name:string,
    surname:string,
    mail:string,
    password :string, 
    password2: string
}

export interface Monitor {
    start: string,
    end: string,
    choosenElement: {
        tag: string,
        index: number
    },
    keyWords: string,
    intervalMinutes: number,
    textChange: boolean,
    allFilesChange: boolean,
    author:string,
    mailNotification: string,
    url: string
}

export interface Scan {
    id: number,
    raportPath: string,
    isDiffrence: number,
    new_files: string[],
    changed_files: string[],
    deleted_files: string[],
    keyWordsOccurance: string,
    keyWordsOccuranceList: string[][],
    isOpen: boolean,
    date: string,
}

export interface MonitorCardType {
    active: boolean,
    end: string,
    start: string,
    url: string,
    id: string,
};

