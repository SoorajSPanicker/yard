import axios from 'axios';

export const commonrequest = async(method,url,body)=>{
    let reqConfig ={
        method,
        url,
        data:body,
        headers:{
            "content-Type":"application/json"
        }
    }
    return axios(reqConfig).then(
        (response)=>{
            return response
        }
    ).catch((err)=>{
        return err
    })

}