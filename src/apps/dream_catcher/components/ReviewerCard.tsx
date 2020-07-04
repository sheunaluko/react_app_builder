import React,{useState}  from 'react';


import { v4 as uuidv4 } from 'uuid';
import StaticChipArray from "./StaticChipArray" 

import Autocomplete from '@material-ui/lab/Autocomplete';
import Chip from '@material-ui/core/Chip';

import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import SaveIcon from '@material-ui/icons/Save';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';

import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

import LaptopIcon from '@material-ui/icons/Laptop';
import SettingsVoiceIcon from '@material-ui/icons/SettingsVoice';

import Container from '@material-ui/core/Container' ; 
import Card from '@material-ui/core/Card' ; 
import Grid from '@material-ui/core/Grid' ; 
import Paper from '@material-ui/core/Paper' ;  
import Box from '@material-ui/core/Box' ; 

import Fab from '@material-ui/core/Fab'; //THE BIG PLUS SIGN! 

import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';

import AddCircleIcon from '@material-ui/icons/AddCircle';

import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import TextField from '@material-ui/core/TextField';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import * as mFirebase from './Firebase' 
import * as smgr from "../state_manager" 

import Signin from "./Signin" 
import EncryptionDialog from "./EncryptionDialog" 

import {asyncTextQueryDialog} from './AsyncTextQueryDialog' 
import DeleteIcon from '@material-ui/icons/Delete'; 
import ReplayIcon from '@material-ui/icons/Replay';


import * as DS from "../DreamSchema" 
import EditDreamCard from "./EditDreamCard" 
import * as tsw from 'tidyscripts_web' 
let fp = tsw.util.common.fp 


declare var window : any ; 



export default function ReviewerCard(props :any ) { 
    
    let {mode,setMode} = props ; 
    
    
    
    let content : {[k:string] : any }  = { 
	"view"  : <ViewDreamCard   {...props} /> , 
	"edit"  : <EditDreamCard   {...props} /> , 
    } 
    
    let icon_style = { fontSize : '4vw', margin : '10px'} 
        
    return ( 
	<Container > 
	    <Box style={{display :"flex" , 
			 justifyContent : "flexStart" , 
			 alignItems : "center", 
			 marginBottom : "6px",
			 flexDirection : "row"}}> 
		<Button variant="contained" 
		        size="small"
		        color="primary"
		    onClick={()=>setMode("view")}>  View </Button> 
		<Button variant="contained"
		        color="primary"		    
		    size="small"
		    style={{marginLeft : "2px"}}
			onClick={()=>setMode("edit")}>  Edit </Button> 	    
	    </Box>
	    
	    
	    { 
		content[mode] 
	    } 
	    
	    
	    <Box style={{display:"flex" ,
			 justifyContent : "center" , 
			 alignItems : "center" ,
			 marginTop :"10px" , 
	    }}>
		<IconButton onClick={props.prev }>
		    <NavigateBeforeIcon style={icon_style} />
		</IconButton>
		<IconButton  onClick={props.next}>
		    <NavigateNextIcon style={icon_style} />
		</IconButton>
	    </Box>
	    
	    
	</Container> 

    ) 
    
    
} 


function ViewDreamCard(props : any) {
    let {uuid, init_state , width, userDecryptedDreams} = props
    
    let width_map : {[k:string] : string} = {
	'xs' : '100%', 
	'sm' : '100%' ,
	'md' : '60%' , 
	'lg' : '50%' , 
	'xl' : '50%' , 
    } 
    
    let mwidth = width_map[width] 
    
    var dream : any = {} 
    if (uuid != "") {
	let tmp = userDecryptedDreams.filter( (d:DS.DreamObject)=>  d.uuid == uuid) 
	if (tmp.length >0) {
	    dream = tmp[0] //get the dream 
	} 
    } 
    
    var {title, description, datetime, tags} = dream 
    
    var chip_data = []; 
    if (tags) {
	chip_data = tags.map((x:string)=> ({
	    key : uuidv4() , 
	    label : x
	}))
    }
    
    let dte = new Date(datetime)
    let time_str = dte.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true, minute: 'numeric' })
    let dte_string = `${dte.toDateString()}, ${time_str}`
    
    
    
    var Heading = function(){
	if (title) {
	    return (
		<React.Fragment>
		<Typography variant="h3" component="h2"> 
		    {title }
		</Typography>
		<Typography >
		    {dte_string}
		</Typography>
		</React.Fragment> 
	    )
	} else {
	    return (
		<React.Fragment>
		    <Typography variant="h3" component="h2">
			Untitled
		    </Typography>
		    <Typography >
			{dte_string}
		    </Typography>
		</React.Fragment> 
	    )
	}
    }
    
    
    return (
	<Box style={{display :"flex" , 
		     justifyContent : "center" , 
		     marginTop : "10%" , 
		     flexDirection : "row"}}> 
	<Card variant="outlined">
	<CardContent style={{justifyContent : "center" , 
			     alignItems  : "center"}}> 
	<Heading /> 

	<Typography color="textSecondary"  style={{whiteSpace : 'pre-line'}}> 
	{description}
	</Typography>

	
	{StaticChipArray(chip_data ,"chip-array")} 
	
	
	</CardContent>
	
	</Card > 
	

	
	    </Box> 
    ) 
    
    
} 
