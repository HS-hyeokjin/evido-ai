import type { AxiosRequestConfig } from "axios";
import api from "./client";
import type { CommonResponse } from "../types/ApiResponse";
import { unwrapData, unwrapVoid } from "./response";

export async function getData<T>(
    url: string,
    config?: AxiosRequestConfig
): Promise<T> {
    const { data } = await api.get<CommonResponse<T>>(url, config);
    return unwrapData(data);
}

export async function postData<T, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig
): Promise<T> {
    const { data } = await api.post<CommonResponse<T>>(url, body, config);
    return unwrapData(data);
}

export async function patchData<T, B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig
): Promise<T> {
    const { data } = await api.patch<CommonResponse<T>>(url, body, config);
    return unwrapData(data);
}

export async function deleteData(
    url: string,
    config?: AxiosRequestConfig
): Promise<void> {
    const { data } = await api.delete<CommonResponse<null>>(url, config);
    unwrapVoid(data);
}

export async function postVoid<B = unknown>(
    url: string,
    body?: B,
    config?: AxiosRequestConfig
): Promise<void> {
    const { data } = await api.post<CommonResponse<null>>(url, body, config);
    unwrapVoid(data);
}