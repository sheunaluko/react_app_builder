import React from 'react' ; 
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Slide, { SlideProps } from '@material-ui/core/Slide';

//import { TransitionProps } from '@material-ui/core/transitions';


import * as smgr from "../state_manager" 




function Alert(props: AlertProps) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
} 


const useStyles = makeStyles((theme: Theme) => ({
    root: {
	width: '100%',
	'& > * + *': {
	    marginTop: theme.spacing(2),
	},
    },
}));


export default function CustomizedSnackbars() {
    const classes = useStyles();
    
    var [state,setState] = React.useState(
	{ info : { open : false, 
		   text : "Something informational happened!" } 
	}
    );

    smgr.register("snackbarSetState", setState) ; 
    smgr.register("snackbarInfo" , function(m :string){
	setState( { info : { open : true , 
			     text : m } } ) 
	
    })
    
    smgr.register("snackbarState", state) 


    function closer(k : string) { 
	return  (event?: React.SyntheticEvent, reason?: string) => {
	    if (reason === 'clickaway') {
		return;
	    }

	    setState( {info : {open :false, text :  "" } }) 	    

	};
	
    } 
    

    return (
	<div className="snackbar">
	    <Snackbar 
		open={state.info.open} 
		autoHideDuration={4000} 
		onClose={closer('info')}>
		<Alert onClose={closer('info')} severity="info">
		    {state.info.text} 		    
		</Alert>
	    </Snackbar>
	</div>
    );
}

