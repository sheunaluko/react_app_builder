

import * as crypto from "./Crypto" 
import * as mfirebase from "./components/Firebase" 

declare var window : any ; 


export interface FireStorePayload { 
    encrypted : boolean , 
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


export async function save_dream(d : DreamObject, encrypt : boolean , key? : string) {
    console.log("Request to store dream! with encryption=" + encrypt) 
    console.log(d) 
    if (encrypt && (!key)) {
	window.state.snackbarInfo("Unable to save dream due to missing encryption key") 
	return 
    }  
    
    let db = mfirebase.getDb() 
    let user = mfirebase.getUser() 
    var payload : FireStorePayload  ; 
    if (encrypt && key) { 
	payload = { 
	    encrypted  : true , 
	    dream_text : crypto.encrypt(JSON.stringify(d),key) , 
	    uuid : d.uuid
	} 
    } else { 
	payload = { 
	    encrypted : false , 
	    dream_text : JSON.stringify(d) , 
	    uuid : d.uuid 
	} 
    } 
    
    //now we send the payload 
    let result = await db.collection("encrypted_dreams").doc(user.uid).collection("dreams").doc(payload.uuid).set(payload)
    
    console.log("Saved the following payload") 
    console.log(payload) 
    window.state.snackbarInfo("Dream Saved!") 
    
} 



