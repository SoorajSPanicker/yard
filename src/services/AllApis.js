import {commonrequest} from './commonrequest'
import  {base_url}  from './base_url'


// mail id exist

export const mailIdExist = async(body,header)=>{
    return await commonrequest("POST",`${base_url}/installation`,body,header)
 }

// register user
export const registerUser = async(body,header)=>{
    return await commonrequest("POST",`${base_url}/installation`,body,header)
 }
