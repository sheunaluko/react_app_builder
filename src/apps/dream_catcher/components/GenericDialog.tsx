import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import * as smgr from "../state_manager" 

export default function FormDialog() {

    var init_state : { title : string, text : string} = { title : "" , text : "" } 
    
    const [state, setState] = React.useState(init_state) 
    

    
    smgr.register("openGenericDialog" , function(title:string, text :string) {
	setState({ title, text})
    })
    
    
    let   open = (state.title != "" && state.text != "") 
    
    const handleClose = () => {
	setState(init_state) 
    };

    return (
	<Dialog 
	    open={open} 
	    onClose={handleClose} 
	    aria-labelledby="form-dialog-title">
	    <DialogTitle id="form-dialog-title">{state.title}</DialogTitle>
	    <DialogContent>
		<DialogContentText>
		    {state.text} 
		</DialogContentText>
	    </DialogContent>
	    <DialogActions>
		<Button onClick={handleClose} color="primary">
		    OK 
		</Button>
	    </DialogActions>
	</Dialog>
    );
}
