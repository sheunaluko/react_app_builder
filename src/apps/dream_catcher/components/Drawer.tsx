import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';

import InfoIcon from '@material-ui/icons/Info';
import HotelIcon from '@material-ui/icons/Hotel';
import ImportContactsIcon from '@material-ui/icons/ImportContacts';
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';

import AccountBoxIcon from '@material-ui/icons/AccountBox';
import SettingsApplicationsIcon from '@material-ui/icons/SettingsApplications'; 

import DirectionsRunIcon from '@material-ui/icons/DirectionsRun';


import * as Firebase from "./Firebase" 

import * as smgr from '../state_manager' 

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
	    if (( m == "input" || m == "review" || m == "settings" ) && !Firebase.getUser() ) {
		console.log(window.state) 
		smgr.get("snackbarInfo")("You must be logged in to use this functionality.")
	    } 
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
    
    let SignIn = ()=> {
	if (!Firebase.getUser()) {
	    return ( 
	    <React.Fragment > 
		<ListItem button key="sign" onClick={select_menu_fn("sign")}>
		    <ListItemIcon> <AccountBoxIcon /> </ListItemIcon>
		    <ListItemText primary={"Sign In"} />
		</ListItem>
		<Divider /> 
	    </React.Fragment > 
	    ) 
	} else {
	    return (
		<React.Fragment > 
		    <ListItem button key="sign" onClick={function() {
			Firebase.signOut().then(select_menu_fn("info"))}}>
			<ListItemIcon> <DirectionsRunIcon/> </ListItemIcon>
			<ListItemText primary={"Sign Out"} />
		    </ListItem>
		    <Divider/> 
		</React.Fragment > 
	    )
	} 
    } 

    const list = () => (
	<div 
	    role="presentation"
	    onClick={()=>setState({open:false}) } 
	    onKeyDown={()=>setState({open:false}) }
	>
	    <List>
		<ListItem button key="info" onClick={select_menu_fn("info")}>
		    <ListItemIcon> <InfoIcon /> </ListItemIcon>
		    <ListItemText primary={"Get Started"} />
		</ListItem>
		<Divider />	      	      
		

		<ListItem button key="inputter"  onClick={select_menu_fn("input")}>
		    <ListItemIcon> <HotelIcon /> </ListItemIcon>
		    <ListItemText primary={"Record Dreams"} />
		</ListItem>
		<Divider />	      
		<ListItem button key="reviewer"  onClick={select_menu_fn("review")}>
		    <ListItemIcon> <ImportContactsIcon /> </ListItemIcon>
		    <ListItemText primary={"Review Dreams"} />
		</ListItem>
		<ListItem button key="manual"  onClick={select_menu_fn("manual")}>
		    <ListItemIcon> <LibraryBooksIcon/> </ListItemIcon>
		    <ListItemText primary={"Manual"} />
		</ListItem>
		<Divider />	      
		<SignIn /> 
		<ListItem button key="settings"  onClick={select_menu_fn("settings")}>
		    <ListItemIcon> <SettingsApplicationsIcon/> </ListItemIcon>
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
