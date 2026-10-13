// Preserve browser data from the previous brand when using the same origin.
export function readStoredValue(storage,key,legacyKey){
 const current=storage.getItem(key);
 if(current!==null)return current;
 const previous=legacyKey?storage.getItem(legacyKey):null;
 if(previous!==null){try{storage.setItem(key,previous)}catch{}}
 return previous;
}
