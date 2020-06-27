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

export default function ChipsArray(data : ChipData[], id : string, setState : any) {
    
    
    let classes = useStyles() 

    const handleDelete = (chipToDelete: ChipData) => () => {
	let new_chips = data.filter((chip) => chip.key !== chipToDelete.key)
	setState({chip_data : new_chips}) 
    };

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
			     onDelete={data.label === 'React' ? undefined : handleDelete(data)}
			     className={classes.chip}
			 />
		     </li>
		 );
	    })}
	</Box>
    );
}
