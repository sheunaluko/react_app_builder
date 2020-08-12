import React from 'react';
import clsx from 'clsx';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';


import Input from '@material-ui/core/Input';
import FilledInput from '@material-ui/core/FilledInput';
//import FormHelperText from '@material-ui/core/FormHelperText';
//import FormControl from '@material-ui/core/FormControl';


import { useTheme } from '@material-ui/core/styles';

import { ObjectInspector, TableInspector } from "react-inspector";


import * as tsw from "tidyscripts_web" 
import * as mui from "./list" 

let mesh = tsw.apis.mesh 
let wikidata = tsw.apis.wikidata 


let { Container, 
      Grid, 
      Paper, 
      AddCircleOutlineIcon,      
      Link, 
      TextField, 
      FormControl,
      FormHelperText, 
      Breadcrumbs, 
      Chip,
      FaceIcon, 
      IconButton, 
      Icon, 
      InputLabel,
      OutlinedInput, 
      InputAdornment, 
      DoneIcon,
      Avatar,
      Visibility, 
      VisibilityOff, 
      Typography } = mui 


let fp = tsw.util.common.fp 



const useStyles = makeStyles((theme: Theme) =>
    createStyles({
	root: {
	    display: 'flex',
	    flexWrap: 'wrap', 
	    margin : "2%" , 
	    padding : "2%" , 	    
	    backgroundColor : theme.palette.background.paper , 
	},
	margin: {
	    margin: theme.spacing(1),
	},
	withoutLabel: {
	    marginTop: theme.spacing(3),
	},
	textField: {
	    width: '25ch',
	},
    }),
);

interface State {
    text: string;
}



interface DTFOps { 
    delay : number, 
    handler : any , 
    label? : string , 
} 

export  function DebouncedTextField(ops : DTFOps) {
    
    let {delay, handler, label  } = ops 

    
    const theme = useTheme();     
    const classes = useStyles();
    
    /*
    const [values, setValues] = React.useState<State>({
	text: '',
    });
    */

    const [valueState, setValueState] = React.useState("")
    
    
    let log = console.log 

    var inputChanged = fp.make_debouncer(delay, async function(args : any[]) {
	log("Input changed!")  
	log(args[0]) 
	handler(args) 


    }) 
    
    const handleChange = (prop: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
	//setValues({ ...values, [prop]: event.target.value });

	inputChanged([event.target.value])
	//setValueState(event.target.value) 

	
    };


    return (
	<div style={{width : "98%" }}>

	    <FormControl fullWidth className={classes.margin} variant="outlined">
		<InputLabel htmlFor="outlined-adornment-amount">{label || "Input" }</InputLabel>
		<OutlinedInput
		id="outlined-adornment-amount"
		//value={valueState}
		onChange={handleChange('text')}
		startAdornment={<InputAdornment position="start">></InputAdornment>}
		labelWidth={60}
		/>
	    </FormControl>
	    
	</div>
    );
}


type TreeInfo = any[] 

