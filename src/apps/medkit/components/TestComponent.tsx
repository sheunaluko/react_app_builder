import React from 'react';
import clsx from 'clsx';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import FilledInput from '@material-ui/core/FilledInput';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

import { useTheme } from '@material-ui/core/styles';




const useStyles = makeStyles((theme: Theme) =>
    createStyles({
	root: {
	    display: 'flex',
	    flexWrap: 'wrap', 
	    margin : "2%" , 
	    padding : "2%" , 	    
	    backgroundColor : theme.palette.background.paper , 
	},
	margin: {
      margin: theme.spacing(1),
    },
    withoutLabel: {
      marginTop: theme.spacing(3),
    },
    textField: {
      width: '25ch',
    },
  }),
);

interface State {
  text: string;
}

/* 
export default function InputAdornments() {
    
    const theme = useTheme();     
    const classes = useStyles();
    
  const [values, setValues] = React.useState<State>({
    text: '',
  });

  const handleChange = (prop: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value });
      
      console.log(`[${prop}]:: ${event.target.value}`)
      
  };


  return (
    <div className={classes.root}>
      <div>

        <FormControl fullWidth className={classes.margin} variant="outlined">
          <InputLabel htmlFor="outlined-adornment-amount">MeSH</InputLabel>
          <OutlinedInput
            id="outlined-adornment-amount"
            value={values.text}
            onChange={handleChange('text')}
            startAdornment={<InputAdornment position="start">></InputAdornment>}
            labelWidth={60}
          />
        </FormControl>
	
      </div>
    </div>
  );
}
*/

export default function InputAdornments() {
    
    const theme = useTheme();     
    const classes = useStyles();
    
    const [values, setValues] = React.useState<State>({
	text: '',
    });

    const handleChange = (prop: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
	setValues({ ...values, [prop]: event.target.value });
	
	console.log(`[${prop}]:: ${event.target.value}`)
	
    };


    return (
	    <div>

		<FormControl fullWidth className={classes.margin} variant="outlined">
		    <InputLabel htmlFor="outlined-adornment-amount">MeSH</InputLabel>
		    <OutlinedInput
			id="outlined-adornment-amount"
			value={values.text}
			onChange={handleChange('text')}
			startAdornment={<InputAdornment position="start">></InputAdornment>}
			labelWidth={60}
		    />
		</FormControl>
		
	    </div>
    );
}
