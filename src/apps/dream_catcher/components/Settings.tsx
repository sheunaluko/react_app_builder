import React, {useEffect}  from 'react';

import LinearProgress from '@material-ui/core/LinearProgress';
 

import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';

import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';

import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Pagination from '@material-ui/lab/Pagination';

import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NightsStayIcon from '@material-ui/icons/NightsStay'; 

import HotelIcon from '@material-ui/icons/Hotel';
import ImportContactsIcon from '@material-ui/icons/ImportContacts';
import SettingsVoiceIcon from '@material-ui/icons/SettingsVoice';
import LockIcon from '@material-ui/icons/Lock';
import LocalFloristIcon from '@material-ui/icons/LocalFlorist';

import Checkbox from '@material-ui/core/Checkbox';

import TextField from '@material-ui/core/TextField';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';

import FormControl from '@material-ui/core/FormControl';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

import SaveIcon from '@material-ui/icons/Save';

import PasswordText from "./PasswordText" 


import * as mFirebase from './Firebase' 




declare var window : any;


var checkBoxState : any = { }  



function MyCheckbox(id : string) {
    const [checked, setChecked] = React.useState(false);

    const handleChange = (event : any) => {
	setChecked(event.target.checked);
    };
    
    checkBoxState[id] = setChecked

    return (
	<Checkbox
	id={id}
            checked={checked}
            onChange={handleChange}
            inputProps={{ 'aria-label': 'primary checkbox' }}
	/>
    )

    
    
}


var settings_components : {[k:string] : any }   = { 
    "checkbox" : MyCheckbox , 
    "hiddenTextField" : PasswordText , 
} 


/* 

   SETTINGS INTERFACE 
   
 */

function Settings () {
    
    var [loading,setLoading] = React.useState(true) 
    
    useEffect( () => {
	
	mFirebase.await_user_settings().then(function(settings : any){ 
	    
	    console.log("Got settings!")
	    console.log(settings) 
	    
	    let key = localStorage["encryption_key"]
	    let ep_el = (document.getElementById("ep") as any) 
	    
	    //console.log([key,ep_el]) 
	    if (ep_el && key && (typeof key == 'string') ) {
		ep_el.value = localStorage["encryption_key"]
	    } else { 
		//pass 
	    } 
	    

	    //console.log(mFirebase) 
	    //update the ui state 
	    checkBoxState["encrypt"](settings.encrypt) 
	    checkBoxState["store_ep"](settings.store_ep) 		
	    
	    setLoading(false) 
	    
	}) 
    } ) 

    
    
    
    let settings_options = [ 
	{ id : "encrypt" ,
	  main: "Encrypt my dreams before storing them" ,
	  el : "checkbox" }  , 
	{ id : "store_ep" ,
	  main: "Store my encryption password locally in my browser" ,
	  note: "This is encouraged so you do not have to renter the password everytime you want to review your dreams"  , 
	  el : "checkbox" } , 
	{ id : "ep" ,
	  main : "Use the following encryption password for my dreams" ,
	  note : "Note: If you lose or change this password it will be IMPOSSIBLE to recover any of your previously recorded dreams. Please choose it wisely and only change it if you have not already recorded any dreams!" , 
	  el : "hiddenTextField" } 
    ] 


    

    let SettingsCard = function() {
	return (
	    <Card  > 
		<CardContent style={{textAlign :"center"}}>

		    <Typography variant="h4" component="h2">
			Settings 
		    </Typography>

		    
		    {loading ? <Box><br/><br/><LinearProgress color="secondary" /></Box> : null } 
		    
		    
		    <br/> 		    
		    <br/> 		    		    
		    
		    <Grid container spacing={3} > 
			{settings_options.map(function(x : any){
			     var {id , main , el , note }  = x  
			     
			     var note_el ; 
			     if (note ) {
				 note_el = ( 
				     <Typography    
					 color="textSecondary" 
					 gutterBottom >
					 {note} 
				     </Typography> 
				 )
				 
			     }else  {
				 note_el = null 
			     } 
			     
			     return ( 
				 <React.Fragment key={id}> 
				     <Grid item sm={6} xs={12} >
					 <Typography > 
					     {main} 
					 </Typography>
					 {note_el} 
				     </Grid>

				     <Grid item sm={6} xs={12}>
					 {settings_components[el as string](id) } 
				     </Grid>
				 </React.Fragment>
			     )
			 })}
		    </Grid>
		    
		</CardContent> 
		<CardActions style={{justifyContent : "center" }} > 
		    <Box style={{flexDirection :"column" , alignItems : "center"}}> 
			<IconButton onClick={save_settings}>
			    <SaveIcon /> 
			</IconButton>
			<Typography style={{textAlign : "center" }}>
			    Save! 
			</Typography> 
		    </Box>
		</CardActions>

	    </Card>
	)
    } 
    
    
    return (
	<Container style={{ flexGrow : 1 , padding : "2%" }}> 
	    
	    <Box style={{height : "100%" , 
			 display : "flex", 
			 flexDirection : "column", 
			 justifyContent :"flex-start" }} >
		
		<SettingsCard /> 
		
		
	    </Box>

	</Container>
    );
}



export default Settings ; 




function save_settings() { 
    
    let encrypt_el = (document.getElementById("encrypt") as any)
    let store_el   = (document.getElementById("store_ep")  as any)
    let ep_el      = (document.getElementById("ep") as any)
    
    if (encrypt_el && store_el && ep_el) { 
	let encrypt = encrypt_el.checked 
	let store_ep = store_el.checked 
	let ep  = ep_el.value 
	
	mFirebase.setUserSettings({...mFirebase.user_settings,encrypt,store_ep}) // 
	//update the UI 
	encrypt_el.checked = mFirebase.user_settings.encrypt 
	store_el.checked = mFirebase.user_settings.store_ep 

	if (store_ep && (ep != "")) { 
	    //overwrite the encryption key! 
	    console.log("overwriting encryption key to: " + ep)
	    console.log("last encryption key was: " + localStorage["encryption_key"])	    
	    localStorage["encryption_key"] = ep 
	} 
	
	if (!store_ep) {
	    //delete the key 
	    delete localStorage["encryption_key"]
	    console.log("Removed encryption key!") 
	    ep_el.value = "" 
	} 
	
	window.state.snackbarInfo("Settings saved!") 
	
    } else{ 
	window.state.openGenericDialog("Oops, there was an error" ,"Please reload the application" ) 
    } 
	
    
    
    
} 
