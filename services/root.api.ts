import AxiosClient from "./axios.client";

const rootApi = AxiosClient(process.env.NEXT_PUBLIC_DEV_API_URL || 'http://localhost:3000');

export default rootApi;