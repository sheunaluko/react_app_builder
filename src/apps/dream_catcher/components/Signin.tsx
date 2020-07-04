
import React, { useState, useEffect } from 'react';
import Box from '@material-ui/core/Box';

import * as mFirebase from "./Firebase" 
window.mFirebase = mFirebase ; 

declare var ui : any ; 
declare var window : any ; 

var firebase = window.firebase 

var uiConfig = {
    callbacks: {
	signInSuccessWithAuthResult: function(authResult : any, redirectUrl : string) {
	    // User successfully signed in.
	    // Return type determines whether we continue the redirect automatically
	    // or whether we leave that to developer to handle.
	    
	    window.state.setAppSelectedMenu("info")
	    window.state.snackbarInfo("Successfully Signed in!") 
	    
	    /* 

	     */
	    mFirebase.handle_login_callbacks()
	    
	    
	    
	    return true ; 
	},
	uiShown: function() {
	    // The widget is rendered.
	    // Hide the loader.
	}
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    signInSuccessUrl: '#loggedIn',
    signInOptions: [
	// Leave the lines as is for the providers you want to offer your users.
	firebase.auth.GoogleAuthProvider.PROVIDER_ID,
	firebase.auth.FacebookAuthProvider.PROVIDER_ID,
	firebase.auth.EmailAuthProvider.PROVIDER_ID,
    ],
    // Terms of service url.
    //tosUrl: '<your-tos-url>',
    // Privacy policy url.
    //privacyPolicyUrl: '#loggedIn'
} ; 

export default function Signin() {
    
    useEffect(() => {
	var ui =  window.firebaseui.auth.AuthUI.getInstance() || new window.firebaseui.auth.AuthUI(firebase.auth()); 
	ui.start('#firebaseui-auth-container', uiConfig ) 
    }) ; 

    return (
	<Box>
	    <div id="firebaseui-auth-container"> 
	    </div>
	</Box>
    ) 
    
} 
