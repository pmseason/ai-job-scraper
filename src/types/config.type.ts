
export type RoleType = "apm" | "internship";


export type SearchSource = {
    name: string;
    url: string;
}
export type SearchConfig = {
    scrapeFrom: SearchSource;
    roleType: RoleType;
    aiQuery: string;
}