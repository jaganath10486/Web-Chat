import React from "react";


function ProfileModal({
    user,
    setProfileView
}) {
    return (
        <>
            <div
                className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
            >

                <div className="relative w-auto my-6 mx-auto max-w-sm">
                    {/*content*/}
                    <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                        {/*header*/}
                        <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                            <h3 className="text-3xl font-semibold">
                                Profile
                            </h3>
                            <button
                                className="p-1 ml-auto bg-transparent border-0 text-black opacity-80 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                                onClick={() => setProfileView(false)}
                            >
                                <span className="bg-transparent text-black opacity-80 h-6 w-6 text-2xl block outline-none focus:outline-none">
                                    ×
                                </span>
                            </button>
                        </div>
                        {/*body*/}
                        <div className="relative p-6 flex-auto text-center">
                           <div className="text-center" style={{display : 'flex', flexDirection : 'column', alignItems : 'center'}}>
                             <h3 className="pb-4 font-semibold text-lg text-center">{user.username}</h3>
                             <img src={user.profilePic} className="rounded-full"  style={{width : '100px'}}></img>
                             <h3 className="pt-4 font-semibold text-lg">{user.email}</h3>
                           </div>
                        </div>
                        {/*footer*/}
                        <div className="flex items-center p-6 border-t border-solid border-blueGray-200 rounded-b" style={{justifyContent : 'center'}}>
                            <button
                                className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                type="button"
                                onClick={() => setProfileView(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
    )
}

export default ProfileModal;