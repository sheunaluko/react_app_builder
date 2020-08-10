import React from 'react';

//import './App.css'
import Box from '@material-ui/core/Box';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';


declare var window : any ; 


function App() {
    
    
    return (
	<div className="App" style={{display: "flex" , 
				     flexDirection: "column", 
	}}>
	    
	    <AppBar position="static">
		<Toolbar>
		    <IconButton edge="start" color="inherit" aria-label="menu" >
			<MenuIcon />
		    </IconButton>
		    <Typography variant="h6" style={{flexGrow : 1}} >
			BinanceListener 
		    </Typography>
		</Toolbar>
	    </AppBar>

	    

	</div>
    );
}

export default App;
