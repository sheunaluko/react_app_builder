import React from 'react';

import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import CardContent from '@material-ui/core/CardContent';
import Paper from '@material-ui/core/Paper';
import AppBar from '@material-ui/core/AppBar';


import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

import TextField from '@material-ui/core/TextField';
import LinearProgress  from '@material-ui/core/LinearProgress';


import SearchIcon from '@material-ui/icons/Search';
import InputBase from '@material-ui/core/InputBase';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab'; 

import ReviewCard from "./ReviewerCard" 



import { Theme, ThemeProvider, useTheme, createMuiTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { Breakpoint } from '@material-ui/core/styles/createBreakpoints'; 

import CircularProgress, { CircularProgressProps } from '@material-ui/core/CircularProgress';

import * as fb from "./Firebase" 

import * as smgr from "../state_manager" 

import * as  tys from 'tidyscripts_web' 
import * as DS from "../DreamSchema" 

//import "./Reviewer.css" 

declare var window : any ; 

let fp = tys.util.common.fp 



type BreakpointOrNull = Breakpoint | null;

/**
 * FROM MATERIAL UI DOCS    
 * Be careful using this hook. It only works because the number of
 * breakpoints in theme is static. It will break once you change the number of
 * breakpoints. See https://reactjs.org/docs/hooks-rules.html#only-call-hooks-at-the-top-level
 */
function useWidth() {
    const theme: Theme = useTheme();
    const keys: Breakpoint[] = [...theme.breakpoints.keys].reverse();
    return (
	keys.reduce((output: BreakpointOrNull, key: Breakpoint) => {
	    // eslint-disable-next-line react-hooks/rules-of-hooks
	    const matches = useMediaQuery(theme.breakpoints.up(key));
	    return !output && matches ? key : output;
	}, null) || 'xs'
    );
}


function CircularProgressWithLabel(props: CircularProgressProps) {
    return (
	<Box position="relative" display="inline-flex">
	    <CircularProgress {...props} />
	    <Box
		top={0}
		left={0}
		bottom={0}
		right={0}
		position="absolute"
		display="flex"
		alignItems="center"
		justifyContent="center"
	    >
		<Typography variant="caption" component="div" color="textSecondary">{props.value}</Typography>
	    </Box>
	</Box>
    );
}

// 


/* 

   TODO 
   BASIC review 
   
   decryption with spinner while occuring 
   panel for quick scrolling through dreams,  (right hand side) 
   dream_mini_card 
   
   when click on dream - shows up in card , can toggle to edit and save or jsut view 
   
   Want to be able to search through dreams 
   
   And to see an analytics like dashboard 
   
 */ 

var count = 1 ; let counter = () => count++ ; 

function Reviewer() {
    
    let [selectedDream, setSelectedDream] = React.useState("") 
    
    const [drawer, setDrawer] = React.useState({
	open : false  
    });
    
    let [loading , setLoading] = React.useState(true) 
    let [loadingMsg, setLoadingMsg] = React.useState("Retrieving Your Dreams")
    
    let [dreamRevNum, setDreamRevNum] = React.useState(0) 
    
    
    
    let init_dreams : DS.DreamObject[] = [] 
    let [userDecryptedDreams, setUserDecryptedDreams] = React.useState(init_dreams) 
    
    
    let init_sidebar : DS.DreamObject[] = [] 
    let [dreamsInSidebar , setDreamsInSidebar] = React.useState(init_sidebar)
    
    let [mode , setMode] = React.useState("view")  //VIEW vs edit 
    
    smgr.register("userDecryptedDreams", userDecryptedDreams) 
    smgr.register("setUserDecryptedDreams" , setUserDecryptedDreams) 
    smgr.register("dreamLoadingMsg" , setLoadingMsg) 
    smgr.register("refreshDreamUI", function(){
	setDreamRevNum(++dreamRevNum)
    })
    smgr.register("dreamRevNum" , dreamRevNum) 
    
    
    const width = useWidth() 
    
    
    React.useEffect( function(){
	console.log("Rendered with width: " + width) 
    } , [width]) 
    

    
    
    React.useEffect( function(){
	//watches for changes on the dreamRevNum and recalculates
	//the dreams 
	
	if (false) { 
	    let drms = JSON.parse(localStorage['tmpDreams'])
	    setUserDecryptedDreams(drms)
	    setDreamsInSidebar(drms)
	    setLoading(false)  
	    return 
	} 

	console.log("Requesting user dreams") 
	fb.get_decrypted_dreams().then((result : any)=> { 
	    let {error , value } = result 
	    if ( error ) {
		window.state.snackbarInfo(error) 
		setLoading(false)
		return 
	    } else { 

		let will_be_sorted = fp.values(value) 
		will_be_sorted.sort(function(a,b){
		    let num =  (new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
		    return num 

		});
		//-recomputes the dreams 
		setUserDecryptedDreams(will_be_sorted) 
		//-should attempt to keep sidebar state, but if a dream was deleted that is 
		//-in sidebar then it should be removed right ?
				     //-similarly if the selected UUID refers to non existent dream it should be changed
		if (dreamsInSidebar.length > 0) {
		    var deleted = false 
		    let new_sidebar_dreams = fp.remove_empty(fp.map(dreamsInSidebar, (d: DS.DreamObject)=>{
			let uuid = d.uuid 
			let tmp_i = fp.map_get(will_be_sorted,"uuid").indexOf(uuid) 
			if (tmp_i > -1) {
			    //sidebar dreams is still there but may be updated 
			    return will_be_sorted[tmp_i]
			}else {
			    //no longer there 
			    //will update the selected index 
			    if (selectedDream == uuid) {
				console.log("Selected dream was deleted!")
				deleted = true 
			    } else { 
				console.log("Dream was deleted but is not currently selected")
			    }
			    return null
			}
		    }))
		    
		    if (new_sidebar_dreams.length > 0 ) {
			if (deleted ) { 
			    setSelectedDream(new_sidebar_dreams[0].uuid)
			    setMode("view")
			} 
			setDreamsInSidebar(new_sidebar_dreams) 
		    } else { 
			setDreamsInSidebar( will_be_sorted ) 
		    } 
		    
		    //IN THIS CASE, IN WHICH there were ALREADY dreams in the sidebar, we return immediately 
		    return 
		}
		else { 
		    setDreamsInSidebar( will_be_sorted ) 
		}
		
		setLoading(false)		
		window.state.snackbarInfo("Succesfully Retrieved Your dreams") 		
		setSelectedDream(will_be_sorted[0].uuid)
	    }
	})

    }, [dreamRevNum])

    
    React.useEffect( function() {

    },[drawer.open]) 

    

    var textFieldValue = "" 
    
    let onTextChange = (e: any) => { 
	//console.log(e.target.value) 
	textFieldValue = e.target.value 
	if (textFieldValue == "") { 
	    setDreamsInSidebar(userDecryptedDreams) 
	} 
    } 
    



    let handleSearch = function() {
	
	if (textFieldValue == "") { 
	    setDreamsInSidebar(userDecryptedDreams) 
	    return 
	} 
	
	let to_search = new RegExp(textFieldValue ,"i")
	console.log("Searching for "  + to_search) 
	//
	let results = userDecryptedDreams.filter( (d:DS.DreamObject)=> {
	    
	    if (d.title && d.title.match(to_search) ) {
		return true 
	    } 
	    
	    if (d.description && d.description.match(to_search) ) {
		return true 
	    } 
	    
	    if (d.tags && d.tags.join(" ").match(to_search) ) {
		return true 
	    } 
	    
	    return false 
	}) 
	
	//store the results for displaying 
	setDreamsInSidebar(results) 
	
    } 
  
    
    
    var box_widths :any = { 
	'xs' : "60vw"  , 
	'sm' : "50vw"  , 
	'md' : "30vw"  , 
	'lg' : "20vw"  , 	
    } 
    
    let drawer_w = box_widths[width]
    
    
    let LoadingStatus = function() {
	if (loading) {
	    return ( 
		<Grid container style={{marginTop : "10%"}}  > 
		    <Grid item xs={4} /> 
		    <Grid item xs={4}  style={{alignItems : "center", textAlign : "center"}} > 
			<Box> 
			    <CircularProgressWithLabel size="20vw"  />
			    <Typography style={{color : "white" , marginTop : "3%" }} > 
				{loadingMsg}
			    </Typography>
			    
			</Box>
		    </Grid>
		    <Grid item xs={4} /> 
		</Grid > 
	    ) 
	}  else { 
	    return null 
	} 
	
    } 
    
    
    let current_dream_index = fp.map_get(dreamsInSidebar,"uuid").indexOf(selectedDream)
    console.log("Current dream index in sidebar is: " + current_dream_index) 
    
    let next = function(){
	let new_index = (current_dream_index +1 ) % dreamsInSidebar.length
	setSelectedDream(dreamsInSidebar[new_index].uuid)
    } 
    
    let prev = function(){
	let new_index = (current_dream_index -1 + dreamsInSidebar.length ) % dreamsInSidebar.length
	setSelectedDream(dreamsInSidebar[new_index].uuid)
    }
    

    
    let ReviewingCard = function() {
	if (selectedDream != "") { 
	    let props = { 
		mode, 
		setMode, 
		uuid : selectedDream, 
		userDecryptedDreams ,
		next,
		prev, 
		setUserDecryptedDreams , 
		dreamsInSidebar, 
		setDreamsInSidebar, 
		width , 
	    } 
	    return <ReviewCard {...props} /> 
	} else { 
	    return null 
	} 
    } 
    
    return (
	<div id="dream_reviewer" style={{height : "100%"}} >
	    <Box style={{display : "flex" , 
			 alignItems : "center" , 
			 flexDirection :"column" , 
			 paddingTop : "3%" , 
			 height : "100%"}}> 
		
		<Grid container > 
		    <Grid item xs={4} >
		    </Grid>
		    <Grid item xs={4} style={{alignItems : "center", textAlign : "center"}} > 
			
			<Typography variant="h6" style={{ color : "white"  }}> 
			    Review Your Dreams  
			</Typography>
		    </Grid>
		    <Grid item xs={4} style={{display : "flex" , justifyContent : "center", alignItems : "center"}} >
			<Button variant="contained" color="primary" onClick={()=> setDrawer({open :true})}> 
			    Search
			</Button>
		    </Grid>
		    
		    
		</Grid>
		
		<ReviewingCard /> 
		<LoadingStatus /> 

		
	    </Box>
	    
	    
	    <div >
		<Drawer anchor='right' open={drawer.open} onClose={()=>setDrawer({open: false })}>
		    <div 
			style={{width : drawer_w || '20vw' , marginTop : "5px"}}
			role="presentation"

		    >
			<div style={{display :"flex" , 
				     flexDirection : "row" , 
				     alignItems : "center" , 
				     width : "100%" , 
				     marginLeft : "1%", 
				     marginRight : "1%", 				     
				     justifyContent : "center"}} >

			    <TextField 
			    style={{width : "80%"}} 
			    id="searchField" 
			        onChange={onTextChange}
			    label="Search..." />
			    <IconButton onClick={()=>handleSearch()}>
				<SearchIcon />			    
			    </IconButton>
			</div>
			
			<List > 
			    { dreamsInSidebar.map( (d:any) => {
				  return (
				      <ListItem 
					  button
					  key={d.uuid} 
					  style={{display:"flex" ,
						  justifyContent : "center",
						  flexDirection : "row" , 
					  }}
					  onClick={ ()=>{
					      setSelectedDream(d.uuid);
					      setDrawer({open:false})
					      console.log(d.uuid)
					  }}>
					  <DreamMiniView  {...d} /> 
				      </ListItem>				      
				  )
			    })
			    } 
			</List>
		    </div>
		</Drawer>
	    </div>

	</div>
    );
}


export default Reviewer ; 


let textMiniView = { 
    title : "Test Dream" , 
    description : "This is a cool new dream which ia am writing \n it is pretty cool huh! This is a cool new dream which ia am writing \n it is pretty cool huh! This is a cool new dream which ia am writing \n it is pretty cool huh!" , 
    datetime : '2020-06-27T15:29:44.947Z' , 
    uuid : "asdf;lj;sadlf" , 
} 


function DreamMiniView(props : any){ 
    let {title,description, datetime, uuid,sz} = props 
    let title_size = "20px" 
    let description_size = "20px" 
    let date_size = "20px" 
    
    var box_widths :any = { 
	'xs' : "50%"  , 'sm' : "30%" , 'md' : "30%" , 'lg' : "20%"  
    } 
    
    let box_width = "100%"  // box_widths[(sz as string)]  || '30%' 
    
    
    return ( 
	<Box id={uuid} key={uuid} style={{display :"inline-block" , 
					  //width : box_width , 
					  marginLeft : "1%" , 
					  marginRight : "1%" , 
					  whiteSpace : "normal" , 
					  height : "100%", 
	}}
	     onClick={()=>console.log("Clicked dream: " + uuid)}
	> 
	    <Card style={{height :"100%"}} variant="outlined" > 
		<Box style={{textAlign : "center" , 
			     height : "100%" , 
			     display : "flex" , 
			     padding : "1%", 
			     flexDirection : "column" ,
			     justifyContent :"space-around" }}> 
		    
		    <Typography variant="subtitle1"   >
			{ title ? title : "Untitled" } 
		    </Typography>
		    <Typography color="textSecondary" >
			{fp.nchars(description || "No description was saved!", 50) + "..."} 
		    </Typography> 
		    <Typography > 
			{new Date(datetime || "1930-06-28T00:00:00.000Z").toDateString()} 
		    </Typography>
		</Box>
	    </Card>
	</Box>

	
    ) 
} 


