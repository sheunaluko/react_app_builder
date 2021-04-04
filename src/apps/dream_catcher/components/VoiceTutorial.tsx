import React, {useEffect}  from 'react';

import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Pagination from '@material-ui/lab/Pagination';

import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NightsStayIcon from '@material-ui/icons/NightsStay'; 

import HotelIcon from '@material-ui/icons/Hotel';
import ImportContactsIcon from '@material-ui/icons/ImportContacts';
import SettingsVoiceIcon from '@material-ui/icons/SettingsVoice';
import LockIcon from '@material-ui/icons/Lock';
import LocalFloristIcon from '@material-ui/icons/LocalFlorist';

import Inputter from "./Inputter" 

import * as VM from "./voice_module" 
import * as tsw from "tidyscripts_web" 


declare var window : any ; 

let VC = VM.VoiceChannel //get a hold of the voice channel, which will have incoming voice messages let 

let snd = tsw.util.sounds 

let snackbar = function( msg : string) { window.state.snackbarInfo(msg) } 

//create a tutorial channel and listen on it  
let TC = new tsw.util.common.channel.Channel() 
window.addEventListener('tutorial' , function(e:any){
 TC.write(e.detail)    
})

/* 

   Voice Tutorial 
   
 */

export default function Voice() {
    
    let [done, setDone] = React.useState(false)  
    
    return ( 
	done ?  <Voice2/>  : <Voice1 done={()=>{setDone(true);VM.stop();VM.speak("Great, let's continue")}}/> 
    )     
    
}


function Voice1(props : any) {
    
    let {done } = props 
    
    const [state, setState] = React.useState(
	{index: 0 } 
    ) 
    
    let onPageChange = function(e : object, page : number) { 
	//console.log(`Page change to ${page}`) 
	//setState( { index : page -1}) 
    } 
    
    let icons : any = { 
	"night" :  <NightsStayIcon /> , 
	"hotel" :  <HotelIcon />  , 
	"voice" :  <SettingsVoiceIcon />, 
    } 
    
    
    let responses = ["Are you there" , 
		     "What time is it" ,
		     "New dream" , 
		     "Record dream" ,  
		     "Finished" ,  
    ] 
    
    
    React.useEffect( ()=> {
	VC.read().then(text=> {
	    //got the text 
	    if (text == null) { 
		//the channel was flushed -- ignore it
		console.log("Got null in channel")
		return 
	    }
	    
	    let index = state.index 
	    if (text == responses[index].toLowerCase()) {
		
		
		switch (index) { 
		    case 0 : 
			VM.speak("yes")
			break 
			
		    case 1 : 
			VM.speak(VM.voice_time())
			break 
			
		} 

		
		if (index == content.length - 1) {
		    snd.success()
		    done() 
		    return 
		} 
		
		//success! 
		snd.proceed() 
		
		
		snackbar("Great! Let's continue...")
		setState({index : (state.index+1)})
	    } else { 
		snd.error()
		snackbar(`You said: ${text}. To proceed please say: ${responses[index]}`) 
		setState({index : (state.index) }) 
	    } 
	    
	}) 
	
    })
    
    
    let content : [string,string][] = [ 
	["Welcome to the voice tutorial",
	 "Click the headphone icon in the upper right hand corner to enable voice recognition. Make sure to ALLOW the use of your microphone if a dialog pops up. Then, ask the following: \"Are you there?\" Please say each word clearly and with a very slight pause before and after for optimal results. For the most optimal results, we recommend getting an external microphone to attach to your computer so the audio quality is fantastic and the mic can be placed right over your bed!" ], 
	
	["DreamCatcher will tell you the time",
	 "If it is early morning and you want to know how much longer you have to explore the dream world, you can ask DreamCatcher what time it is. Try asking, \"What time is it?\""] , 
	
	["Use your voice to record your dreams, even while you are still in bed",
	 "You can say \"New Dream\" to start recording a new dream. Try that now"] ,

	["You can also say \"Record Dream\"",
	 "Please try that now too. Recording by voice can be tricky at first, but once you get used to it you will become much more productive, I promise!"] ,
	
	["Great!",
	 "Wow, you have really got the hang of it already. You may have noticed that there is an \"error\" sound and a \"success\" sound. If you want, try saying \"error\" to hear the error sound, and say \"finished\" when you are ready to proceed to learn how to enter your dreams using your voice!"] ,
	

    ]
    
    
    let make_card = function(x : [string,string] ) {
	return (
	    <Card  > 
		<CardContent style={{textAlign :"center"}}>

		    <Typography variant="h4" component="h2">
			{x[0]}
		    </Typography>
		    <br/> 		    
		    { icons["voice"] }
		    <Typography  color="textSecondary" gutterBottom 
			style={{fontSize : '2vh'}}
		    >
			<br/> 
			{x[1]} 
		    </Typography>
		</CardContent> 
		
		<CardActions style={{justifyContent : "center"}}>
		    
		    <Pagination page={state.index+1} count={content.length} onChange={onPageChange} />
		    
		    

		</CardActions>
	    </Card>
	)
    } 
    
    
    return (
	<Container style={{backgroundColor : "" , flexGrow : 1 , padding : "2%" }}> 
	    
	    <Box style={{height : "100%" , 
			 display : "flex", 
			 flexDirection : "column", 
			 justifyContent :"flex-start" }} >
		
		{ make_card(content[state.index]) } 
		
	    </Box>

	</Container>
    );
}



