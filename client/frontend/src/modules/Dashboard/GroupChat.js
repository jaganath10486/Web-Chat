import React, { useState } from "react";
import axios from "axios";
import Cookies from "universal-cookie";
const cookies = new Cookies();

const style = {
    "display": "inline-block",
    "vertical-align": "middle",
    "font-size": "12px",
    "font-weight": 600,
    'color' : "white",
    "padding-top": "5px",
    "padding-bottom": "5px",
    cursor: "pointer",
    "border-radius": "10px",
    "background": "purple"
}

function GroupChat({
    setCreateChat,
    emitGroupCreateEvent
}) {
    console.log("GroupChat");
    const [chatName, setChatName] = useState('');
    const [searchedUser, setSearchedUsers] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [resUsers, setResUsers] = useState([]);

    const style = {
        display: "inline-block",
        " vertical-align": "middle",
        "text-transform": "uppercase",
        cursor: "pointer",
        "white-space": "nowrap",
    }

    const fetchUsers = async (e) => {
        setSearchedUsers(e.target.value);
        const users = await axios.get(`http://localhost:3001/api/v1/user/search-user?search=${e.target.value}`, {
            headers: {
                'Authorization': `Bearer ${cookies.get('token')}`
            }
        })
            .then((res) => {
                console.log(res.data.data);
                setResUsers(res.data.data)
            })
            .catch((err) => {
                console.error(err);
                setResUsers([]);
            })
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        if (selectedUsers.length == 0 || !chatName) {
            console.log("Add Users, or Give Chat Name");
            return;
        }
        let userIds = [];
        selectedUsers.forEach((user) => {
            userIds.push(user._id)
        })
        await axios.post('http://localhost:3001/api/v1/conversation/create-group', { name: chatName, members: userIds }, {
            headers: {
                'Authorization': `Bearer ${cookies.get('token')}`
            }
        })
            .then((res) => {
                console.log(res.data);
                // console.log();
                setCreateChat(false);
                emitGroupCreateEvent(res.data.data);
            })
            .catch((err) => {
                console.log("Not Able to Create Group Try after some time");
            })

    }

    const removeSelectedUser = (id) => {
        const updatedUsers = selectedUsers.filter((item) => item._id !== id);
        setSelectedUsers(updatedUsers);
    }

    const SelectedUserHandler = async (user) => {
        console.log(user);
        if (selectedUsers.some((item => item._id == user._id))) {
            console.log("User Already Selected");
        }
        else {
            setSelectedUsers((prev) => [...prev, user]);
        }
    }

    return <>
        <>
            <div
                className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
            >
                <div className="relative  my-6 mx-auto max-w-3xl" style={{minWidth : '400px'}}>
                    <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                        {/*header*/}
                        <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                            <h3 className="text-3xl font-semibold">
                                Create Group
                            </h3>
                            <button
                                className="p-1 ml-auto bg-transparent border-0 text-black opacity-80 float-right text-3xl leading-none font-bold outline-none focus:outline-none"
                                onClick={() => setCreateChat(false)}
                            >
                                <span className="bg-transparent text-black opacity-80 h-6 w-6 text-2xl block outline-none focus:outline-none">
                                    X
                                </span>
                            </button>
                        </div>
                        {/*body*/}
                        <div className="relative p-6 flex-auto">
                            <form class="space-y-4" onSubmit={submitHandler}>
                                <div>
                                    <input type="text" name="email" id="email" class="bg-gray-50 border border-gray-300 text-sm rounded-lg  block w-full p-2.5 dark:placeholder-gray-400 " placeholder="Group Name" required value={chatName} onChange={(e) => { setChatName(e.target.value) }} />
                                </div>
                                <div>
                                    <input type="text" id="users" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg  block w-full p-2.5 dark:placeholder-gray-400 " placeholder="Add Users" value={searchedUser} onChange={fetchUsers} />
                                </div>
                                <div class="flex-auto justify-between mt-5">
                                    {selectedUsers.map(item => (
                                        <div key={item._id} className="flex justify-between" style={{ cursor: 'pointer', border : '1px solid', background : 'purple', color : 'white', padding : '5px', 'alignItems' : 'center', verticalAlign : 'baseline' }}>
                                            <span className="pr-3 pl-1">{item.email}</span>
                                            <span onClick={() => { removeSelectedUser(item._id) }}><svg class="w-3 h-3" style={{ 'flex justify-between': 'baseline' }} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" /> </svg></span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex-auto py-3">
                                    {
                                        searchedUser ? (resUsers.length > 0 ? resUsers.map((item) => {
                                            return (
                                                <div className='flex items-center py-3 ' key={item?._id}>
                                                    <div className='cursor-pointer flex items-center' onClick={() => { SelectedUserHandler(item) }}>
                                                        <div><img src={item?.profilePic} className="w-[60px] h-[60px] rounded-full p-[2px] border border-primary" /></div>
                                                        <div className='ml-6'>
                                                            <h3 className='text-sm font-semibold ' >{item?.username}</h3>
                                                            <h3 className='text-sm font-semibold'>{item?.email}</h3>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }) : <div className='text-center text-lg  mt-2'>No Users Found</div>) : <></>
                                    }
                                </div>
                                <button type="submit" class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Create Group</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
    </>
}

export default React.memo(GroupChat);