import { Socket } from 'socket.io';
import { IUserPublic } from '../Interfaces';

export type AuthenticatedSocketChat = Socket & {
	data:  IUserPublic
}