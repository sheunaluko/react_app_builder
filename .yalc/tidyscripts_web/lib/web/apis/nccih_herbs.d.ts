export declare function get_herbs(): Promise<{
    name: any;
    link: string;
}[]>;
export declare function get_info_for_herb(url: string): Promise<any>;
export declare function get_and_cache_herb_data(lsk: string): Promise<any[]>;
export declare function get_all_herb_data(): Promise<any>;
