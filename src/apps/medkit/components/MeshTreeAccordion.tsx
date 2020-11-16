import React from "react";
import { useState } from "react";
import * as util_components from "./utils";
import { useTheme } from "@material-ui/core/styles";
import { ObjectInspector, TableInspector } from "react-inspector";
import * as tsw from "tidyscripts_web";
import * as mui from "./list";

let {
  Container,
  Grid,
  Paper,
  AddCircleOutlineIcon,
  Link,
  TextField,
  FormControlLabel,
  Checkbox,
  FormControl,
  Box,
  FormHelperText,
  Switch,
  Breadcrumbs,
  Radio,
  Chip,
  FaceIcon,
  CircularProgress,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ExpandMoreIcon,
  Icon,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  DoneIcon,
  Avatar,
  Button,
  Visibility,
  VisibilityOff,
  Typography
} = mui;

let fp = tsw.util.common.fp;
let mesh = tsw.apis.mesh;
let wikidata = tsw.apis.wikidata;
let log = console.log;

/* 
The tree accordion is just like the regular exploratory accordion 
   however it also accepts a 'panel' property which it renders on every 
   treeNumber row  , right after the label but before the expandIcon
   
   The panel will get passed the properties: 
   treeNumber 
   label 
   
   The panel should be a consumer of the Tree Accordion Context 
   So that it can modify global state 
   
   
   Finaly, the TreeAccordion will also have a showcase Area at the beginning, 
   which is renders PRIOR to the accordion results. This component should also 
   consumer the Accordion state and should return a react component which is a
   pure function of current state. 
   
   Thus, by defining the panel component and the showcase component as consumers of the 
   TreeAccordion state which both produce react components, we specify an instance of the
   custom Tree Accordion component. 
   
   For the first case, we will have a panel component that consists of a PLUS and MINUS for each Tree Num 
   
   Will also need a choose all and clear all button 
   
   WHen clicked, these add either a { treeNum : ___ , type : ( "keep" || "remove" ) } 
   To the state.selected []  -- OR remove all instances 
   
   The showcase function() => will take the state and render 
   
   
*/

let initial_accordion_args = [
  {
    RecordName: "Anatomy",
    RecordUI: "",
    TreeNumber: "A",
    HasChildren: true
  },
  {
    RecordName: "Organisms",
    RecordUI: "",
    TreeNumber: "B",
    HasChildren: true
  },
  {
    RecordName: "Diseases",
    RecordUI: "",
    TreeNumber: "C",
    HasChildren: true
  },
  {
    RecordName: "Chemicals and Drugs",
    RecordUI: "",
    TreeNumber: "D",
    HasChildren: true
  },
  {
    RecordName:
      "Analytical, Diagnostic and Therapeutic Techniques, and Equipment",
    RecordUI: "",
    TreeNumber: "E",
    HasChildren: true
  },
  {
    RecordName: "Psychiatry and Psychology",
    RecordUI: "",
    TreeNumber: "F",
    HasChildren: true
  },
  {
    RecordName: "Phenomena and Processes",
    RecordUI: "",
    TreeNumber: "G",
    HasChildren: true
  },
  {
    RecordName: "Disciplines and Occupations",
    RecordUI: "",
    TreeNumber: "H",
    HasChildren: true
  },
  {
    RecordName: "Anthropology, Education, Sociology, and Social Phenomena",
    RecordUI: "",
    TreeNumber: "I",
    HasChildren: true
  },
  {
    RecordName: "Technology, Industry, and Agriculture",
    RecordUI: "",
    TreeNumber: "J",
    HasChildren: true
  },
  {
    RecordName: "Humanities",
    RecordUI: "",
    TreeNumber: "K",
    HasChildren: true
  },
  {
    RecordName: "Information Science",
    RecordUI: "",
    TreeNumber: "L",
    HasChildren: true
  },
  {
    RecordName: "Named Groups",
    RecordUI: "",
    TreeNumber: "M",
    HasChildren: true
  },
  {
    RecordName: "Health Care",
    RecordUI: "",
    TreeNumber: "N",
    HasChildren: true
  },
  {
    RecordName: "Publication Characteristics",
    RecordUI: "",
    TreeNumber: "V",
    HasChildren: true
  },
  {
    RecordName: "Geographicals",
    RecordUI: "",
    TreeNumber: "Z",
    HasChildren: true
  }
];

