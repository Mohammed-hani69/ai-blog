// Simple helper to read VITE_BACKEND_URL from env
const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL as string | undefined;
export const getBackendUrl = () => BACKEND_URL;
export const isBackendConfigured = () => !!BACKEND_URL;

export default { getBackendUrl, isBackendConfigured };
