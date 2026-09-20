export interface DataObject{
    [key:string]:string|number|boolean|DataObject|null|DataObject[]|string[];
}