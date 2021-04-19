import React from "react";
import { useState } from "react";
import * as util_components from "./utils";
import { useTheme } from "@material-ui/core/styles";
import * as tsw from "tidyscripts_web";
import * as mui from "./list"
let {
    Container,
    FormControlLabel,
    FormLabel, 
    RadioGroup, 
    Radio, 
    Divider, 
    Checkbox,
    Grid,
    Paper,
    AddCircleOutlineIcon,
    Link,
    TextField,
    Box,
    FormControl,
    FormHelperText,
    Breadcrumbs,
    Tabs,
    Tab,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    ExpandMoreIcon,
    FaceIcon,
    IconButton,
    Icon,
    InputLabel,
    OutlinedInput,
    InputAdornment,
    DoneIcon,
    Avatar,
    Button,
    Visibility,
    VisibilityOff,
    Typography
} = mui;

let fp = tsw.util.common.fp;
let mesh = tsw.apis.mesh;
let wikidata = tsw.apis.wikidata;
let log = console.log;
let debug = tsw.util.common.debug;
declare var window: any;





export default function C(props : any){
    
    let {init_classes, all_classes, on_change, title, init_mode} = props; 
    
    const [state, setState] = React.useState<any>({
	classes : init_classes, 
    });
    const [curr_mode,set_mode] = React.useState<any>(init_mode || "And")        
    let handler = function(c :string) { 
	return function() {
	    console.log("Clicked:" + c) 
	    setState( s => { 
		let new_classes  =  fp.clone(s.classes) 
		new_classes[c] = ! ( new_classes[c] || false )  
		return { ...s , classes : new_classes }
	    })
	} 
    } 

    React.useEffect( ()=> {
	let selections = fp.keys(state.classes).filter( k=> state.classes[k])
	let mode = curr_mode 
	let cdata = { selections , mode }
	on_change( cdata) 
	console.log("Handled change:")
	console.log(cdata) 
    }, [state.classes,curr_mode])    
    
    return ( 
	<Box> 
	    
	    <Typography variant="h5"> 
		{title} 
	    </Typography>
	    <Box style={{
		display:"flex" , 
		flexDirection : "row" , 
	    }}> 
		<Box>
		    <FormControl component="fieldset">
			<FormLabel component="legend">Mode:</FormLabel>
			<RadioGroup row aria-label="position" name="position" value={curr_mode} onChange={m=>set_mode( (m.target as any).value   )}>
			    <FormControlLabel
				value="And"
				control={<Radio color="primary" />}
				label="And"
				labelPlacement="end"
			    />
			    <FormControlLabel
				value="Or"
				control={<Radio color="primary" />}
				label="Or"
				labelPlacement="end"
			    />
			</RadioGroup>
		    </FormControl>
		</Box>
	    </Box>
	    
	    <Divider /> 
	    
	    
	    { 
		
		all_classes.map(c => ( 
		    <Box key={c} style={{display: "flex", flexDirection : "row"}}  > 
			<FormControlLabel
			    control={<Checkbox checked={state.classes[c] || false } onChange={handler(c)} name={c} />}
			    label={c}
			/>
		    </Box>
		))
	    } 
	    
	</Box> 
    ) 

}
