import React from 'react';

import './App.css'

import Box from '@material-ui/core/Box';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';


import LeftDrawer from "./components/LeftDrawer" 
import RightDrawer from "./components/RightDrawer"  

import WikiDataSearch from "./components/WikiDataSearch"  
import MeshSearch from "./components/MeshSearch2"  
import TestComponent from "./components/TestComponent" 

import { ThemeProvider } from '@material-ui/core/styles';
import { createMuiTheme } from '@material-ui/core/styles';

import purple from '@material-ui/core/colors/purple';
import green from '@material-ui/core/colors/green';
import blue from '@material-ui/core/colors/blue';

const theme = createMuiTheme({
    palette : { 
	primary: green  
    } 
}) 


let primary_component = MeshSearch 
//let primary_component = TestComponent

function App() {
    
    
    const [state, setState] = React.useState("info") 
    
    
    return (
	<ThemeProvider theme={theme}> 
	    <div className="App" style={{display: "flex" , 
					 flexDirection: "column", 
	    }}>
		
		<AppBar position="static">
		    <Toolbar>
			<IconButton edge="start" color="inherit" aria-label="menu" onClick={()=>null} >
			    <MenuIcon />
			</IconButton>
			<Typography variant="h6" style={{flexGrow : 1}} >
			    MEDKIT 
			</Typography>
		    </Toolbar>
		</AppBar> 
		
		<LeftDrawer /> 
		<RightDrawer /> 
		
		<Box style={{flexGrow : 1}}> 
		    { primary_component() }  
		</Box>

	    </div>
	</ThemeProvider > 
    );
}

export default App;