function Voice2(done : any) {
    
    
    const [state, setState] = React.useState(
	{index: 0 } 
    ) 
    
    window.vt_state = state 
    
    
    React.useEffect( ()=> {
	TC.read().then(text=> {
	    //got the text 
	    let index = state.index 
	    switch (index) { 
		case 0 : 
		    if (text == "voice_clicked") {
			setState({index : state.index + 1 })
		    }else {
			snd.error()
			snackbar("Please make sure you select the Voice Entry Icon")
			setState({index : state.index})
		    }
		    break 
		    
		case 1 : 
		    if (text == "new dream") {
			setState({index : state.index + 1 }) 
		    } else { 
			snd.error() 
			snackbar("Please say \"new dream\" or \"record dream\"") 
			setState({index : state.index})			
		    } 
		    
		    break 

		case 2 : 
		    if (text == "description") {
			setState({index : state.index + 1 }) 
		    } else { 
			snd.error() 
			snackbar("Please say a random sentence for the dream description") 
			setState({index : state.index})			
		    } 
		    break 

		case 3 : 
		    if (text == "description") {
			setState({index : state.index + 1 }) 
		    } else { 
			snd.error() 
			snackbar("Please say a random sentence for the dream description")
			setState({index : state.index})
		    }
		    break 

		case 4 : 
		    if (text == "finished") {
			setState({index : state.index + 1 }) 
		    } else { 
			snd.error() 
			snackbar(`Please say \"finished\"`) 
			setState({index : state.index})			
		    } 
		    
		    break 

		case 5 : 
		    if (text == "new dream") {
			setState({index : state.index + 1 }) 
		    } else { 
			snd.error() 
			snackbar(`Please say \"new dream\" or \"record dream\"`) 
			setState({index : state.index})			
		    } 
		    
		    break 
		    

		case 6 : 
		    if (text == "title") {
			setState({index : state.index + 1 }) 
		    } else { 
			snd.error() 
			snackbar(`Please say \"add title second dream\"`) 
			setState({index : state.index})			
		    } 
		    
		    break 

		case 7 : 
		    if (text == "tag") {
			setState({index : state.index + 1 }) 
		    } else { 
			snd.error() 
			snackbar(`Please say \"add tag recorded while awake\"`) 
			setState({index : state.index})			
		    } 
		    
		    break 

		case 8 : 
		    if (text == "refresh") {
			setState({index : state.index + 1 }) 
		    } else { 
			snd.error() 
			snackbar(`Please say \"restart\"`) 
			setState({index : state.index})			
		    } 
		    
		    break 

		    
		case 9 : 
		    if (text == "abort") {
			setState({index : state.index + 1 }) 
		    } else { 
			snd.error() 
			snackbar(`Please say \"abort\" or \"exit\"`) 
			setState({index : state.index})			
		    } 
		    
		    break 
		    
		    
		default : 
		    //nothing 
		    snackbar("Congratulations!")
		    break 
		    
		    
		    
		    
		    
	    } 
	})
    })
    
    
    
    let content : string[] = [ 
	"When you select \"Record Dream\" from the menu on the left, you will be presented with the interface shown below. Click on the \"Enable Voice Entry\" icon below to proceed. Please follow these directions carefully and only do what I say. If you encounter errors you may need to refresh the page and restart.", 
	
	"Great! Now the microphone is active (see how the icon in the top right changed color?). You can click that icon to deactivate the microphone whenever you want, and you will no longer be recorded. Remember, at any time throughout the night you can say \"What time is it?\" or \"Are you there?\". Whenever you wake up and are ready to record your dream, say either \"Record dream\" or \"New dream\". Please practice recording a new dream now by saying \"Record dream\" or \"New dream\"", 

	"Cool! What you see below is the interface for recording a new dream! Normally, if you are using your voice you won't be looking at this - in fact your eyes may even be closed and you may still be lying in bed! Anyways, now that a dream is active, try filling in the dream description. To do this, simply start describing the dream, ONE SENTENCE at a time. You will notice a sound that indicates DreamCatcher heard you. Start by saying, \"This is my first dream\"" , 
	
	"Great! Notice how you have to pause between sentences in order for DreamCatcher to understand you. This is the best way to use DreamCatcher. Now say, \"It is the first of many to come\"..." , 
	
	"See how easy it is! OK, lets move on. It is enough to simply record the description and save the dream, after all, you may be feeling tired during the night and only have energy to do that. You can come back later and edit the title, description, and tags on your computer or on your mobile device while you are on the go. In fact, lets go ahead and save this dream -- dont worry... you can delete it later! By the way, you may be prompted to input a password if this is your first time saving a dream. This is to ensure that you and only you can read your dreams, even though they are stored on the cloud! Go ahead and say, \"Finished\", to save the dream" , 
	
	"Congratulations, you saved your first dream! Before I set you free to become a master dream explorer, let's finish this tutorial by learning how to enter the dream title and tags using your voice. Please start a new dream (do you remember how to do this?)", 
	
	"Great! Now, to add a dream title, simply say \"add title\" or \"new title\" or \"title\", followed by the dream title. For example, try saying \"add title second dream\"" , 
	
	"Wow... you must have done this before. Ok - to add a new tag to the dream, simply say \"add tag\" or \"new tag\", followed by the tag. For example, try saying \"add tag recorded during the day\"", 	
	
	"Great job! Please remember that at any time if you say a random sentence it will get added to the dream description. And you can pause from editing the description to add tags and change the title at any point. The last two things you need to know are quite simple. If you say \"new dream\" or \"record dream\" or \"refresh\" or \"restart\" while you are editing a dream, it will delete what you have and start over. Try saying one of those!", 

	"Awesome! The dream has been cleared. To exit from editing, you can say abort or exit. To complete the tutorial, try saying \"abort\" or \"exit\" now" , 
	
	"Contratulations on finishing this tuturial! You are now ready to use the voice mode to record your dreams. Before going to sleep, use the menu at the top left and select \"Record Dreams\". Then, select \"Enable Voice Entry\" and you are ready to go to bed! During the night or early morning when you wake up and remember your dream, try not to open your eyes or move! Instead, just say \"new dream\" or \"record dream\" to start recording your dream using what you have learned here. Don't worry about getting the wording exactly right, you can aways edit all parts of your dream later during the day, and this will even help you to increase your dream awareness. If you have not already, check out the \"Review Dreams\" tab in the menu on the left to see how you can edit your dreams! I recommend using your laptop to record your dreams, then accessing DreamCatcher on your smartphone so you can review and edit your dreams while you are on the go! As long as you log in using the same account, your dreams will be synced accross all of your devices. Remember that positioning an external microphone over your bed will lead to the best speech recognition results, but your laptop next to your bed will work as well! I hope that DreamCatcher brings you great enjoyment and satisfaction!"
	
    ]
    
    return (
	<Container style={{backgroundColor : "" , flexGrow : 1 , padding : "2%" }}> 
	
	<Box style={{height : "100%" , 
		     display : "flex", 
		     flexDirection : "column", 
		     justifyContent :"flex-start" }} >
	
	<Card  > 
	<CardContent style={{textAlign :"center"}}>
	<Typography  color="textSecondary" gutterBottom 
	style={{fontSize : '2vh'}}
			    >
				{content[state.index]} 
		    </Typography>
		</CardContent> 
	    </Card>		
	    

	    <Inputter /> 	    
	    </Box>
	    

	    

	</Container>
	    

	);
}










