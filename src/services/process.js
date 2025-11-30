import { getJson } from "./api";

export const getProcess = () => getJson("/api/process");
