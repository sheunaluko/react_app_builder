


export interface FireStorePayload { 
    encrypted : boolean , 
    decrypted? : boolean, 
    uuid : string, 
    dream_text : string,  //AES(JSON.strinigfy(DreamObject)) || JSON.stringify(DreamObject) 
} 

export interface DreamObject { 
    description : string  , 
    uuid : string, 
    datetime : string , //date.toISOString() 
    title? : string, 
    tags? : string[] ,
} 

export interface UserDreams {  
    [k: string] : FireStorePayload 
} 


export interface DecryptedUserDreams {
    [k : string] : DreamObject , 
} 

