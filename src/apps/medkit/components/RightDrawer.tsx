import React from 'react';
import * as mk from "../medkit"
import * as smgr from '../state_manager' 
import * as mui from "./list";

let {
    Container,
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
    List,
    ListItem, 
    ListItemIcon, 
    ListItemText, 
    Divider, 
    BuildIcon,
    Drawer,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    NavigateNextIcon, 
    ExpandMoreIcon,
    FaceIcon,
    IconButton,
    Icon,
    InputLabel,
    OutlinedInput,
    InputAdornment,
    DoneIcon,
    Card, 
    Avatar,
    Button,
    Visibility,
    VisibilityOff,
    Typography
} = mui;

declare var window : any ;



export default function AppDrawer() {

    const [state, setState] = React.useState({
	open : false  ,
	html_string : "<div>Whoooo!</div>"
    });
    
    smgr.register("RdrawerSetState", setState) 
    smgr.register("RdrawerState" , state) 
    smgr.register("RdrawerToggle" , ()=> { setState({...state, open : !state.open}) } ) 
    smgr.register("RdrawerOpen" , ()=> { setState({...state, open : true}) } ) 
    smgr.register("RdrawerClose" , ()=> { setState({...state, open : false}) } )     
    smgr.register("RdrawerSetHtml" , (strang : string)=> { setState({...state, html_string : strang}) } )     
    
    
    return (
	<div>
            <Drawer anchor='right' open={state.open} onClose={()=>setState({...state,open: false })}>
		<iframe
		
		    frameBorder="0"
		    src={"data:text/html;charset=utf-8," + escape(state.html_string)}
		/> 
            </Drawer>
	</div>
    );
}
