import React from 'react';



import Box from '@material-ui/core/Box';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';



import { ThemeProvider } from '@material-ui/core/styles';
import { createMuiTheme } from '@material-ui/core/styles';

import purple from '@material-ui/core/colors/purple';
import green from '@material-ui/core/colors/green';
import blue from '@material-ui/core/colors/blue';



import binance_listener from "../binance_listener/App"
import medkit from "../medkit/App"
import dream_catcher from "../dream_catcher/App"

import './App.css' //have to import this to overide the CSS from previous... ? 


import * as tsw from "tidyscripts_web" 

const theme = createMuiTheme({
    palette : { 
	primary: blue  
    } 
}) 




let WidgetInfo = [
    { label : "Medkit"  , 
      app : medkit , 
      description : "Toolkit for building clinical decision support and medical education systems." } , 
    { label : "DreamCatcher" , 
      app : dream_catcher , 
      description : "Digital dream journal that leverages speech recognition." } , 
    
    { label : "BinanceListener" , 
      app : binance_listener , 
      description : "Listen to the sound of real time trading on Binance cryptocurrency exchange." } 
] 


interface State { 
    selected : any
} 

function AppCard(arg : any,setState : any){
    let {label, app, description}  = arg 
    
    var [elevation,setElevation] = React.useState(1)        
    var [color,setColor] = React.useState(theme.palette.background.paper)            
    
    let activate = function(){
	setElevation(10) 
	setColor(theme.palette.secondary.light)
    }
    let unactivate = function(){
	setElevation(1) 
	setColor(theme.palette.background.paper)
    } 
    
    return  ( 
	<Paper 
	onMouseOver={activate}
	onMouseOut={unactivate}
	style={{padding: "2%", 
		height : "100%", 
		backgroundColor : color ,
	}}
	elevation={elevation}
	onClick={function(){
	    setState({selected : app })
	}}
	> 
	<Typography variant="h4"> 
	    {label}
	</Typography>
	<Typography variant="subtitle1"> 
	    {description}
	</Typography>
	
	</Paper>
	
    )
    
} 



function App() {
    
    const [state,setState] = React.useState<State>({selected : null }) 
    
    //also check url here to see if there is a match 
    
    let Selector = function() {
	return ( <ThemeProvider theme={theme}> 
	    <div className="App" style={{display: "flex" , 
					 flexDirection: "column", 
	    }}>
	    
	    <AppBar position="static">
	    <Toolbar>
	    <IconButton edge="start" color="inherit" aria-label="menu" onClick={()=>null} >
	    <MenuIcon />
	    </IconButton>
	    <Typography variant="h6" style={{flexGrow : 1}} >
	    Please select a web application to launch 
	    </Typography>
	    </Toolbar>
	    </AppBar> 
	    
	    <Box style={{flexGrow : 1, 
			 backgroundColor : theme.palette.background.paper, 
			 padding : "4%"}}> 
	    <Grid container spacing={3}>
	    { 
		WidgetInfo.map(  
		    function(c: any) {
			return ( 
			    <Grid item xs={4} key={tsw.util.uuid()}>
				{AppCard(c,setState)}
			    </Grid>
			) 
		    }
		)
	    } 
	    </Grid>
    </Box>
    </div>
    </ThemeProvider > 
	) 
    }
    
    return (
	state.selected ? state.selected() : <Selector/> 
    )
	
}

export default App;
