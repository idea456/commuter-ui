import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_KOMMUTER_API_URL,
});

export const mapboxApi = axios.create({
    baseURL: "https://api.mapbox.com",
    headers: {
        Authorization: `Bearer ${import.meta.env.MAPBOX_ACCESS_TOKEN}`,
    },
});
