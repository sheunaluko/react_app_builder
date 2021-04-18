import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import Input from '@material-ui/core/Input';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Typography from '@material-ui/core/Typography';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import GitHubIcon from '@material-ui/icons/GitHub';
import HeadsetMicIcon from '@material-ui/icons/HeadsetMic';
import ContactSupportIcon from '@material-ui/icons/ContactSupport';

import IconButton from '@material-ui/core/IconButton';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';

import TimelineIcon from '@material-ui/icons/Timeline';
import InfoIcon from '@material-ui/icons/Info';
import CancelIcon from '@material-ui/icons/Cancel';
import CloseIcon from '@material-ui/icons/Close';
import HotelIcon from '@material-ui/icons/Hotel';
import ImportContactsIcon from '@material-ui/icons/ImportContacts';
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';

import AccountBoxIcon from '@material-ui/icons/AccountBox';
import SettingsApplicationsIcon from '@material-ui/icons/SettingsApplications'; 

import DirectionsRunIcon from '@material-ui/icons/DirectionsRun';

import * as tsw from "tidyscripts_web" 
import * as smgr from '../state_manager' 

import * as AU from './AnalyticsUtils'

declare var window : any ;

export default function AppDrawer() {

    const [state, setState] = React.useState({
	open : false  
    });
    
    smgr.register("AdrawerSetState", setState) 
    smgr.register("AdrawerState" , state) 
    smgr.register("AdrawerToggle" , ()=> { setState({open : !state.open}) } ) 
    
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
    
 
  return (
      <div>
          <Drawer anchor='left' open={state.open} onClose={()=>setState({open: false })}>
	      
	      <Box style={{
		  display : 'flex', 
		  flexDirection : 'column' , 
		  padding : "16px", 
	      }}>
		  <Typography variant="h6"> 
		      {`Analytics Settings`}
		  </Typography>
		  <Divider/> 
		  <br/> 
		  

		  
		  
		  <WordFilter name="Default"/> 
		  <WordFilter name="User"/> 		  
		  

	      </Box>
          </Drawer>
      </div>
  );
}





function WordFilter(props : any) {
    /* 
       Drawer UI component for suppressing certain words from analysis 
     */ 
    
    
    let {name } = props ; 
    
    /* 
       let to_filter = tsw.apis.local_storage.get("Default")
       if (to_filter) {
       console.log("Detected default filter and using it")
       tokens = tokens.filter( w => !to_filter.includes(w) )    	    
       } else { 
       console.log("No stored default filter so using original")	    
       tokens = tokens.filter( w => !AU.default_filter.includes(w) )    	    	    
       } 
       
     */ 
    
    var to_filter; 
    if (name == "Default" ) {
	to_filter = tsw.apis.local_storage.get("Default")
	if (to_filter) {
	    console.log("Detected default filter and using it")
	} else { 
	    console.log("No stored default filter so using original")	    
	    to_filter = AU.default_filter.map( w => (
		{ word : w , id : tsw.util.uuid() , hidden : false }
	    ))
	    
	} 	
    } 
    
    let [words,setWords] = React.useState(to_filter) 
    
    React.useEffect( ()=> {
	AU.load_word_set(name).then( retrieved_words => setWords(retrieved_words) )
    },[]); 
    
    if(!words) return (<span>loading...</span>);
    

    // -- 
    let init_items = words ; 
    function on_change(items : any) {
	//store them in local storage for now 
	AU.set_word_set(name, items) 
    } 
    
    let child_props = { init_items , on_change } 
    
    return ( 
	<Box style={{borderStyle : 'solid', borderRadius : "10px", borderWidth : "1px" , padding : "4%"}}>
	    <Typography> 
		{`${name} word filter`}
	    </Typography>
	<EditableWordList {...child_props}/> 
	</Box>
    )
    
    
} 


function EditableWordList(props :any) {
    
    
    let {init_items, on_change } = props 
    
    let [items,setItems] = React.useState(init_items) 
    
    let add_items = function(items : any[]) {
	
	console.log("Adding items: ") ; console.log(items) 
	
	setItems( old_items => {
	    let new_items = fp.concat(old_items, items)
	    //propagate the change 
	    on_change(new_items) 
	    //and set 
	    return new_items 
	})
	
    }
    
    let delete_items = function(items : any[]) {
	
	console.log("Deleting items: ") ; console.log(items) 
	let words_to_delete = fp.map_get(items,'word')
	
	setItems( old_items => {
	    
	    let new_items = old_items.filter( i=> !words_to_delete.includes(i.word))
	    //propagate the change 
	    on_change(new_items) 
	    //and set 
	    return new_items 
	})
	
    }    
    
    let input_id = tsw.util.uuid() 
    let get_input_values = () => (document.getElementById(input_id) as any).value.split(",").filter(x=>!fp.is_empty(x)).map(x=>x.trim())
    
    return ( 
	
	<Box style={{
	    display : 'flex', 
	    flexDirection : 'column' , 
	}}>
	
	    <Box style={{
		display : 'flex', 
		flexDirection : 'row' , 
	    }}> 
	
		<Input id={input_id} /> 
		<Button onClick={
		    function(){
			console.log("Button clicked") 
			let vals = get_input_values()
			console.log(vals) 
			let items = vals.map( val => ({
			    word : val.trim() , 
			    id : tsw.util.uuid() , 
			}))
			//now we add the items
			add_items(items)
		    }
		}> + </Button>
	    </Box>
	    <Box>
		<List>
		    { 
			items.map( i => (
			    <React.Fragment key={i.id}>
				<EditableWordItem item={i} deleteItems={delete_items} />
				<Divider />	      	      
			    </React.Fragment>		    
			))
		    } 
		</List>
	    </Box> 
	</Box> 
    )
    
}


function EditableWordItem(props: any) {
    
    let  {item, deleteItems } = props ; 
    let {id , hidden, word   } = item 
    
    let deleteMe = function() {
	console.log("deleting") ; console.log(item) 
	deleteItems( [item]) 
    } 
    
    return (
	<Box style={{  
	    display : "flex" ,
	    flexDirection: "row" , 
	}} > 
	    <ListItem> 
		{item.word} 
	    </ListItem>
	    
	    <Box style={{flexGrow : 1}} /> 
	    
	    <IconButton size="small" edge="start" color="default" aria-label="menu" onClick={deleteMe } >
		<CloseIcon size="small" />
	    </IconButton>
	</Box> 
    )
}




/* 

   TODO: 
   
   Something is wrong with the filter -- 
   AND is not going away. (when delete) 
   Also when it refreshes it should RELOAD from local storage. But MAY not be happen? 
   
   Next put the filters in accordion 
   
   Thats IT for word cloud 
   
   THen 
   1) Histogram of word frequencies 
   2) Multiseries line plot of word usage over time (user can use the EditableList component 
      to select which words show up on the plot) 
   
   
   
   
 */




