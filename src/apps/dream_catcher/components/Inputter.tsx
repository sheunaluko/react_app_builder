import React,{useState}  from 'react';



import { v4 as uuid } from 'uuid';
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

import * as VM from "./voice_module" 
import * as tsw from "tidyscripts_web" 




let VC = VM.VoiceChannel 
let snd = tsw.util.sounds 

declare var window : any ; 

/* 
 Set up a way for the tutorial to know when things are happening 
   via dispatch to window custom event 
 */ 

function dispatch(msg: string) {
    window.dispatchEvent(new CustomEvent('tutorial', { detail : msg }))
} 

var setEntryState = null 


function Inputter() {
    
 
    
    let [state,setState] = React.useState({
	entry_method : "none" 
    }) 
    
    setEntryState = setState 
    
    let [login , setlogin] = React.useState(true) 

    React.useEffect( function(){
	mFirebase.await_login().then(login=>
	    login ? setlogin(true) : setlogin(false) 
	)
    })

    smgr.register("inputterSetEntryMethod" , function(m : string) {
	setState({entry_method : m}) 
    })
    
    
    var input_interface : any ; 
    
    switch (state.entry_method) { 
	case 'none' : 
	    input_interface = <EntrySelectionCard setState={setState} /> 
	    break 
	case 'voice' : 
	    input_interface = <VoiceCard setState={setState} />   
	    break 
	case 'type' : 
	    input_interface = <TypeInterface setState={setState}  /> 
	    break 
    } 
    
    return (
	<Box> 
	    <Container style={{ backgroundColor : "", flexGrow : 1, padding : "2%" }} > 
		{input_interface} 
	    </Container>
	    
	    <br/> 
	    <br/>
	    { login ? null : <Signin />  } 
	    
	    <EncryptionDialog />
	    
	</Box> 

    );
}

function DatePickerFormat() {
    let d = new Date() ; 
    d.setTime( d.getTime() - d.getTimezoneOffset()*60000) //hack because of timezone issues 
    return d.toISOString().split(":").slice(0,2).join(":")
    
} 

