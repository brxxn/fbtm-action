import { SearchType } from "../../types";
import jsRoutePathSearch from "./types/jsRouteBuilder";
import relayOperationSearchType from "./types/relayOperation";
import xControllerSearch from "./types/xcontroller";

const searchRegistry: SearchType[] = [
  jsRoutePathSearch,
  relayOperationSearchType,
  xControllerSearch
];

export default searchRegistry;