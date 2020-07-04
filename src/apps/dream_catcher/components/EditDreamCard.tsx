import React,{useState}  from 'react';


import { v4 as uuidv4 } from 'uuid';
import ChipArray from "./ChipArray" 

import Autocomplete from '@material-ui/lab/Autocomplete';
import Chip from '@material-ui/core/Chip';

import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import SaveIcon from '@material-ui/icons/Save';

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
import * as tsw from 'tidyscripts_web' 


declare var window : any ; 

let fp = tsw.util.common.fp 


export default function EditDreamCard(props :any ) { 
    
    let {uuid, init_state , userDecryptedDreams} = props
    
    var dream : any = {} 
    if (uuid != "") {
	let tmp = userDecryptedDreams.filter( (d:DS.DreamObject)=>  d.uuid == uuid) 
	if (tmp.length >0) {
	    dream = tmp[0] //get the dream 
	} 
    } 
    
    var {title, description, datetime, tags} = dream 

    let [key, setKey ] = React.useState(uuidv4()) 
    
    //get all the tag options 
    var tag_options = fp.recursive_flat_remove_empty(fp.map_get(userDecryptedDreams,"tags"))
    console.log("Tag options: ") 
    console.log(tag_options) 
    
    localStorage['stored_tags']=JSON.stringify(tag_options) 

    const useStyles = makeStyles((theme: Theme) =>
	createStyles({
	    container: {
		display: 'flex',
		flexWrap: 'wrap',
		justifyContent : 'center'  
	    },
	    textField: {
		marginLeft: theme.spacing(1),
		marginRight: theme.spacing(1),
	    },
	}),
    );
    
    
    let DateAndTimePicker = (props : any) => { 
	
	let {defaultValue } = props 
	var datetime = null 
	if (defaultValue) {
	    datetime = new Date(defaultValue) 
	} 
	
	const classes = useStyles();

	return (
	    <form className={classes.container} noValidate>
		<TextField
		    id="datetime-local"
		    label="Date and Time" 
		    type="datetime-local"
		    defaultValue={ DatePickerFormat(datetime || new Date()) }
		    className={classes.textField}
		    InputLabelProps={{
			shrink: true,
		    }}
		/>
	    </form>
	);
    }
    
    let dream_uid = uuid  || uuidv4() 
    
    return ( 
	
	<Box key={key} style={{width : "100%"}}> 
	    <Card id={dream_uid} style={{padding : "3%"}}> 
		<CardContent style={{textAlign : "center"}}> 
		    <Typography variant="h5" component="h2">
			Edit Dream
		    </Typography>
		    <br/>
		    <br/>		
		    <Grid container direction="row" spacing={3}>
			
			<Grid item sm={6} xs={12}>

			    <Typography >
				Description 
			    </Typography>

			    <TextareaAutosize 
			    id="dream_description" 
			    aria-label="minimum height" 
			    rowsMin={10} 
			    defaultValue={description || ""}
			    placeholder="What happened in your dream?"
			    style={{width : "100%", fontSize: "18px", marginTop:"2%"}}
			    />
			    
			    <br/>
			    <Typography >
				Optional Title
			    </Typography>

			    <TextField margin="dense" 
				       variant="outlined" 
				       defaultValue={title||""}
				       label="Dream Title"> </TextField>

			</Grid>
			
			<Grid item sm={6} xs={12}>
			    
			    <Grid container spacing={3} > 
				
				<Grid item xs={12} style={{justifyContent : "center"}}> 
				    <DateAndTimePicker defaultValue={datetime} /> 
				</Grid>

				<Grid item xs={12}> 
				    
				    <TagAdder defaultValue={tags} options={tag_options} /> 
				    
				</Grid>

				
			    </Grid>
			    
			</Grid>
		    </Grid>
		    
		</CardContent>
		
		<CardActions style={{justifyContent  : "space-around" }} > 
		    

		    <Box style={{display: "flex" , 
				 flexDirection : "column",
				 alignItems : "center",  
				 marginLeft : "4%"}}> 

	    		<IconButton onClick={ ()=> dream_deleter(dream_uid) }> 
			    <DeleteIcon/>
			</IconButton>		  
			<Typography> 
			    Delete
			</Typography>
		    </Box>
		    

		    <Box style={{display: "flex" , 
				 flexDirection : "column",
				 alignItems : "center",  
				 marginLeft : "4%"}}> 
	    		<IconButton onClick={ ()=> dream_saver(dream_uid) }> 
			    <SaveIcon/>
			</IconButton>		  
			<Typography> 
			    Save
			</Typography>
		    </Box>
		    
		    
		</CardActions>
		
		
	    </Card> 
	    
	    
	</Box> 
	
    ) 
}


