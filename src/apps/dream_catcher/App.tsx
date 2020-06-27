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
import Signin from "./components/Signin"  
import Settings from "./components/Settings" 

import Snackbar from "./components/SnackBar" 


import * as smgr from "./state_manager" 
import * as crypto from "./Crypto"  
import * as mFirebase from "./components/Firebase" 
import GenericDialog from "./components/GenericDialog" 
import {AsyncTextQueryDialog} from "./components/AsyncTextQueryDialog" 


import dream_catcher from "./dream_catcher.jpg" 
import  "./dev" 





const MenuComponents : {[k:string] : any }  = { 
    "review" : <Reviewer />, 
    "input" : <Inputter /> , 
    "info" : <Info /> , 
    "manual" : <Manual /> , 
    "sign" : <Box style={{ marginTop: "10%" }}><Signin /></Box>, 
    "settings" : <Settings /> , 
} 

function App() {
    
    const [state, setState] = React.useState("input") 

    smgr.register("setAppSelectedMenu", setState) 
    
    let toggle = ()=> smgr.get("drawerToggle")() 
    
    return (
	<div className="App" style={{display: "flex" , 
				     flexDirection: "column", 
				     backgroundImage:`url(${dream_catcher})`  }}>
	    
	    <AppBar position="static">
		<Toolbar>
		    <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggle} >
			<MenuIcon />
		    </IconButton>
		    <Typography variant="h6" >
			DreamCatcher
		    </Typography>
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
