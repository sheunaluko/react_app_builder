import React from 'react';

import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

import LaptopIcon from '@material-ui/icons/Laptop';
import SettingsVoiceIcon from '@material-ui/icons/SettingsVoice';

import Container from '@material-ui/core/Container' ; 
import Card from '@material-ui/core/Card' ; 

import Fab from '@material-ui/core/Fab'; //THE BIG PLUS SIGN! 

import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
 

/* 
   TODO 
   Modular interface for inputting via voice or text 
   Make text interface first , should be minimal funcitonality like 
   free text of the dream as well as any tags , ALSO THE date -- can keep it simple at first 
   The TEXT EDITING INTERFACE SHOULD ACTUALLY BE THE SAME AS THE CARD WHICH DISPLAYS THE DREAM, 
   AND THERE CAN BE A TOGGLE SWITCH to turn it into view or edit more
   
   Dreams can be referenced by uuids, which are generated upon creation 
   
   OK, so I will do the above --- but also 
   
   WILL incorporate two of my first MODULES into tidyscripts web 
   1) sounds (check if existing?) 
   2) chrome web speech (pretty sure exists!? ) 
   
   Then will plug these into dream catcher 
   
   Can make a voice tutorial as well, when this module isloaded it can check if it is 
   the first time the app is running, and if it is then forward the USER TO THE VOICE_TUTORIAL 
   MENU TAB 

*/ 

function Inputter() {
    return (
	<Container style={{ backgroundColor : "", flexGrow : 1, padding : "2%" }} > 
	    
	    <Card> 
		<CardActions style={{justifyContent : "flex-end"}}>
		    <IconButton> 
			<SettingsVoiceIcon /> 
		    </IconButton>

		    <IconButton> 
			<LaptopIcon /> 
		    </IconButton>
		</CardActions>
		
		<CardContent style={{textAlign :"center"}}>

		    <Typography variant="h5" component="h2">
			Start Recording! 
		    </Typography>
		    <br/> 		    
		    <Typography  color="textSecondary" gutterBottom>
			<br/> 
			This is stuff ! 
		    </Typography>
		</CardContent> 
	    </Card>

	</Container>
    );
}



export default Inputter ; 



