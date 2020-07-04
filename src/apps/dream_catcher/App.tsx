import React from 'react';

import './App.css'

import Box from '@material-ui/core/Box';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

import Drawer from "./components/Drawer" 
import Reviewer from "./components/Reviewer" 
import Inputter from "./components/Inputter" 
import Info from "./components/Info" 
import Manual from "./components/Manual" 
import Analytics from "./components/Analytics" 
import Signin from "./components/Signin"  
import Settings from "./components/Settings" 
import VoiceTutorial from "./components/VoiceTutorial" 
import * as VoiceModule from "./components/voice_module"

import Snackbar from "./components/SnackBar" 


import * as smgr from "./state_manager" 
import * as crypto from "./Crypto"  
import * as mFirebase from "./components/Firebase" 
import GenericDialog from "./components/GenericDialog" 
import {AsyncTextQueryDialog} from "./components/AsyncTextQueryDialog" 

import * as VM from "./components/voice_module" 
let VC = VM.VoiceChannel //get the voice channel 

declare var window : any ; 

window.voice = VoiceModule 


const MenuComponents : {[k:string] : any }  = { 
    "review" : <Reviewer />, 
    "input" : <Inputter /> , 
    "info" : <Info /> , 
    "manual" : <Manual /> , 
    "sign" : <Box style={{ marginTop: "10%" }}><Signin /></Box>, 
    "settings" : <Settings /> , 
    "analytics"  : <Analytics /> ,
    "voice_tutorial" : <VoiceTutorial />, 
} 

function App() {
    
    
    const [state, setState] = React.useState("info") 
    
    let selectedSetter = function(s : string) {
	//first flush the voice channel 
	VM.reset() 
	//then change the UI 
	setState(s) 
    } 
    
    smgr.register("setAppSelectedMenu", selectedSetter) 
    
    let toggle = ()=> smgr.get("drawerToggle")() 
    
    return (
	<div className="App" style={{display: "flex" , 
				     flexDirection: "column", 
				      }}>
	    
	    <AppBar position="static">
		<Toolbar>
		    <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggle} >
			<MenuIcon />
		    </IconButton>
		    <Typography variant="h6" style={{flexGrow : 1}} >
			DreamCatcher
		    </Typography>
		    { VoiceModule.VoiceToggler() }
		</Toolbar>
	    </AppBar>
	    <Drawer /> 
	    
	    { MenuComponents[state] } 
	    
	    
	 <Snackbar />
	 <GenericDialog/> 
	 <AsyncTextQueryDialog /> 

	</div>
    );
}

export default App;
