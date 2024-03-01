import { useEffect, useRef, useState } from 'react'
import Img1 from '../../assets/img1.jpg'
import Input from '../../components/Input';
import GroupChat from './GroupChat';
import Cookies from 'universal-cookie';


import { io } from 'socket.io-client'
import axios from 'axios';
import ProfileModal from './ProfileModal';
import GroupProfileModal from './GroupProfileModal';

const cookies =  new Cookies();

const Dashboard = () => {
	const [conversations, setConversations] = useState([])
	const [messages, setMessages] = useState({})
	const [userInfo, setUserInfo] = useState({});
	const [message, setMessage] = useState('')
	const [users, setUsers] = useState([])
	const [socket, setSocket] = useState(null)
	const messageRef = useRef(null)
	const [token, setToken] = useState(null);

	const [search, setSearch] = useState('');
	const [searchRes, setSearchRes] = useState([]);
	const [createChat, setCreateChat] = useState(false);
	const [notification, setNotification] = useState([]);
	const [profileView, setProfileView] = useState(false);
	const [groupModal, setGroupModal] = useState(false);

	var selectedConversationCompare;
	useEffect(() => {
		setSocket(io('http://localhost:5000'));
	}, [])

    const emitGroupCreateEvent = (data) => {
		console.log(data);
		setConversations((prev) => [data, ...prev]);
		socket.emit('Group Created', data);
	}

	useEffect(() => {
		socket?.on('Message Recieved', data => {
			console.log("NEW MESSAGE RECEIVED", data);
			console.log("Conversation : ", selectedConversationCompare);
			if(selectedConversationCompare && selectedConversationCompare._id == data?.conversation?._id)
			{
				setMessages(prev => ({
					...prev,
					messages: [...prev.messages, data]
				}))
			}
			else
			{
				if(!notification.includes(data))
				{
					setNotification([data, ...notification]);
				}
			}
		})

		socket?.on('New Group Created', data => {
			console.log("NEW GROUP CREATED", data);
			let updatedConversation = [data, ...conversations]
			setConversations(updatedConversation);
		})
	})

	useEffect(() => {
		if(userInfo)
		{
			socket?.emit('Add User', userInfo?._id);
		}
	}, [userInfo]);

	useEffect(() => {
		messageRef?.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages?.messages])

	const fetchConversations = async () => {
		console.log(cookies.get('token'));
		setToken(cookies.get('token'));
		await axios.get(`http://localhost:3001/api/v1/conversation/fetch-all-conversations`, {
			headers: {
				'Content-Type': 'application/json',
				'Authorization' : `Bearer ${cookies.get('token')}`
			}
		})
		.then((res) => {
			console.log(res);
			setConversations(res.data.data);
			if(messages.conversation)
			{
				setMessages({...messages, conversation : res.data.data[0]});
			}
		})
		.catch((err) => {
			console.log(err);
		})
	}
	const fetchAgain = async() => {
		console.log("Fetching again...");
		await fetchConversations();
	}
	useEffect(() => {
		fetchUserInfo();
		fetchConversations();
	}, []);

	const fetchMessages = async (conversation) => {
		await axios.get(`http://localhost:3001/api/v1/message/${conversation._id}`, 
		{
			headers : {
				Authorization : `Bearer ${token}` 
			}
		})
		.then((res)=>{
			console.log(res.data.data);
			selectedConversationCompare = conversation;
			setMessages({messages: res.data.data, conversation: conversation});
		})
		.catch((err) => {
			console.log(err);
		})
	}


	const sendMessage = async (e) => {
		// setMessage('')
		console.log(message);
		let data = {
			conversation : messages?.conversation,
			senderId : {
				_id : userInfo?._id 
			},
			type : 'text',
			message : message,
			sentAt : Date.now()
		}
		console.log(data);
		await axios.post(`http://localhost:3001/api/v1/message/${messages?.conversation?._id}`, {message: message}, {
			headers : {
				Authorization : `Bearer ${token}`
			}
		})
		.then((res) => {
			console.log(res.data);
			socket.emit('Send Message', data);
			setMessages(  {...messages, messages : [...messages.messages, res.data.data] } );
			setMessage('');
			console.log("Messages : ", messages);
		})
		.catch((err) => {
			console.error(err);
			setMessage('');
		})
	}

	const fetchUserInfo = async() => {
	   axios.get('http://localhost:3001/api/v1/user/info', {
		headers : {
			'Authorization' : `Bearer ${cookies.get('token')}`
		}
	   })
	   .then((res) => {
		console.log(res.data.data);
		setUserInfo(res.data.data);
	   })
	   .catch((err) => {
		console.error(err);
	   })
	}

	const fetchUsers = async(e) => {
		setSearch(e.target.value);
		const users = await axios.get(`http://localhost:3001/api/v1/user/search-user?search=${e.target.value}`, {
			headers : {
				'Authorization' : `Bearer ${token}`
			}
		})
		.then((res) => {
			console.log(res.data.data);
			setSearchRes(res.data.data)
		})
		.catch((err) => {
			console.error(err);
			setSearchRes([]);
		})
	}

	const startConversation = async(id) => {
		console.log(id);

		await axios.get(`http://localhost:3001/api/v1/conversation/start-conversation/${id}`, {
			headers : {
				Authorization : `Bearer ${token}`
			}
		})
		.then((res) => {
			console.log(res.data);
			fetchMessages(res.data.data);
		})
		.catch((err) => {
			console.error(err);
		})
	}


	const notificationHandler = (item) => {
		fetchMessages(item?.conversation);
		let updatedNotifications = notification.filter(it => it._id !== item._id);
		setNotification(updatedNotifications);
	}

	return (
		<div className='w-screen flex'>
			<div className='w-[25%] h-screen bg-secondary overflow-scroll'>
				<div className='flex items-center my-8 mx-14'>
					<div><img src={userInfo?.profilePic} width={75} height={75} className='border border-primary p-[2px] rounded-full' /></div>
					<div className='ml-8'>
						<h3 className='text-2xl'>{userInfo?.username?.substr(0,10)}</h3>
						<p className='text-lg font-light'>My Account</p>
					</div>
				</div>
				<hr />
				<div className='mx-4 mt-10'>
					<div style={{'display' : 'flex', justifyContent : 'space-between'}}>
					  <Input type="text" name="users" placeholder="Search Users" className="mb-6 w-[60%]" value={search} onChange={fetchUsers}/>
					  {
						createChat &&  <GroupChat  setCreateChat={setCreateChat} emitGroupCreateEvent = {emitGroupCreateEvent}/>
					  }
					  <button data-modal-target={'group-chat'} data-modal-toggle={'group-chat'} class="block text-white bg-blue-200 hover:bg-blue-300 focus:ring-2 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 w-[38%]" type="button" style={{height : "40px", cursor : 'pointer', 'align-items' : 'center'}} onClick={()=>{setCreateChat(!createChat)}} >Group Chat</button>
					</div>
					<div className='text-primary text-lg'>{search ? 'Users' : 'Messages'}</div>
					<div>
						{
							search ? (searchRes.length > 0 ? searchRes.map((item) => {
								return (
									<div className='flex items-center py-3 ' key={item?._id}>
										<div className='cursor-pointer flex items-center' onClick={() => startConversation(item._id)}>
										<div><img src={item?.profilePic} className="w-[60px] h-[60px] rounded-full p-[2px] border border-primary" /></div>
												<div className='ml-6'>
													<h3 className='text-lg font-semibold'>{item?.username }</h3>
												</div>
										</div>
									</div>
								)
							}) : <div className='text-center text-lg font-semibold mt-24'>No Users Found</div>) : (conversations.length > 0 ?
								conversations.map((item, id) => {
									return (
										<div className='flex items-center py-3 ' key={item?._id}>
											<div className='cursor-pointer flex items-center' onClick={() => fetchMessages(item)}>
												<div><img src={item?.isGroup ? item?.groupPic : item?.users.filter((item)=>item._id !== userInfo?._id)[0]?.profilePic} className="w-[60px] h-[60px] rounded-full p-[2px] border border-primary" /></div>
												<div className='ml-6'>
													<h3 className='text-lg font-semibold'>{item?.isGroup ? item?.chatName : item?.users.filter((item)=>item._id !== userInfo?._id)[0]?.username?.substr(0,20)}</h3>
													<p className='text-sm font-light text-gray-600'>{item?.lastMessage && (<>{item?.lastMessage?.senderId?.username?.substr(0,15)} : {item?.lastMessage?.message.length > 40 ? item.lastMessage.message?.substr(0,40) + '...'  : item.lastMessage.message}</>) }</p>
												</div>
											</div>
										</div>
									)
								}) : <div className='text-center text-lg font-semibold mt-24'>No Conversations</div>)

						}
					</div>
				</div>
			</div>
			<div className='w-[50%] h-screen bg-white flex flex-col items-center'>
				{
					messages?.conversation &&
					<div className='w-[75%] bg-secondary h-[80px] my-14 rounded-full flex items-center px-14'>
						<div className='cursor-pointer' ><img src={messages.conversation?.isGroup ? messages.conversation?.groupPic : messages.conversation?.users.filter((item)=>item._id !== userInfo?._id)[0].profilePic} width={48} height={48} className="rounded-full" onClick={()=>{messages.conversation?.isGroup ? setGroupModal(true) : setProfileView(true); console.log(messages.conversation?.isGroup)}} /></div>
						<div className='ml-6 mr-auto'>
							<h3 className='text-lg'>{messages.conversation?.isGroup ? messages.conversation?.chatName : messages.conversation?.users.filter((item)=>item._id !== userInfo?._id)[0].username}</h3>
							<p className='text-sm font-light text-gray-600'>{}</p>
						</div>
						<div className='cursor-pointer'>
							<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-phone-outgoing" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="black" fill="none" stroke-linecap="round" stroke-linejoin="round">
								<path stroke="none" d="M0 0h24v24H0z" fill="none" />
								<path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
								<line x1="15" y1="9" x2="20" y2="4" />
								<polyline points="16 4 20 4 20 8" />
							</svg>
						</div>
					</div>
					
				}
				{
					profileView &&  <ProfileModal user={messages.conversation?.users.filter((item)=>item._id !== userInfo?._id)[0]} setProfileView={setProfileView}/>
				}
				{
					groupModal && <GroupProfileModal group={messages?.conversation} setGroupModal={setGroupModal} fetchAgain={fetchAgain} userId={userInfo?._id} setMessages={setMessages}/>
				}
				<div className='h-[85%] w-full overflow-scroll shadow-sm'>
					<div className='p-14'>
						{
							messages?.messages?.length > 0 ?
								messages.messages.map((item) => {
									return (
										<>
										<div className={`max-w-[40%] rounded-b-xl p-4 mb-6 ${item?.senderId?._id == userInfo?._id ? 'bg-primary text-white rounded-tl-xl ml-auto' : 'bg-secondary rounded-tr-xl'} `}>{item.message}</div>
										<div ref={messageRef}></div>
										</>
									)
								}) : <div className='text-center text-lg font-semibold mt-24'>No Messages or No Conversation Selected</div>
						}
					</div>
				</div>
				{
					messages?.conversation &&
					<div className='p-14 w-full flex items-center'>
						<Input placeholder='Type a message...' value={message} onChange={(e) => setMessage(e.target.value)} className='w-[75%]' inputClassName='p-4 border-0 shadow-md rounded-full bg-light focus:ring-0 focus:border-0 outline-none' />
						<div className={`ml-4 p-2 cursor-pointer bg-light rounded-full ${!message && 'pointer-events-none'}`} onClick={() => sendMessage()}>
							<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-send" width="30" height="30" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" fill="none" stroke-linecap="round" stroke-linejoin="round">
								<path stroke="none" d="M0 0h24v24H0z" fill="none" />
								<line x1="10" y1="14" x2="21" y2="3" />
								<path d="M21 3l-6.5 18a0.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a0.55 .55 0 0 1 0 -1l18 -6.5" />
							</svg>
						</div>
						<div className={`ml-4 p-2 cursor-pointer bg-light rounded-full ${!message && 'pointer-events-none'}`}>
							<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-circle-plus" width="30" height="30" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" fill="none" stroke-linecap="round" stroke-linejoin="round">
								<path stroke="none" d="M0 0h24v24H0z" fill="none" />
								<circle cx="12" cy="12" r="9" />
								<line x1="9" y1="12" x2="15" y2="12" />
								<line x1="12" y1="9" x2="12" y2="15" />
							</svg>
						</div>
					</div>
				}
			</div>
			<div className='w-[25%] h-screen bg-light px-8 py-16 overflow-scroll'>
				<div className='text-primary text-lg pt-12 text-center'>Notifications</div>
				<div className='pt-3'>
					{
						notification.length > 0 ? <div>
							{
								notification.map((item) => (
									<div className='cursor-pointer  text-center' onClick={()=>{notificationHandler(item)}}>
										<h4 className='text-lg font-light text-gray-600 text-center'>New Message {item?.conversation?.isGroup ? `in group ${item?.conversation?.chatName}` : `from User`} </h4>
									</div>
								))
							}
						</div> : <div className='text-center pt-3 text-sm font-light text-gray-600'>No new Notifications</div>
					}
				</div>
			</div>
		</div>
	)
}

export default Dashboard