function get_all_tags() {
    let ts = localStorage['stored_tags']
    if (ts) { return JSON.parse(ts) } else { 
	return ["lucid"]
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

var global_uuid :any  = null
var global_add_tag :any  = null 
var global_add_description : any  = function(msg : string) {
    var el = (document.querySelector("textarea") as any ) 
    if (el) {
	if (el.value == "") { 
	    el.value = msg 
	} else { 
	    el.value = el.value+ "\n" + msg 
	} 
    } 
} 

var global_add_title : any = null 

function TagAdder() { 
    
    let tag_options = get_all_tags() 
    
    
    
    var init_state : { chip_data : ChipData[] }  = {chip_data : [] } 
    
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
    
    global_add_tag = add_tag 
    
    let add_tag_button = function() {
	let el = (document.getElementById("tag-search-box") as any) 
	if (el && (el.value != "")) {
	    add_tag(el.value) 
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

function TypeInterface(ops :any ) { 
    let {setState ,uid } = ops 
	
    let [key, setKey ] = React.useState(uuid()) 
    
    global_setKey = setKey 
    
    function set_mode(m :string) {
	setState({entry_method : m}) 
    } 

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
    
    
    let DateAndTimePicker = () => {
	const classes = useStyles();

	return (
	    <form className={classes.container} noValidate>
		<TextField
		    id="datetime-local"
		    label="Date and Time" 
		    type="datetime-local"
		    defaultValue={DatePickerFormat() } //"2017-05-24T10:30"
		    className={classes.textField}
		    InputLabelProps={{
			shrink: true,
		    }}
		/>
	    </form>
	);
    }
    
    let dream_uid = uid || uuid() 
    
    global_uuid = dream_uid 
    
    let [titleValue, setTitleValue ] = React.useState("")
    
    window.title = [titleValue, setTitleValue]
    
    let titleChange = function(event : any) {
	let t = event.target.value
	setTitleValue(t) 
    } 
    
    global_add_title = function(t : string) {
	setTitleValue(t) 
    }
    
    return ( 
	
	<Box key={key}> 
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
			    placeholder="What happened in your dream?"
			    style={{width : "100%", fontSize: "18px", marginTop:"2%"}}
	/>
	
	<br/>
	<Typography >
	    Optional Title
	</Typography>

	<TextField id ="dream_title" 
	           //defaultValue={titleDefault}
		   margin="dense" 
		   variant="outlined" 
	           value={titleValue}
	           onChange={titleChange}
		   label="Dream Title"> </TextField>

		    </Grid>
		    
		    <Grid item sm={6} xs={12}>
			
			<Grid container spacing={3} > 
			    
			    <Grid item xs={12} style={{justifyContent : "center"}}> 
				<DateAndTimePicker /> 
			    </Grid>

			    <Grid item xs={12}> 
				
				<TagAdder /> 
				
			    </Grid>

			    
			</Grid>
			
		    </Grid>
		</Grid>
		
	    </CardContent>
	    
	    <CardActions style={{justifyContent  : "space-around" }} > 
		
		
		<Box style={{display: "flex" , 
			     alignItems : "center" , 				 
			     flexDirection : "column"}}> 
		    <IconButton onClick={  ()=>set_mode("none") }> 
			<NavigateBeforeIcon/>
		    </IconButton>
		    <Typography> 
			Back 
		    </Typography>
		</Box>
	
		
		<Box style={{display: "flex" , 
			     flexDirection : "column",
			     alignItems : "center",  
		             marginLeft : "4%"}}> 

	    	    <IconButton onClick={ ()=> setKey(uuid()) }> 
			<ReplayIcon/>
		    </IconButton>		  
		    <Typography> 
			Refresh
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



var dream_editing_handlers = function(text : string) {  
    let tags = text.match(new RegExp("^(add|new|you) tag (.*)$"))
    if (tags) { 
	console.log("tags")
	let tag = tags[2]
	//add the tag foo 
	dispatch("tag") 
	VM.speak("added tag " + tag ) 
	snd.proceed() 
	global_add_tag(tag) 
	return 
    } 
    
    let titles = text.match(new RegExp("^(add|new) title (.*)$"))
    if (titles) { 
	console.log("title")	
	let title = titles[2]	
	//add thet title 
	dispatch("title") 
	VM.speak("added title " + title)
	snd.proceed() 
	global_add_title(title) 
	return 
    } 

    let titles2 = text.match(new RegExp("^title (.*)$"))
    if (titles2) { 
	console.log("title")	
	let title = titles2[2]	
	//add the title 
	dispatch("title") 
	VM.speak("added title " + title)
	snd.proceed() 
	global_add_title(title) 
	return 
    } 

    var finished = text.match(new RegExp("^(finish|finished)$"))
    if (finished) {
	console.log("finished")		
	dispatch("finished")
	//save the dream 
	dream_saver(global_uuid) 
	snd.success() 
	VM.speak("dream saved") 	
	window.state.inputterSetEntryMethod("voice") 
	VM.set_handlers(voice_entry_handlers)
	return 
    } 
    
    var abort = text.match("^(abort|exit)$")
    if (abort) {
	console.log("abort")
	dispatch("abort")  
	snd.success() 
	window.state.inputterSetEntryMethod("none") 
	VM.stop()
	VM.speak("dream deleted") 
	return 
    } 
    
    var refreshes1 = text.match(new RegExp("^(new|record) dream$"))
    var refreshes2 = text.match(new RegExp("^(you|recorded) dream$"))    
    var refreshes2 = text.match(new RegExp("^(refresh|restart)$"))        
    if (refreshes1 || refreshes2 ) {
	console.log("refresh")	
	dispatch("refresh")
	VM.speak("Restarting dream")
	snd.proceed() 
	global_setKey(uuid())
	global_add_title("")
	return 
    } 

    
    //if here then we assume we just add to description 
    console.log("description")
    global_add_description(text) 
    dispatch("description")
    snd.proceed() 
    
} 


var global_setKey : any  = null 


let new_dream = function() {
    window.state.inputterSetEntryMethod("type")
    VM.speak("Creating new dream")
    dispatch("new dream") 
    snd.input_ready()  
    
    window.state.snackbarInfo("If you have not already, I highly recommend doing the \"Voice Tutorial\" in the settings menu to learn how to use the voice entry mode!") 
    //have to change the handlers now  
    VM.set_handlers(dream_editing_handlers) 
    
} 

let voice_entry_handlers = { 
    'what time is it' : ()=>VM.speak(VM.voice_time()) , 
    'are you there' : ()=> VM.speak("yes") , 
    'record dream' : ()=> new_dream(), 
    'recorded dream' : ()=> new_dream(), 
    'new dream' : ()=> new_dream() , 
    'dream' : ()=> new_dream() , 
    'you dream' : ()=> new_dream() , 
    'blue dream' : ()=> new_dream() , 	    
}


function EntrySelectionCard(ops : any) { 
    
    let {setState} = ops 
    
    let icon_size = 149
    let icon_margin = "4%" 
    
    let voice_click = function() {
	dispatch("voice_clicked")
	setState({entry_method: "voice"})
	//and start the audio 
	VM.init()
	snd.proceed() 
	
	VM.set_handlers(voice_entry_handlers)
	
	
	
    } 

    
    return ( 
	<Card style={{padding : "3%"}}> 
	    <CardContent style={{textAlign : "center"}}> 
		<Typography variant="h5" component="h2">
		    How would you like to enter your dream?
		</Typography>
	    </CardContent>
	    
	    <CardActions style={{justifyContent : "center"}}>
		<Box style={{display: "flex" , 
			     alignItems : "center" , 				 
			     flexDirection : "column"}}> 
		    <IconButton onClick={voice_click}> 
			<SettingsVoiceIcon style={{fontSize : icon_size}} /> 
		    </IconButton>
		    <Typography> 
			Enable Voice Entry 
		    </Typography>
		</Box>

		<Box style={{display: "flex" , 
			     flexDirection : "column",
			     alignItems : "center" , 
			     marginLeft : icon_margin}}> 
		    <IconButton  onClick={()=>setState({entry_method : "type"})}> 
			<AddCircleIcon style={{fontSize : icon_size}} /> 
		    </IconButton>
		    <Typography> 
			I'll type it
		    </Typography>
		</Box>
		
	    </CardActions>
	</Card> 
    ) 
} 



function VoiceCard(ops : any) { 
    
    let {setState} = ops 
    
    let icon_size = 149
    let icon_margin = "4%" 
    
    let back = function() {
	setState({entry_method: "none"})
	VM.stop() 
    } 
    
    return ( 
	<Card style={{padding : "3%"}}> 
	    <CardContent style={{textAlign : "center"}}> 
		<Typography variant="h5" component="h2">
		    Voice Entry Mode
		</Typography>
		
		<Typography color="textSecondary" > 
		    Say "New Dream" or "Record Dream" to start 
		</Typography>
		
	    </CardContent>
	    
	    <CardActions style={{justifyContent : "center"}}>
		<Box style={{display: "flex" , 
			     alignItems : "center" , 				 
			     flexDirection : "column"}}> 
		    <IconButton onClick={back}> 
			<NavigateBeforeIcon style={{fontSize : icon_size}} /> 
		    </IconButton>
		    <Typography> 
			Back 
		    </Typography>
		</Box>
		
	    </CardActions>
	</Card> 
    ) 
} 



export default Inputter ; 



