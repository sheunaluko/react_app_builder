import React from 'react';

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
    
    
	  
	  const list = () => (
	      <div 
		  role="presentation"
		  onClick={()=>setState({open:false}) } 
		  onKeyDown={()=>setState({open:false}) }
	      >
		  <List>

		      <ListItem button key="medkit"  onClick={()=>{}}>
			  <ListItemIcon> <BuildIcon/> </ListItemIcon>
			  <ListItemText primary={"MedKit Tools"} />
		      </ListItem>
		      <Divider />	      
		      
		      
		      <ListItem button key="diagnoser"  onClick={select_menu_fn("diagnoser")}>
			  <ListItemIcon> <NavigateNextIcon/> </ListItemIcon>
			  <ListItemText primary={"Diagnosis Support Tool"} />
		      </ListItem>
		      <Divider />	      
		      
		      
		      <ListItem button key="sparql"  onClick={select_menu_fn("sparql")}>
			  <ListItemIcon> <NavigateNextIcon/> </ListItemIcon>			  
			  <ListItemText primary={"SPARQL Query Tool"} />
		      </ListItem>
		      <Divider />	      

		      
		      <ListItem button key="mesh_search"  onClick={select_menu_fn("mesh_search")}>
			  <ListItemIcon> <NavigateNextIcon/> </ListItemIcon>			  
			  <ListItemText primary={"MeSH Search Tool"} />
		      </ListItem>
		      <Divider />	      
		      
		      
		      <ListItem button key="nccih"  onClick={select_menu_fn("nccih_herb")}>
			  <ListItemIcon> <NavigateNextIcon/> </ListItemIcon>			  
			  <ListItemText primary={"NCCIH Herbals Tool"} />
		      </ListItem>
		      <Divider />	      

		      <ListItem button key="settings"  onClick={select_menu_fn("settings")}>
			  <ListItemIcon> <NavigateNextIcon/> </ListItemIcon>			  
			  <ListItemText primary={"Settings"} />
		      </ListItem>
		      <Divider />	      
		      
		      
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
