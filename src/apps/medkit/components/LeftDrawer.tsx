import React from 'react';
import { useTheme } from "@material-ui/core/styles";


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

    const theme = useTheme() 
    
    const [state, setState] = React.useState({
	open : false  
    });
    
    smgr.register("drawerSetState", setState) 
    smgr.register("drawerState" , state) 
    smgr.register("drawerToggle" , ()=> { setState({open : !state.open}) } ) 
    
    
    //grab the selectedMenuSetter
    let select_menu_fn = function(m : string) {
	return function() { 
	    smgr.get("setAppSelectedMenu")(m) ;
	}
    } 
    

    const toggleDrawer = (open: boolean) => (
	event: React.KeyboardEvent | React.MouseEvent,
    ) => {
	if (
	    event.type === 'keydown' &&
	    ((event as React.KeyboardEvent).key === 'Tab' ||
             (event as React.KeyboardEvent).key === 'Shift')
	) {
	    return;
	}

	setState({ ...state, open : true  });
    };
    
    
    
    const list_item = (k : string,display: string) => ( 
	<React.Fragment key={k}> 
	    <ListItem button key={k} onClick={select_menu_fn(k)}>
		<ListItemIcon >
		    <NavigateNextIcon style={{color : theme.palette.secondary.dark}} /> 
		</ListItemIcon>
		<ListItemText primary={display} />
	    </ListItem>
	    <Divider />	      
	</React.Fragment> 

    ) 
    
    const list_items = [ 
	["diagnoser", "Diagnosis Support v1"], 
	["diagnoser2", "Diagnosis Support v2"], 	
	["sparql", "SPARQL"] , 
	["mesh_search", "MESH Search"], 
	["entity_view", "Entity Viewer"], 
	["wiki_search", "Wiki Search"], 	
	["nccih_herbs", "NCCIH Herb Info"],
	["problem_list", "Problem List"], 
	["wikidata_editor"  , "Wikidata Editor"], 
	["wikidata_entity_maker"  , "Wikidata Entity Creator"], 	
	["voice_panel", "Voice Panel"],
	["settings", "Settings"] 

    ] 
    
    const list = () => (
	<div 
	    role="presentation"
	    onClick={()=>setState({open:false}) } 
	    onKeyDown={()=>setState({open:false}) }
	>
	    <List>
		
		<ListItem button onClick={()=>{}}>
		    <ListItemIcon> <BuildIcon/> </ListItemIcon>
		    <ListItemText primary={"MedKit Components"} />
		</ListItem>
		<Divider />	    
		

		{
		    list_items.map( function(e:any){
			let [k, title] = e 
			return list_item(k, title) 
		    })
		}
		
	    </List>


	</div>
    );

    return (
	<div>
            <Drawer anchor='left' open={state.open} onClose={()=>setState({open: false })}>
		{list()} 
            </Drawer>
	</div>
    );
}