function TagAdder(props :any) { 
    
    let {defaultValue, values, options} = props 
    
    let tag_options = options ; 
    

    var init_value ; 
    if (defaultValue) { 
	init_value = defaultValue.map((label:string)=> ({key: uuidv4(),label} ))
    } else {
	init_value = [] 
    } 
        
    var init_state : { chip_data : ChipData[] } = {chip_data : init_value } 
    console.log(init_state) 
    
    let [state,setState] = React.useState(init_state) 
    
    smgr.register("tagState", state) 
    
    
    let add_tag = function(m : string) {
	let cur = (state.chip_data  as any[]) 
	//console.log(cur)
	if (cur.length > 0 ) { 
	    let last_key = cur[cur.length - 1].key
	    cur.push( {key:(last_key + 1), label : m}) 	    
	} else { 
	    cur.push( {key:0, label : m}) 
	} 
	setState( { ...state, chip_data : cur } ) 
    } 
    
    let add_tag_button = function() {
	let el = (document.getElementById("tag-search-box") as any) 
	if (el && (el.value != "")) {
	    add_tag(el.value) 
	} else {
	    console.log("ignoring add tag")
	} 
    } 
    
    return ( 
	<Box style={{   }}> 
	    <Typography>
		Optional Tags 
	    </Typography>
	    <Box style={{ display :"flex" , flexDirection : "row" , justifyContent : "center" , width : "100%"}}> 
		{Search(tag_options)} 
		<IconButton onClick={add_tag_button}> 
		    <AddCircleIcon /> 
		</IconButton>
	    </Box>
	    
	    <Box > 
		{ChipArray(state.chip_data ,"chip-array",setState)} 
	    </Box>
	    
	    
	    
	    
	</Box> 
    ) 
} 

function DatePickerFormat(d : Date) {
    d.setTime( d.getTime() - d.getTimezoneOffset()*60000) //hack because of timezone issues 
    return d.toISOString().split(":").slice(0,2).join(":")
} 


async function dream_deleter(uid : string) {  
    console.log("Deleting dream: " + uid) 

    await mFirebase.delete_dream(uid) 
    
}

async function dream_saver(uid : string) {  
    
    //
    if (! mFirebase.getUser() ) { 
	window.state.snackbarInfo("You must be logged in to save any dreams")
	return 
    } 
    
    // now we check for the encryption settings... 
    let settings : any  = mFirebase.user_settings
    if (! settings ) { 
	window.state.openGenericDialog("Oops!", "For some reason your user settings are missing. Please try log out and in or reload the website") 
	return 
    } 
    
    var encryption = false 
    var ekey = null 
    // so the settings are there -- lets check them 
    if (settings.encrypt) {
	//we will encrypt the dream 
	if (settings.store_ep ) {
	    //user indicated that they wanted ep stored 
	    if (!localStorage["encryption_key"] ) {
		//but the encryption password is missing 
		console.log("Opening async dialog...") 
		ekey =  await window.state.asyncTextQueryDialog({ title : "Enter encryption key",
								  text : "Current settings indicate that you would like to encrypt your dreams prior to storage in the cloud so that no one but you can ever read them. Current settings also indicate that you would like to store the encryption key in your web browser. However, you are either using a new device or have not yet chosen a key. Please input your encryption key now and it will be saved for future use. If you would NOT like to encrypt your dreams or if you would like to manually enter your key each time, click out of this dialog and go to the settings menu to update your preferences.", 
								  confirm : true, 
								  hide  :  true , 
								  label : "Encryption Key" }) 
		
		console.log("Got ekey: "+ ekey) 
		if (!ekey ) { 
		    window.state.snackbarInfo("Unable to retrieve encryption key") 
		    return 
		} 
		//save the key to local storage now 
		window.localStorage["encryption_key"] = ekey 
		
	    } else { 
		//and the encryption password is available 
		ekey = localStorage["encryption_key"]
	    } 
	} else { 
	    //user has indicated they do NOT want ep stored 
	    //so we must prompt them for it 
	    console.log("Opening async dialog...") 
	    ekey =  await window.state.asyncTextQueryDialog({title : "Enter encryption key", 
							     text : "Current settings indicate that you would like to encrypt your dreams prior to storage in the cloud, so that no one but you can ever read them. Current settings also indicate that you would NOT like to store the encryption key in your web browser. Please input your encryption key now. It is extremely important that you either elect to store your encryption key in the browser (in the settings menu) OR you use the EXACT same key each time, or else some of your dreams will be unrecoverable for ever!", 
							     hide : true, 
							     confirm : true, 
							     label :"EncryptionKey"}) 
	    
	    console.log("Got ekey: "+ ekey) 
	    if (!ekey ) { 
		window.state.snackbarInfo("Unable to retrieve encryption key") 
		return 
	    } 
	    
	} 
	
	//there is an encryption password so we can proceed 
	encryption = true 
    } 
    
    
    console.log(`Encryption: ${encryption} , key: ${ekey}`) 
    
    let el = document.getElementById(uid) ; 
    
    if (el) { 
	let description_el = (el.querySelector("textarea")  as any) 
	let date_el = (el.querySelector("#datetime-local") as any) 
	let tags_el = (el.querySelector("ul") as any) 
	let input_el = (el.querySelector("input") as any) 
	
	if (description_el && date_el && tags_el && input_el) { 
	    let description = description_el.value ;
	    let datetime = new Date(date_el.value).toISOString() ; 
	    let tags = Array.from(tags_el.children).map((y :any)=>y.innerText) 
	    let title = input_el.value
	    
	    //now we actually store the dream 
	    await mFirebase.save_dream( { description, datetime, tags, title, uuid : uid } , encryption, ekey ) 
	} 
	
	


    } else { 
	smgr.get("snackbarInfo")("Error saving dream")
	return null 
	
    } 
    
    
} 


function Search(ops : string[]) {
    return (
	<Autocomplete
	style={{width : "40%", }} 
	id="tag-search-box"
	freeSolo
	options={ops} 
	renderInput={(params) => (
	    <TextField {...params} label="Search..." margin="normal" variant="outlined" />
	)}
	/>
    );
}


interface ChipData {
    key: number;
    label: string;
}
