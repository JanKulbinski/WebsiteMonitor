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