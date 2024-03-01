import React, { useState } from "react";
import axios from "axios";
import Cookies from "universal-cookie";

const cookies = new Cookies();

function GroupProfileModal({
    setGroupModal,
    group,
    fetchAgain,
    userId,
    setMessages
}) {
    const [renameGroup, setRenameGroup] = useState(false);
    const [groupName, setGroupName] = useState(group.chatName);
    const [searchedUser, setSearchedUsers] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [resUsers, setResUsers] = useState([]);

    const fetchUsers = async (e) => {
        setSearchedUsers(e.target.value);
        await axios.get(`http://localhost:3001/api/v1/user/search-user?search=${e.target.value}`, {
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
        if (selectedUsers.length == 0) {
            console.log("Add Users");
            return;
        }
        let userIds = [];
        selectedUsers.forEach((user) => {
            userIds.push(user._id)
        })

        await axios.patch(`http://localhost:3001/api/v1/conversation/add-to-group/${group._id}`, { user: userIds }, {
            headers: {
                'Authorization': `Bearer ${cookies.get('token')}`
            }
        })
            .then((res) => {
                console.log(res.data);
                // console.log();
                setSelectedUsers([]);
                fetchAgain();
            })
            .catch((err) => {
                console.log(err);
            })

    }

    const removeSelectedUser = (id) => {
        const updatedUsers = selectedUsers.filter((item) => item._id !== id);
        setSelectedUsers(updatedUsers);
    }

    const SelectedUserHandler = async (user) => {
        console.log(user);
        if (selectedUsers.some((item => item._id == user._id)) || group?.users?.some(item => item._id == user._id)) {
            console.log("User Already Selected");
        }
        else {
            setSelectedUsers((prev) => [...prev, user]);
        }
    }


    //Rename Group Handler
    const renameGroupHandler = async () => {
        if (!groupName) {
            console.log("Group Name Cannot Be Empty");
            return;
        }

        if (groupName === group.chatName) {
            console.log("Same Group Name");
            return;
        }
        let conversationId = group._id;
        console.log(conversationId);
        await axios.patch(`http://localhost:3001/api/v1/conversation/rename-group/${conversationId}`, {
            name: groupName
        }, {
            headers: {
                "Authorization": `Bearer ${cookies.get('token')}`
            }
        }).then((res) => {
            console.log(res.data);
            fetchAgain();
            setRenameGroup(false);
        })
            .catch((err) => {
                console.log(err);
            })

    }

    const RemoveUserHandler = async (id) => {
        console.log(id);

        await axios.patch(`http://localhost:3001/api/v1/conversation/remove-from-group/${group._id}`, {
            user: id
        }, {
            headers: {
                Authorization: `Bearer ${cookies.get('token')}`
            }
        })
            .then((res) => {
                console.log(res.data);
                if(id === userId)
                {
                    setGroupModal(false);
                    setMessages({});
                    fetchAgain();
                }
            })
            .catch((err) => {
                console.log(err);
            })
    }

    return <>
        <div
            className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
        >
            <div className="relative w-auto my-6 mx-auto max-w-3xl" style={{ minWidth: '400px' }}>
                <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                    {/*header*/}
                    <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                        <h3 className="text-3xl font-semibold ">
                            Group
                        </h3>
                        <button
                            className="p-1 ml-auto bg-transparent border-0 text-black opacity-80 float-right text-3xl leading-none font-bold outline-none focus:outline-none"
                            onClick={() => setGroupModal(false)}
                        >
                            <span className="bg-transparent text-black opacity-80 h-6 w-6 text-2xl block outline-none focus:outline-none">
                                X
                            </span>
                        </button>
                    </div>
                    {/*body*/}
                    <div className="relative p-6" >
                        {
                            !renameGroup ? <>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <h3 className="pb-2 font-semibold text-lg text-center w-[100%] ">{group.chatName}</h3>
                                    <i class="fa-regular fa-pen-to-square" onClick={() => { setRenameGroup(true) }} style={{ cursor: 'pointer' }}></i>
                                </div></> : <>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <input type="text" id="name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg  block p-2.5 dark:placeholder-gray-400 w-[90%] text-center" placeholder="Group Name" value={groupName} onChange={(e) => { setGroupName(e.target.value) }} />
                                    <i class="fa-regular fa-floppy-disk" style={{ fontSize: '25px', cursor: 'pointer' }} onClick={renameGroupHandler}></i>
                                </div>
                            </>
                        }

                        <div className="py-5 pt-3" style={{ alignItems: 'center', display: 'flex' }}>
                            <img src={group.groupPic} className="rounded-full" style={{ margin: 'auto', width: '100px' }}></img>
                        </div>
                        <div>
                            <div class="flex justify-between">
                                {group?.users.filter(item => item._id != userId).map((item) =>

                                (<div key={item._id} className="flex justify-between" style={{ cursor: 'pointer', border: '1px solid', background: 'purple', color: 'white', padding: '5px', 'alignItems': 'center', verticalAlign: 'baseline' }}>
                                    <span>{item.email}</span>
                                    <span onClick={() => { RemoveUserHandler(item._id) }} ><svg class="w-3 h-3" style={{ 'flex justify-between': 'baseline' }} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" /> </svg></span>
                                </div>)


                                )}
                            </div>
                        </div>
                        <div className="pt-6">
                            <form onSubmit={submitHandler}>
                                <div>
                                    <input type="text" id="users" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg  block w-full p-2.5 dark:placeholder-gray-400 " placeholder="Add Users" value={searchedUser} onChange={fetchUsers} />
                                </div>

                                <div className="pt-8" style={{ textAlign: 'center' }}>
                                    {
                                        selectedUsers.length > 0 && <h3 className="font-bold text-lg">Selected Users</h3>
                                    }
                                </div>

                                <div class="flex-2 justify-between pt-4">
                                    {selectedUsers.map(item => (
                                        <div key={item._id} className="flex justify-between" style={{ cursor: 'pointer', border: '1px solid', background: 'purple', color: 'white', padding: '5px', 'alignItems': 'center', verticalAlign: 'baseline' }}>
                                            <span>{item.email}</span>
                                            <span onClick={() => { removeSelectedUser(item._id) }}><svg class="w-3 h-3" style={{ 'flex justify-between': 'baseline' }} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" /> </svg></span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex-2 overflow-x-hidden pt-3">
                                    {
                                        searchedUser ? (resUsers.length > 0 ? resUsers.map((item) => {
                                            return (
                                                <div className='flex items-center py-3 ' key={item?._id}>
                                                    <div className='cursor-pointer flex items-center' onClick={() => { SelectedUserHandler(item) }}>
                                                        <div><img src={item?.profilePic} className="w-[60px] h-[60px] rounded-full p-[2px] border border-primary" /></div>
                                                        <div className='ml-6'>
                                                            <h3 className='text-sm font-semibold'>{item?.username}</h3>
                                                            <h3 className='text-sm font-semibold'>{item?.email}</h3>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }) : <div className='text-center text-lg  mt-2 pb-3'>No Users Found</div>) : <></>
                                    }
                                </div>
                                <button type="submit" class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-blue-800">Add Selected Users</button>
                            </form>
                            <div style={{display : 'flex', justifyContent : 'flex-end', marginTop : '15px'}}>
                                <button type="button" class="w-full text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center  dark:focus:ring-blue-800 " onClick={()=>{RemoveUserHandler(userId)}}>Leave Group</button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
        <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
}

export default GroupProfileModal;