export function ElevatedPaper(x :any) {
    
    
    const theme = useTheme() 
    
    var [elevation,setElevation] = React.useState(1)
    var [active,setActive] = React.useState(false)    
    var [treeInfo,setTreeInfo] = React.useState([])    
    var [wikidataInfo,setWikidataInfo] = React.useState<any>(null) 
    //var [color , setColor ] = React.useState(
    
    
    let activate = function() {
	setActive(true) 
	setElevation(10) 
	
    } 
    
    let unactivate = function(){
	setActive(false) 
	setElevation(0)
    } 
    
    React.useEffect( ()=> { 
	let did = mesh.get_descriptor_id(x.resource)
	mesh.mesh_ancestors(did).then( function(results :any){
	    setTreeInfo(results.map((r:any)=>r.path))
	}) 	
	
    }, [])
    
    React.useEffect( ()=> {
	let did = mesh.get_descriptor_id(x.resource)	
	wikidata.default_props_for_ids([did]).then((d:any)=> {
	    let k = fp.keys(d)[0]
	    setWikidataInfo(d[k])
	})
    }, [] ) 
    

    let unactiveStyle = { 
	padding  : "10px" , 
    } 

    let activeStyle = { 
	padding  : "10px" , 	
	backgroundColor : theme.palette.primary.main , 
    } 

    return ( 
	<Paper 
	    onMouseOver={()=> activate()}
	    onMouseOut={()=> unactivate() }		    
	    elevation={elevation}
	    style={false ? activeStyle : unactiveStyle }
	    
	> 
	    
	    <div style={{display: "flex" ,
			 flexDirection : "row"
	    }} > 
		
	    <Typography style={{flexGrow: 1}} variant="h6" >
		{x.label}
	    </Typography>
	    
	    <IconButton onClick={ ()=> x.cb({treeInfo, 
					label : x.label, 
					resource : x.resource, 
					wikidataInfo}) } >
		<AddCircleOutlineIcon /> 
	    </IconButton>	    
	    
	    </div>
	    
	    <br /> 

	    <Link href={x.resource} > 
		{x.resource} 
	    </Link>		
	    
	    { 
		treeInfo.map( (i:any)=> TreeRow(i) ) 
	    } 
	    
	    <br /> 
	    
	    {
		wikidataInfo ? WikidataDisplay(wikidataInfo) : null 
	    } 

	</Paper>
    ) 
    
    
}



function WikidataDisplay(info : any ) {
    return ( 
	<ObjectInspector data={info} /> 
    ) 
} 

//export function 

const gridStyles = makeStyles((theme: Theme) =>
    createStyles({
	root: {
	    flexGrow: 1,
	    padding : "1%" , 
	},
	paper: {
	    padding: theme.spacing(2),
	    textAlign: 'center',
	    color: theme.palette.text.secondary,
	},
    }),
);

interface OAOps { 
    options  : any[] , 
    renderer : any , 
    cb : any 
} 



export function OptionsArea(ops : OAOps ) { 
    
    let {options, renderer, cb }  =  ops 
    
    const classes = gridStyles();
    return (
	<div className={classes.root}>
	    <Grid container spacing={3}>
		
		
		{ 
		    options.map(function(option :any ){ 
			return ( 
			    <Grid key={option.label} item xs={12} >
				{renderer({...option , cb})}
			    </Grid>
			) 
			
		    })
		} 

		
	    </Grid>
	</div>
    );
}


export function TreeRow(ss : string[]){
    return ( 
	<Breadcrumbs key={ss.join("")} maxItems={4} aria-label="breadcrumb">
	    {
		ss.map((s:any)=> 
		    <Link  key={s} color="inherit" href="#" >
			{s}
		    </Link>
		)
	    }
	</Breadcrumbs>	
    ) 
} 



const chipStyles = makeStyles((theme: Theme) =>
    createStyles({
	root: {
	    display: 'flex',
	    justifyContent: 'center',
	    flexWrap: 'wrap',
	    '& > *': {
		margin: theme.spacing(0.5),
	    },
	},
    }),
);


export function SelectedEntities(ops : any) {
    let {selectedState,  setSelectedState} = ops 
    
    const classes = useStyles();

    const handleDelete = (x:any) => {
	console.info('You clicked the delete icon.');
	selectedState.selected.filter((y:any)=> y.resource !=x.resource)
	setSelectedState({...selectedState, selected : selectedState.selected}) 
    };

    const handleClick = () => {
	console.info('You clicked the Chip.');
    };

    if ( selectedState.selected.length < 1 ) { 
	return null 
    } else { 
	
	//console.log("!")
	//console.log(selected) 
	
	return (
	    <div className={classes.root}>

		{ 
		    selectedState.selected.map( function(x : any){
			return (
			    <Chip key={x.resource} label={x.label} onDelete={()=>handleDelete(x)} color="primary" variant="outlined" />
			) 
		    } ) 
		} 
		

	    </div> 
	)
    }
}




