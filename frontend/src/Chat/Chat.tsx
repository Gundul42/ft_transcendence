import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import { ChatBar } from './ChatBar';
import { ChatBody } from './ChatBody';
import { ChatFooter } from './ChatFooter';
import { Header } from '../Header';
import { InfoRoom } from './InfoRoom';
import { OwnerCommands } from './OwnerCommands';
import { IRoom, IMessage, ISafeAppState } from '../Interfaces';

const ViewRoom = (
	{app_state, messages, rooms, currentRoom, isInfoView, setIsInfoView, set_page, chat_socket, game_socket} : 
	{app_state : ISafeAppState, messages: Map<string, IMessage[]>, rooms: Map<string, IRoom>, currentRoom: string, isInfoView: boolean, setIsInfoView: any, set_page: any, chat_socket: Socket, game_socket: Socket}) => {
	let room: IRoom = rooms.get(currentRoom) as IRoom;
	let safe_messages: IMessage[] = messages.get(currentRoom) === undefined ? [] : (messages.get(currentRoom) as IMessage[]);

	if (isInfoView && rooms.get(currentRoom) !== undefined) {
		return (
			<>
				<OwnerCommands app_state={app_state} room={room} />
				<InfoRoom setIsInfoView={setIsInfoView} app_state={app_state} room={room} set_page={set_page} chat_socket={chat_socket} game_socket={game_socket} />
			</>
		)
	} else {
		return (
			<>
				{rooms.get(currentRoom) !== undefined &&
					<ChatBody room={room} messages={safe_messages} /> }
				<ChatFooter data_state={app_state.data} room={room} chat_socket={chat_socket} />
			</>
		)
	}
}

export const Chat = ({app_state, rooms, messages, chat_socket, game_socket, set_page, setUnreadMessages} : {app_state: ISafeAppState, rooms: Map<string, IRoom>, messages: Map<string, IMessage[]>, chat_socket: Socket, game_socket: Socket, set_page: any, setUnreadMessages: any}) => {
	const [currentRoom, setCurrentRoom] : [string, any] = useState("");
	const [isInfoView, setIsInfoView] : [boolean, any] = useState(false);

	return (
		<div className="Chat">
			<ChatBar app_state={app_state} rooms={rooms} messages={messages} setCurrentRoom={setCurrentRoom} setIsInfoView={setIsInfoView} set_page={set_page} setUnreadMessages={setUnreadMessages} chat_socket={chat_socket} />
			<div className='Chat-Body'>
				<Header set_page={set_page} />
				<ViewRoom app_state={app_state} messages={messages} isInfoView={isInfoView} set_page={set_page} setIsInfoView={setIsInfoView} rooms={rooms} currentRoom={currentRoom} chat_socket={chat_socket} game_socket={game_socket} />
			</div>
		</div>
	)
};