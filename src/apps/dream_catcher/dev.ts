
import * as DS from "./DreamSchema" 
import { v4 as uuid } from 'uuid';
import * as crypto from "./Crypto" 

import * as  mfirebase from "./components/Firebase" 

declare var window : any ; 



var drms = JSON.parse(localStorage['mydreams'])


drms.forEach((d : any)=> {
    if (typeof d.text == 'string') {
    } else { 
	d.text = d.text.payload.result
    } 
})

window.drms = drms 


var dreams : DS.DreamObject[] = []  ; 

drms.forEach( (d : any)=> {
    let {text,t } = d 
    let datetime = new Date(t).toISOString() 
    let _uuid = uuid() 
    let description = text  
    
    dreams.push({ 
	datetime, 
	uuid : _uuid ,
	description 
    }) 
    
}) 


window.dreams = dreams ; 

let key = localStorage["encryption_key"] 

var encrypted_dreams : DS.FireStorePayload[] = [] 
    
dreams.forEach( (d : DS.DreamObject ) =>  { 
    encrypted_dreams.push( 
	{
	    encrypted : true ,
	    uuid : d.uuid , 
	    dream_text : crypto.encrypt(JSON.stringify(d),key) 
	} 
    ) 
    
}) 


window.encrypted_dreams = encrypted_dreams 


window.UPLOAD_ENCRYPTED_DREAMS = async function(){
    

    let db = mfirebase.getDb() 
    let user = mfirebase.getUser() 
    
    if (! (db && user)) { throw("db or user missing!") } 
    
    var batch = db.batch();
    
    encrypted_dreams.forEach( (payload : DS.FireStorePayload)=> {
	
	var doc_ref = db.collection("encrypted_dreams").doc(user.uid).collection("dreams").doc(payload.uuid)
	//set it 
	batch.set(doc_ref, payload)
    })

    // Commit the batch
    batch.commit().then(function () {
	// - 
	console.log("Finished with batch write!") 
    });

    
} 




export default {drms} ; 
 



