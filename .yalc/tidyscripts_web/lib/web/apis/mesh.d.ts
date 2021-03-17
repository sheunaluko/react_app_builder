interface MeshLookupOps {
    label: string;
    match: string;
    limit?: number;
}
export declare function mesh_lookup(ops: MeshLookupOps): Promise<any>;
export declare function mesh_contains(term: string): Promise<any>;
export declare function mesh_exact(term: string): Promise<any>;
export declare function mesh_qualifiers(id: string): Promise<any>;
export declare function mesh_search2(s: string): Promise<any>;
interface SparqlTemplateOps {
    template: string;
    replacers: string[][];
    url_base: string;
    url_params: any;
    param_key?: string;
}
export declare function sparql_template_fn(ops: SparqlTemplateOps): Promise<any>;
export declare function descendants_of_tree_code(args: any): Promise<any>;
export declare function all_sparql_results(fn: any, args: any): Promise<any[]>;
export declare function all_descendants_of_tree_code(args: any): Promise<any[]>;
export declare function all_mesh_diseases(): Promise<any[]>;
export declare function all_mesh_conditions_signs_symptoms(): Promise<any[]>;
interface MCSearch {
    search_term: string;
    limit: number;
}
export declare function mesh_custom_search(ops: MCSearch): Promise<any>;
export declare function mesh_ancestors(did: string): Promise<any>;
export declare function get_tree_num(url: string): string;
export declare function get_descriptor_id(url: string): string;
export declare function children_of_tree(t: string): Promise<any>;
export {};