interface SubPanelArg {
  RecordName: string;
  RecordUI: string;
  TreeNumber: string;
  HasChildren: boolean;
  Children?: SubPanelArg[];
}

const MTContext = React.createContext<any>({ state: null, setState: null });

export default function Componenet(props: any) {
  props = props || {};

  let { state: MS_state, setState: set_MS_state } = props.parentState || {};

  const [state, setState] = React.useState<any>({
    allSelected: false,
    includedMap: {},
    excludedMap: {},
    expandedMap: {},
    allSelectedMap: {},
    childPanelMap: {}
  });

  React.useEffect(() => {
    //any time the state changes, we will update the parent component
    if (set_MS_state) {
      set_MS_state({
        ...MS_state,
        tools: { ...MS_state.tools, treeState: fp.clone(state) } //maybe ? 
      });
    }
  }, [state]);

  return (
    <MTContext.Provider value={{ state, setState }}>
      <Box style={{ display: "flex", flexDirection: "column" }}>
        <Status />
        <AccordionSubPanel />
      </Box>
    </MTContext.Provider>
  );
}

function Status() {
  const theme = useTheme();

  let paper_style = {
    padding: "2%",
    margin: "3px"
  };

  return (
    <MTContext.Consumer>
      {function({ state, setState }) {
        let all_includes = fp
          .values(state.includedMap)
          .filter((d: any) => d.state == true);
        let all_excludes = fp
          .values(state.excludedMap)
          .filter((d: any) => d.state == true);

        return (
          <Container>
            <Box
              style={{
                backgroundColor: theme.palette.background.paper,
                padding: "2%",
                borderRadius: "15px",
                marginBottom: "4px"
              }}
            >
              <Box
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-around"
                }}
              >
                <Box>
                  <Typography variant="h4">Including</Typography>
                  {all_includes.map(function(d: any) {
                    let { TreeNumber, RecordName, RecordUI } = d;

                    return (
                      <Paper key={TreeNumber} style={paper_style} elevation={4}>
                        <Typography>{`${RecordName}, [${TreeNumber}]`}</Typography>
                      </Paper>
                    );
                  })}
                </Box>

                <Box>
                  <Typography variant="h4">Excluding</Typography>
                  {all_excludes.map(function(d: any) {
                    let { TreeNumber, RecordName, RecordUI } = d;

                    return (
                      <Paper style={paper_style} elevation={4} key={TreeNumber}>
                        <Typography>{`${RecordName}, [${TreeNumber}]`}</Typography>
                      </Paper>
                    );
                  })}
                </Box>
              </Box>
            </Box>
          </Container>
        );
      }}
    </MTContext.Consumer>
  );
}

function AccordionSubPanel(props: any) {
  let { args } = props || {};

  const theme = useTheme();

  let t_list = args || initial_accordion_args;

  var [list, setList] = React.useState<any>(t_list);

  return (
    <MTContext.Consumer>
      {function({ state, setState }) {
        return (
          <Container>
            <div
              style={{
                backgroundColor: theme.palette.background.paper,
                padding: "2%",
                borderRadius: "15px"
              }}
            >
              <Box
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  marginLeft: "2%"
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={state.allSelectedMap[list[0].TreeNumber]}
                      color="primary"
                      onClick={function(e: any) {
                        e.stopPropagation();
                      }}
                      onChange={function(e: any) {
                        let val = e.target.checked;
                        log(val);

                        list.map(function(d: any) {
                          let { TreeNumber, RecordName, RecordUI } = d;

                          if (state.includedMap[d.TreeNumber]) {
                            state.includedMap[d.TreeNumber]["state"] = val;
                          } else {
                            state.includedMap[d.TreeNumber] = {
                              state: val,
                              TreeNumber,
                              RecordName,
                              RecordUI
                            };
                          }
                        });

                        state.allSelectedMap[list[0].TreeNumber] = val;

                        setState({
                          ...state,
                          includedMap: state.includedMap,
                          excludedMap: state.excludedMap,
                          allSelectedMap: state.allSelectedMap
                        });
                      }}
                    />
                  }
                  label="Include All"
                />
              </Box>

              {list.map(function(arg: SubPanelArg) {
                return <PanelItem key={arg.TreeNumber} arg={arg} />;
              })}
            </div>
          </Container>
        );
      }}
    </MTContext.Consumer>
  );
}

