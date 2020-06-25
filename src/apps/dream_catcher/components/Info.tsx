import React from 'react';

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

/* 

 INTRO FOR NEW USERS 
   
 */

function Info() {
    
    const [state, setState] = React.useState(
	{index: 0 } 
    ) 
    
    let onPageChange = function(e : object, page : number) { 
	console.log(`Page change to ${page}`) 
	setState( { index : page -1}) 
    } 
    
    let icons : any = { 
	"night" :  <NightsStayIcon /> , 
	"hotel" :  <HotelIcon />  , 
	"voice" :  <SettingsVoiceIcon />, 
	"book"  :  <ImportContactsIcon/>   , 
	"privacy" :  <LockIcon /> , 
	"journey" :  <LocalFloristIcon/> , 	
    } 
    
    let content : [string,string,string][] = [ 
	["DreamCatcher is a modern digital dream journal, built for explorers who are on the go.",
	 "night" , 
	 "DreamCatcher will help you to build a deeper relationship with your dreams. According to many resources, including Stephen LaBerge's book Exploring the World of Lucid Dreaming, keeping a dream journal is the first step to remembering more of your dreams and to having lucid dreams (dreams in which you know you are dreaming but do not wake up). DreamCatcher will help you do this in a effortless way!" ], 
	["DreamCatcher helps you record and review you dreams.",
	 "hotel", 
	 "You can use the menu button in the upper left to switch to the recording and reviewing modes."] , 
	["Record your dreams with your voice or by typing them.",
	 "voice", 
	 "After completing this intro, you can use the menu and select \"Record New Dreams\" to learn how to get started. There are many advantages to recording your dreams using your voice - you don't have to move, get out of bed, or even open your eyes to record and learn from your dreams!"] ,
	["Review your recorded dreams to learn valuable insights.",
	 "book", 
	 "Our dreams serve as a gateway to the vast wealth of meaningful information stored in our subconscious. Use the dream reviewer tab to gain deeper understanding of patterns and meaning from your dreams.", 
	] , 

	["Your dreams are for your eyes only.",
	 "privacy", 
	 "The dreams you record using DreamCatcher are stored directly inside your web browser safe and sound. However, because DreamCatcher utilizes Google speech recognition, if you choose to record your dreams by voice then the audio will be sent to Google's servers and transformed to text before it is sent back. Our recommendation is to utilize the voice feature unless one of your dreams contains extremely sensitive information. If you want to ensure that Google has absolutely no access to your dreams then please enter your dreams manually."] , 
	
	["Welcome to the start of a journey.",
	 "journey", 
	 "The seed of awakening has already been planted! The dreams you record will be the nutrients and water which nourish that seed and encourage it to grow into a beautiful plant. The time you spend reviewing your dreams is like the sun toward which the plant of awakening grows. For more resources, check out the manual from the main menu. Have fun, and sweet (lucid) dreams!"] , 
	

    ]
    
    
    let make_card = function(x : [string,string,string] ) {
	return (
	    <Card  > 
		<CardContent style={{textAlign :"center"}}>

		    <Typography variant="h5" component="h2">
			{x[0]}
		    </Typography>
		    <br/> 		    
		    { icons[x[1]]   }
		    <Typography  color="textSecondary" gutterBottom>
			<br/> 
			{x[2]} 
		    </Typography>
		</CardContent> 
		
		<CardActions style={{justifyContent : "center"}}>
		    
		    <Pagination count={content.length} onChange={onPageChange} />
		    
		    

		</CardActions>
	    </Card>
	)
    } 
    
    return (
	<Container style={{backgroundColor : "" , flexGrow : 1 , padding : "2%" }}> 
	    
	    <Box style={{height : "100%" , 
			 display : "flex", 
			 flexDirection : "column", 
			 justifyContent :"space-between" }} >
	    
	    { make_card(content[state.index]) } 
	    
	    </Box>

	</Container>
    );
}



export default Info ; 
