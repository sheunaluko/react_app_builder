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
import ProblemList from "./components/ProblemList"
import MeshTreeAccordion from "./components/MeshTreeAccordion"
import SparqlWidget from "./components/SparqlWidget"
import Diagnoser from "./components/Diagnoser"

import { ThemeProvider } from '@material-ui/core/styles';
import { createMuiTheme } from '@material-ui/core/styles';

import purple from '@material-ui/core/colors/purple';
import green from '@material-ui/core/colors/green';
import blue from '@material-ui/core/colors/blue';

import * as tsw from "tidyscripts_web" 
import * as dev from  "./dev"


declare var window : any  ;  
window.dev = dev 



const theme = createMuiTheme({
    palette : { 
	primary: green
    } 
}) 



//let widget_list = [ MeshTreeAccordion ] 
let widget_list = [ Diagnoser , SparqlWidget ] 

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
			    Medkit 
			</Typography>
		    </Toolbar>
		</AppBar> 
		
		<LeftDrawer /> 
		<RightDrawer /> 
		
		<Box style={{flexGrow : 1}}> 
		    { 
			widget_list.map(  
			    function(c: any) {
				return ( 
				    <div key={tsw.util.uuid()} 
					style={{
					    marginTop : "10px"
					}}
					> 
					{c()}
				    </div>
				) 
			    }
			)
//			primary_component() 
		    } 
		</Box>

	    </div>
	</ThemeProvider > 
    );
}

export default App;
