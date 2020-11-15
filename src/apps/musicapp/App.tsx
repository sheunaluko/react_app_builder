import React from 'react';

import './App.css'

import Box from '@material-ui/core/Box';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { ThemeProvider } from '@material-ui/core/styles';
import { createMuiTheme } from '@material-ui/core/styles';
import purple from '@material-ui/core/colors/purple';
import green from '@material-ui/core/colors/green';
import blue from '@material-ui/core/colors/blue';
import * as tsw from "tidyscripts_web" 
import KeyboardWidget from "./components/KeyboardWidget" 

declare var window : any  ;  


const theme = createMuiTheme({
    palette : { 
	primary: green
    } 
}) 


function App() {
    
    
    const [state, setState] = React.useState("foo") 
    
    return (
	<ThemeProvider theme={theme}> 
	    <div className="App" style={{display: "flex" , 
					 flexDirection: "column", 
	    }}>
		
		<AppBar position="static">
		    <Toolbar>
			<IconButton edge="start" color="inherit" aria-label="menu" >
			    <MenuIcon />
			</IconButton>
			<Typography variant="h6" style={{flexGrow : 1}} >
			    WebPiano
			</Typography>
		    </Toolbar>
		</AppBar> 
		
		<br /> 
		
		<KeyboardWidget /> 

	    </div>
	</ThemeProvider > 
    );
}

export default App;

