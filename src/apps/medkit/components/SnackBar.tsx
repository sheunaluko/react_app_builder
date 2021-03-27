import React from 'react';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

import * as smgr from "../state_manager" 



export default function SimpleSnackbar() {
    const [open, setOpen] = React.useState(false);
    const [msg, setMsg] = React.useState("null");    

    const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event: React.SyntheticEvent | React.MouseEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };
    
    
    let snack_time = function(msg : string) { 
	setMsg(msg)  ; 
	handleClick() ; 
    } 

    React.useEffect( ()=> {
	smgr.register("snack_time" , snack_time) 
	
    }, []) 
    
  return (
    <div>
      <Snackbar
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        message={msg}
        action={
          <React.Fragment>
            <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      />
    </div>
  );
}
