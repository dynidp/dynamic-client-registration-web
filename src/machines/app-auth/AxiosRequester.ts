import { Requestor } from "@openid/appauth";
 import axios, { AxiosResponse } from 'axios';

export class  AxiosRequestor extends Requestor  {


    public async xhr<T>(settings: JQueryAjaxSettings):Promise<T>{
        let instance = axios.create({
            timeout: 1000,
            headers: settings.headers
        });

        if(!settings.method)
            settings.method = "GET";

        switch(settings.method){
            case "GET":
                return await instance.get<T>(settings.url!).then((value : AxiosResponse<T>) => value.data);
            case "POST":
                return  await instance.post<T>(settings.url!, settings.data).then((value : AxiosResponse<T>) => value.data);
            case "PUT":
                return  await instance.put<T>(settings.url!, settings.data).then((value : AxiosResponse<T>) => value.data);
            case "DELETE":
                return  await instance.delete<T>(settings.url!).then((value : AxiosResponse<T>) => value.data);
        }
        throw 'Not Supported Method';
    }
}