import React, {useEffect}  from 'react';

import IconButton from '@material-ui/core/IconButton';

import TextField from '@material-ui/core/TextField';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';

import FormControl from '@material-ui/core/FormControl';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

import SaveIcon from '@material-ui/icons/Save';




export default function PasswordText(id : string) {
    const [values, setValues] = React.useState({
	password: '',
	showPassword: false,
    });
    
    
    const handleChange = (prop : any ) => (event :any) => {
	setValues({ ...values, [prop]: event.target.value });
    };

    const handleClickShowPassword = () => {
	setValues({ ...values, showPassword: !values.showPassword });
    };
    
    const handleMouseDownPassword = (event : any) => {
	event.preventDefault();
    };
    
    
    return (
	<FormControl >
	    <InputLabel htmlFor={id}>Password</InputLabel>
	    <Input
	    id={id}
	    type={values.showPassword ? 'text' : 'password'}
	    onChange={handleChange('password')}
	    endAdornment={
		<InputAdornment position="end">
		    <IconButton
			aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
				    onMouseDown={handleMouseDownPassword}
		    >
			{values.showPassword ? <Visibility /> : <VisibilityOff />}
		    </IconButton>
		</InputAdornment>
	    }
	    />
        </FormControl> 
    ) 

} 
