# Problem List

The problem list component facilitates entry, storage, and analysis of a patient's relevant medical problems.

Structurally, the component consists of a "Display" tab \(renders information about each problem\) and an "Edit" tab \(allows adding diagnoses to the list\). The "Edit" tab itself utilizes the [MeSH Search component](https://alukosheun.gitbook.io/medkit/documentation/components/mesh-search), which enables quick user search and entry of a list of [MeSH Descriptor Terms](https://www.nlm.nih.gov/mesh/intro_record_types.html). 

## Views

MedKit is all about leveraging existing data to produce quick and valuable insight at the point of care. Because of this, MedKit's underlying software architecture must be optimized for versatility and scalability. One way that we achieve this is with the use of the "View" abstraction. 

A "View" can either be "over" an individual MeSH Descriptor or a group of MeSH Descriptors. 

#### Views over individual MeSH Descriptors 

A view associated with an individual descriptor takes a dictionary as input and returns a React component. Its input argument must at least have the key: "mesh\_id". The view rendering function can attempt to access any other fields of the object and will use them in place of making a corresponding network request for the same information. This allows for caching of information associated with MeSH Descriptor IDs. However, the calling function must provide the cached values in order to prevent the network request from occurring.

#### Views over a group of MeSH Descriptors

Views associated with a group of MeSH Descriptors also take a dictionary as input and return a React component. However, in their case the required field is "descriptors", which refers to an array of "descriptor" objects which contain the "mesh\_id" subfield as well as any other associated cached data. These views will analyze and compare among the various available descriptors and return a component that displays comparative or summative information about the group of descriptors. For example:

* A view dedicated to showing if there are any OVERLAPPING medications which treat the conditions listed 
* A view that renders a bar graph of the risk factors by count \(color coded by the descriptor from which they originate\) 

#### Why is the "View" abstraction useful? 

If you have read this far then you may be wondering how useful this abstraction is. The Problem List component will keep track of a list of "View" components. When the user activates a specific problem then a Grid is rendered that contains a list of "View" components relevant for that descriptor. Specifically, the code should look something like this: 

```text
let DescriptorViewArea = function(descriptorInfo,registeredViews) {

    return ( 
        <Grid> 
            {
               registeredViews.map( (v) => {
                    return v(descriptorInfo)
               }) 
            } 
        </Grid> 
    )
}     
```

It would be really cool if in the future there was a library of "Views" which you could browse and incorporate into your problem list. Then, people all over the world could contribute to the interface, and yet you could customize your own "profile" of default views. 

#### Disclaimer 

Partly, this documentation serve as a specification or reference as I am building the application. Everything is subject to change as MedKit is in very early stages! 





