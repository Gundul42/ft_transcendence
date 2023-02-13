import React, { useEffect, useRef } from 'react';
import { IRoom, IMessage } from '../Interfaces';

export const ChatBody = ({room, messages} : {room: IRoom, messages: IMessage[]}) => { 
	const participants_map = new Map(room.participants.map((value) => [value.id, value]));
	const lastMessageRef = useRef<HTMLDivElement>(null);
	
	useEffect(() => {
		lastMessageRef.current?.scrollIntoView({behavior: 'smooth'});
	}, [messages]);

	console.log("Current msg state: ", messages)
	return (
		<>
			<div className='Chat-Box' style={{backgroundColor: "black", borderRadius: "10px"}}>
			{
				messages.length > 0 &&
				messages.map(message => (
					<div className="Message-Chats" key={message.id.toString()}>
						<p>{participants_map.get(message.appUserId)?.display_name}</p>
					<div className='Message-Text'>
						<p>{message.value}</p>
					</div>
				</div>))
			}
			<div ref={lastMessageRef} />
			</div>
		</>
	);
}