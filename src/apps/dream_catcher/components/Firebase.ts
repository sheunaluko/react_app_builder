import * as DS from "../DreamSchema"
import * as crypto from "../Crypto" 

import * as tsw from 'tidyscripts_web'
import {asyncTextQueryDialog} from './AsyncTextQueryDialog' 

let fp = tsw.util.common.fp 


declare var window : any ; 

let firebase = window.firebase  ; 




var user_settings : any  = null ; 
var user_dreams  : DS.UserDreams  ;  

/* 
   
   
   when user first logs in -- check firebase to see if they have 
   saved settings. 
   
   IF not then we create default settings (modify firebase rules to allow this) 
   
   
   Have a global function which SETS the settings 
     -- makes a call to the db and stores the object 
   ADD A SAVE BUTTON  which will read from settings card and make the above call 
   
   

*/ 

export {user_settings, user_dreams}



var user_settings_promise : any = null 
var user_settings_resolver : any  = null 


user_settings_promise = new Promise((res,rej) => {
    user_settings_resolver = res 
})

export function await_user_settings() {
    return user_settings_promise 
} 

export function getDb() {
    return firebase.firestore() 
} 

export function getUser() { 
    return firebase.auth().currentUser 
} 

export function signOut() { 
    return firebase.auth().signOut() 
} 

export async function getUserSettings()  {
    var settings_doc = getDb().collection("user_settings").doc(getUser().uid) ; 
    
    var doc_data = await settings_doc.get() ; 
    if (doc_data.exists) {
	console.log("Retrieved user settings: ")
	return doc_data.data() 
    } else  { 
	return null 
    } 
} 


export function setUserSettings(s : object){
    var settings_doc = getDb().collection("user_settings").doc(getUser().uid)
    settings_doc.set(s) 
    //also update local copy  
    user_settings = s 
    console.log("Updated user settings to: " + JSON.stringify(s)) 
}

var default_settings = { 
    'encrypt'  : true, 
    'store_ep' : true, 
    'ep' : "" , 
} 


export async function await_login() : Promise<boolean> {
    
    if (getUser()) {
	return new Promise((resolve,_)=>resolve(true)) 
    } 
    
    try {
	await new Promise((resolve, reject) =>
			  window.firebase.auth().onAuthStateChanged(
			      function(_user:any) {
				  if (_user) {
				      resolve(_user)
				  } else {
				      // No user is signed in.
				      reject('no user logged in')
				  }
			      },
			      // Prevent console error
			      function(error:any){ reject(error)} 
			  )
			 )

	return true 
    } catch (error) {
	return false
    }
} 

/* 
 Set db and stuff   
 */
export async function handle_login_callbacks() { 
    console.log("Handling login cbs")
    var loggedIn  = await await_login() 
    if (loggedIn) {
	console.log("fb: user logged in") 
	//get user settings 
	let _user_settings = await getUserSettings() 
	if (!_user_settings)  {
	    setUserSettings(default_settings)
	    if (user_settings_resolver) { 
		user_settings_resolver(default_settings) 
	    } 
	    console.log("Set user default settings") 	    
	    user_settings = default_settings ; 
	} else { 
	    console.log("Retrieved user settings")
	    user_settings = _user_settings 
	    if (user_settings_resolver) { 
		user_settings_resolver(_user_settings) 
	    } 
	} 
	
	//and also will retrieve their dreams...
	await get_user_dreams() 
	
    } else {
	// No user is signed in.
	console.log("fb: user not logged in") 
    } 
    
    
}

handle_login_callbacks() 





function update_dream_ui(){
    let fn = window.state.refreshDreamUI
    if (document.getElementById("dream_reviewer")) {
	fn(); console.log("Updated dream UI") 
    } else {
	console.log("Dream UI not found for updating")
    } 
} 

export async function save_dream(d : DS.DreamObject, encrypt : boolean , key? : string) {
    console.log("Request to store dream! with encryption=" + encrypt) 
    console.log(d) 
    if (encrypt && (!key)) {
	window.state.snackbarInfo("Unable to save dream due to missing encryption key") 
	return 
    }  
    
    let db = getDb() 
    let user = getUser() 
    var payload : DS.FireStorePayload  ; 
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
    
    /* 
       TODO UPDATE THE LOCAL user_dreams variable with the new dream 
     */
    
    user_dreams[payload.uuid] = payload 
    console.log("Updated local dream: " + payload.uuid)
    
    /* 
       TODO UPDATE THE UI 
    */
    
    update_dream_ui() 
} 


