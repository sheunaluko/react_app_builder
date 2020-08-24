# MeSH Search

The MeSH Search component allows the user to select a group of MeSH descriptor terms using a simple interface. 

## Search Tools

The "Search Tools" dropdown menu within the component allows for setting parameters for the search. 

### Tree Structure Filter 

The Tree Structure Filter allows the user to decide which MeSH sub trees to include or exclude. For example, if you want the search to only return results which exist in the "Anatomy" branch of the MeSH hierarchy, then you should check the box "include" next to "Anatomy". 

If you want to include all "Anatomy" terms but also exclude any terms within the category "Digestive System", then you can expand the "Anatomy" tab and check the "exclude" box next to "Digestive System".  

When you run the query, MedKit will generate the appropriate SPARQL query and send it to the MeSH SPARQL endpoint. 

For more information about the MeSH hierarchy and tree structures, please see this [NIH resource](https://www.nlm.nih.gov/mesh/intro_trees.html).

### Common Parameters 

| Limit |
| :--- |
| The maximum number of search results to return |

