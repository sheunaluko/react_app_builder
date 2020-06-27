declare var window : any ; 

let firebase = window.firebase  ; 

var user_settings = null ; 




/* 
   
   
   when user first logs in -- check firebase to see if they have 
   saved settings. 
   
   IF not then we create default settings (modify firebase rules to allow this) 
   
   
   Have a global function which SETS the settings 
     -- makes a call to the db and stores the object 
   ADD A SAVE BUTTON  which will read from settings card and make the above call 
   
   

*/ 

export {user_settings}


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
	
    } else {
	// No user is signed in.
	console.log("fb: user not logged in") 
    } 
    
    
}

handle_login_callbacks() 



export async function get_user_dreams() {
    let db = getDb() 
    let user = getUser()
    
    if (!user) { 
	window.state.snackbarInfo("You must be logged in to do this") 
    } else { 
	let drms = db.collection("encrypted_dreams").doc(user.uid).collection("dreams")
	let result = await drms.get()
	window.debug = result 
	return result
    }
}


	