export async function delete_dream(uuid : string) {
    let d = {uuid} 
    
    console.log("Request to delete dream!=" ) 
    console.log(d) 
    
    let db = getDb() 
    let user = getUser() 
    
    //now we delete
    let result = await db.collection("encrypted_dreams").doc(user.uid).collection("dreams").doc(d.uuid).delete()
    
    console.log("Deleted: " + d.uuid) 
    window.state.snackbarInfo("Dream Deleted")
    
    /* 
       TODO UPDATE THE LOCAL user_dreams variable with the new dream 
     */
    
    delete user_dreams[d.uuid] ; 
    console.log("Deleted local dream: " + d.uuid)
    
    /* 
       TODO UPDATE THE UI 
    */
    
    update_dream_ui() 
    
} 


export async function get_user_dreams() {
    
    
    let login = await await_login() ; 
    
    if (user_dreams ) { //already are cached 
	return user_dreams 
    } 
    
    let db = getDb() 
    let user = getUser()
    
    if (!user) { 

	return null 
    } else { 
	let drms = db.collection("encrypted_dreams").doc(user.uid).collection("dreams")
	let result = await drms.get()
	window.debug = result 
	var tmp : DS.UserDreams  = {} ; 
	//convert to the dictionary format 
	try {
	    result.docs.map( (d : any)=> { 
		var drm = d.data()
		tmp[drm.uuid] = drm 
	    })
	} catch (error ) {
	    console.log("Error attempting to read dreams")
	    console.log(error)
	    return null 
	} 
	
	user_dreams = tmp 
	console.log("Loaded user dreams")
	return user_dreams 
    }
}

//will get the dreams at load time -- might as well 
get_user_dreams() 


export function any_encrypted()  { 
    if ( ! user_dreams || (user_dreams == {} ) ) { 
	return undefined 
    } else { 
	return fp.any_true(fp.map(fp.values(user_dreams),
				  fp.getter("encrypted")))
    } 
} 

export async function get_decrypted_dreams() { 
    let dreams = await get_user_dreams() 
    if (! dreams) { 
	return { error : "Unable to get any dreams. Make sure you are signed in and have recorded some dreams already!" } 
    } 
    
    console.log("Got user dreams") 

    
    if (any_encrypted()) {
	if (window.state.setDreamLoadingMsg ) { 
	    window.state.setDreamLoadingMsg("Decrypting Your Dreams")
	} 
	var ekey = localStorage['encryption_key'] 
	if (!ekey) {
	    //have to prompt user for ekey then decrypt and store dreams 
	    ekey =  await asyncTextQueryDialog({title : "Enter encryption key", 
						text : "Some or all of your dreams are encrypted, however there is no encryption key stored on the current device. Please enter it now, and remember that you can update your settings so you do not need to enter every time", 
						hide : true, 
						confirm : true, 
						label :"EncryptionKey"})
	    console.log("Got ekey: "+ ekey) 
	    //if the settings say that key should be stored we will store it 
	    let settings = await await_user_settings() 
	    if (settings.store_ep) {
		console.log("Storing key locally given settings") 
		localStorage["encryption_key"] = ekey 
	    } 
	    
	    if (!ekey ) { 
		return {error : "Unable to retrieve decrypted dreams"}
	    } 
	}
	    
	//now  decrypt the dreams 
	let value :DS.DecryptedUserDreams = {} 
	try {
	    let dream_objs = fp.values(dreams) 
	    dream_objs.map((x:DS.FireStorePayload)=>{
		//console.log(x)
		if (x.encrypted) {
		    let cipher = x.dream_text 
		    //console.log("decrypting: " + cipher)			
		    //console.log(x.uuid) 
		    let res = crypto.decrypt(cipher,ekey)
		    //console.log("res: " + res) 
		    value[x.uuid] = JSON.parse(res) 
		} 
	    })
	    return {value, error : false} 
	} catch (e) {
	    console.log(e) 
	    return {error : "Sorry, An error occured while attempting to decrypt your dreams"}
	} 

    } else { 
	//can directly store dreams 
	try { 
	    let value :DS.DecryptedUserDreams = {} 
	    fp.values(dreams).map((x:DS.FireStorePayload)=>{
		value[x.uuid] = JSON.parse(x.dream_text)
	    })
	    return {value : dreams , error : false } 
	} catch(e) {
	    console.log(e) 
	    return {error :"Sorry, An error occured whil attempting to read your dreams"}
	} 
    } 
}
