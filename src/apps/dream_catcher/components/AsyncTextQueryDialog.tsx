import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import Alert from '@material-ui/lab/Alert';
 



import ToggleText from './ToggleText' 

import * as smgr from "../state_manager" 

declare var window : any ;

var resolve_init : any = null

export function AsyncTextQueryDialog() {

    var init_state = {open: false , title : "" , text : "" , resolve :  resolve_init, hide : false, confirm : false , label : "Input"}  
    
    const [state, setState] = React.useState(init_state);    
    
    var init_alert : any = "hidden" ;
    const [alert, setAlert] = React.useState(init_alert);    
    
    smgr.register("openAsyncTextDialog", function(s : any){ setState(s)} ) 
    
    const handleClose = () => {
	setState(init_state) 
    };
    
    const handleBackdrop = ()=> { 
	state.resolve(null) 
	handleClose() 
    } 
    
    const handleSubmit = () => {  
	console.log("Handling submit!") 
	console.log(state) 
	
	//verify the inputs 	
	let input_el = (document.getElementById("asyncTextQueryDialog")  as any) 
	if (input_el) {
	    var input = input_el.value 
	} 
	

	if (state.confirm) {
	    let confirm_el = (document.getElementById("asyncTextQueryDialogConfirm")  as any) 
	    if (confirm_el) {
		var confirm = confirm_el.value 
	    } 
	    

	    /* 
	    console.log(confirm)
	    console.log(input) 
	    */
	    
	    //now we check 
	    //if both are empty then the user just clicked out so we will return null 
	    if (input == '' && confirm == '' ) {
		state.resolve(null)
		handleClose() 
		return 
	    } 

	    //if they do not match then we will show the alert for 3 seconds and let user 
	    //try again 
	    if (input != confirm ) { 
		setAlert("visible") 
		setTimeout ( ()=>setAlert("hidden") , 4000) 
		return 
	    }  else { 
		//if they DO match that we resolve the promise with them 
		state.resolve(input) 
		handleClose() 
		return 
	    } 
	    
	} else { 
	    //we do NOT need to confirm 
	    if (input == '') { 
		state.resolve(null) 
	    } else { 
		state.resolve(input) 
	    } 
	    
	    handleClose() 
	    
	} 
	
    } 
    

    let ConfirmComponent = () => (
	<ToggleText id="asyncTextQueryDialogConfirm"
		    label="Confirm" 
		    show={!state.hide} >
	</ToggleText>
    ) 
    
    return (
	<Dialog open={state.open} onBackdropClick={handleBackdrop} onClose={handleClose} aria-labelledby="form-dialog-title">
	<DialogTitle id="form-dialog-title">{state.title}</DialogTitle>
	<DialogContent>
	<DialogContentText>
	{state.text} 
		</DialogContentText>
		
		<Box style={{display : "flex" ,flexDirection: "column"}}>
		    <ToggleText id="asyncTextQueryDialog"
				label={state.label} 
				show={!state.hide} >
		    </ToggleText>
		    {state.confirm ? <ConfirmComponent /> : null } 
		    
		    {state.confirm ? <Alert style={{visibility:alert}} severity="error">Entries do not match.</Alert>  :null } 

		</Box>
		
		
	    </DialogContent>
	    <DialogActions>
		<Button onClick={handleSubmit} color="primary">
		    Submit
		</Button>
	    </DialogActions>
	</Dialog>
	
    );
}

interface ops  { 
    title : string, 
    text : string, 
    hide? : boolean , 
    confirm? :boolean , 
    label? : string, 
} 

export async function asyncTextQueryDialog(ops : ops) {
    
    let {title,text,hide,confirm, label} = ops 
    
    return new Promise( (resolve,reject)=> { 
	window.state.openAsyncTextDialog({ 
	    open : true, 
	    title, 
	    text , 
	    hide ,  
	    label, 
	    confirm , 
	    resolve 
	})
    }) 
    
} 

smgr.register("asyncTextQueryDialog" , asyncTextQueryDialog ) 