function PanelItem(props: any) {
  let { RecordName, RecordUI, TreeNumber, HasChildren } = props.arg;

  return (
    <MTContext.Consumer>
      {function({ state, setState }) {
        let include_checked =
          state.includedMap[TreeNumber] &&
          state.includedMap[TreeNumber]["state"];

        let exclude_checked =
          state.excludedMap[TreeNumber] &&
          state.excludedMap[TreeNumber]["state"];

        let child_panel = state.childPanelMap[TreeNumber];

        let isExpanded = state.expandedMap[TreeNumber];

        let set_include_checked = function(c: boolean) {
          state.includedMap[TreeNumber] = {
            state: c,
            TreeNumber,
            RecordName,
            RecordUI
          };
          setState({ ...state, includedMap: state.includedMap });
        };

        let set_exclude_checked = function(c: boolean) {
          state.excludedMap[TreeNumber] = {
            state: c,
            TreeNumber,
            RecordName,
            RecordUI
          };
          setState({ ...state, excludedMap: state.excludedMap });
        };

        let set_expanded = function(c: boolean) {
          state.expandedMap[TreeNumber] = c;
          setState({ ...state, expandedMap: state.expandedMap });
        };

        let set_child_panel = function(cp: any) {
          state.childPanelMap[TreeNumber] = cp;
          setState({ ...state, childPanelMap: state.childPanelMap });
        };

        return (
          <Accordion
            expanded={isExpanded || false}
            onChange={function(e: object, expanded: boolean) {
              if (expanded) {
                log("Expanded: " + TreeNumber);
                //when its expanded we have to get the children if it has children
                if (child_panel) {
                  log("Already have children");
                  set_expanded(true);
                } else {
                  //no Children -- so we have to search for the children and then add them to the appropraite part of the tree
                  if (HasChildren) {
                    log("Finding children");
                    //find the children now and then use the setChildPanel option with the result
                    set_expanded(true);
                    mesh.children_of_tree(TreeNumber).then((x: any) => {
                      set_child_panel(x);

                      log("Got data");
                    });
                  } else {
                    log("Not expanding because no children");
                  }
                }
              } else {
                //not expanded (closing)
                set_expanded(false);
              }
            }}
          >
            <AccordionSummary
              expandIcon={HasChildren ? <ExpandMoreIcon /> : null}
            >
              <Box style={{ display: "flex", flexDirection: "row" }}>
                <Box
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center"
                  }}
                >
                  <Typography display="block">{`${RecordName}`}</Typography>
                </Box>
                <span>&nbsp; </span>
                <Box
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center"
                  }}
                >
                  <span onClick={(event: any) => event.stopPropagation()}>
                    <Link
                      href={`https://meshb.nlm.nih.gov/record/ui?ui=${RecordUI}`}
                    >
                      {` [${TreeNumber}]`}
                    </Link>
                  </span>
                </Box>
                <span>&nbsp; </span>
                <span>&nbsp; </span>
                <span>&nbsp; </span>
                <span>&nbsp; </span>
                <Box
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center"
                  }}
                >
                  <Box
                    style={{
                      display: "flex",
                      flexDirection: "row"
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={include_checked || false}
                          size="small"
                          color="primary"
                          onClick={(event: any) => {
                            event.stopPropagation();
                            set_include_checked(event.target.checked);
                          }}
                        />
                      }
                      label="Include"
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={exclude_checked || false}
                          size="small"
                          color="secondary"
                          onClick={(event: any) => {
                            event.stopPropagation();
                            set_exclude_checked(event.target.checked);
                          }}
                        />
                      }
                      label="Exclude"
                    />
                  </Box>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {child_panel ? (
                <AccordionSubPanel args={child_panel} />
              ) : HasChildren ? (
                <CircularProgress color="secondary" />
              ) : null}
            </AccordionDetails>
          </Accordion>
        );
      }}
    </MTContext.Consumer>
  );
}
