import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import TagFacesIcon from '@material-ui/icons/TagFaces';

interface ChipData {
    key: number;
    label: string;
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
	root: {
	    display: 'flex',
	    justifyContent: 'center',
	    flexWrap: 'wrap',
	    listStyle: 'none',
	    padding: theme.spacing(0.5),
	    margin: 0,
	},
	chip: {
	    margin: theme.spacing(0.5),
	},
    }),
);

export default function ChipsArray(data : ChipData[], id : string) {
    
    let classes = useStyles() 
    
    if (data.length <= 0 ) {
	return null 
    }

    return (
	<Box id={id} component="ul" className={classes.root}>
	    {data.map((data) => {
		 let icon;

		 if (data.label === 'React') {
		     icon = <TagFacesIcon />;
		 }

		 return (
		     <li key={data.key}>
			 <Chip
			     icon={icon}
			     label={data.label}
			     className={classes.chip}
			 />
		     </li>
		 );
	    })}
	</Box>
    );
}
