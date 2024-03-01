import { useState } from "react"
import axios from 'axios';
import Cookies from 'universal-cookie';
import { useGoogleLogin } from '@react-oauth/google';

import Button from "../../components/Button"
import Input from "../../components/Input"
import { useNavigate } from 'react-router-dom'
import Select from "../../components/Select"


const cookies = new Cookies(null);

const Form = ({
    isSignInPage = true,
}) => {

    const [data, setData] = useState({
        ...(!isSignInPage && {
            fullName: '',
            gender: 'Male',
            phoneNo: '',
        }),
        email: '',
        password: ''
    })

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        console.log('data :>> ', data);
        data.phoneNo = String(data.phoneNo);
        e.preventDefault()

        await axios.post(`http://localhost:3001/api/v1/user/${isSignInPage ? 'login' : 'signup'}`, data)
            .then((res) => {
                console.log(res.data);
                if (isSignInPage) {
                    console.log(res.data.data.token);
                    cookies.set('token', res?.data?.data?.token, {
                        path: '/'
                    });
                    navigate('/');
                }
                else {
                    console.log(res?.data?.message);
                }
            })
            .catch((err) => {
                console.log(err.response);
                if (err?.response?.status == 500) {
                    console.log(err?.response?.data?.message);
                }
                else if (err?.response?.status == 400) {
                    console.log(err?.response?.data?.message);
                }
            })
    }

    const googleLogin = useGoogleLogin({

        onSuccess: (tokenResponse) => {
            console.log(tokenResponse);
            axios.post('http://localhost:3001/api/v1/user/google-login', { 'code': tokenResponse.code })
                .then((response) => {
                    console.log(response.data);
                    console.log(response.data.data.token);
                    cookies.set('token', response?.data?.data?.token, {
                        path: '/'
                    });
                    navigate('/');
                })
                .catch((err) => {
                    console.log(err);
                })
        },
        flow: 'auth-code',
    });

    return (
        <div className="bg-light flex items-center justify-center">
            <div className=" bg-white w-[600px] h-[800px] shadow-lg rounded-lg flex flex-col justify-center items-center">
                <div className=" text-4xl font-extrabold">Welcome {isSignInPage && 'Back'}</div>
                <div className=" text-xl font-light mb-14">{isSignInPage ? 'Sign in to get explored' : 'Sign up to get started'}</div>
                <form className="flex flex-col items-center w-full" onSubmit={(e) => handleSubmit(e)}>
                    {!isSignInPage && <Input label="Full name" name="name" placeholder="Enter your full name" className="mb-6 w-[75%]" value={data.fullName} onChange={(e) => setData({ ...data, fullName: e.target.value })} />}
                    {!isSignInPage && <Input label="Phone Number" name="phoneNumber" placeholder="Enter your Phone Number" className="mb-6 w-[75%]" value={data.phoneNo} onChange={(e) => setData({ ...data, phoneNo: e.target.value })} type='number' />}
                    {!isSignInPage && <Select label="Select the gender" name="gender" className="mb-6 w-[75%]" onChange={(e) => setData({ ...data, gender: e.target.value })} />}
                    <Input label="Email address" type="email" name="email" placeholder="Enter your email" className="mb-6 w-[75%]" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
                    <Input label="Password" type="password" name="password" placeholder="Enter your Password" className="mb-14 w-[75%]" value={data.password} onChange={(e) => setData({ ...data, password: e.target.value })} />
                    <Button label={isSignInPage ? 'Sign in' : 'Sign up'} type='submit' className="w-[75%] mb-7" />
                    <button type="button" className={`text-white bg-primary hover:bg-primary focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center`} onClick={googleLogin} >Sign In with Google</button>
                </form>
                <div>{isSignInPage ? "Didn't have an account?" : "Alredy have an account?"} <span className=" text-primary cursor-pointer underline" onClick={() => navigate(`/users/${isSignInPage ? 'sign_up' : 'sign_in'}`)}>{isSignInPage ? 'Sign up' : 'Sign in'}</span></div>
            </div>
        </div>
    )
}

export default Form