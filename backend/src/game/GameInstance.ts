import { GameState } from "./GameState";
import { Lobby } from "./lobby/lobby";
import { ServerEvents } from "./events";
import { PrismaService } from '../prisma/prisma.service';
import * as constants from './constants.json';

export interface ICoordinate {
	x: number;
	y: number;
}

export interface IGameState {
	ball: ICoordinate,
	paddle1: {y: number},
	paddle2: {y: number}
}

export class GameInstance {
	public started: boolean = false;
	public finished: boolean = false;
	public scored: boolean = false;
	public winner: number = 0;
	public player1_points: number = 0;
	public player2_points: number = 0;
	public max_points: number = 11;
	public round: number = 1;
	public intervalId: any = 0;
	public mode_factor: number;

	public state: GameState = new GameState(this, this.difficulty);
	constructor(
		private readonly lobby: Lobby,
		public readonly difficulty: number
	) {
		if (lobby.mode === "classic") {
			this.mode_factor = 0;
		} else {
			this.mode_factor = 1;
		}
	}

	public async start() : Promise<void> {
		this.state.resetGameState();
		this.scored = false;
		await this.sleep(50);
		this.lobby.sendLobbyState();
		await this.sleep(3000);
		let waiting_time: number = 1000 / constants.fps;
		this.intervalId = setInterval(this.play.bind(this), waiting_time, waiting_time);
	}

	public play() : void {
		if (this.scored) {
			this.lobby.sendLobbyState();
			if (this.player1_points === this.max_points) {
				this.lobby.finishGame({winner: 1, message: "The Match has ended"});
				return ;
			} else if (this.player2_points === this.max_points) {
				this.lobby.finishGame({winner: 2, message: "The Match has ended"});
				return ;
			}
			this.round++;
			this.state.resetGameState();
			this.scored = false;
			this.lobby.dispatchToLobby(ServerEvents.GameState, this.render());
		}
		this.lobby.dispatchToLobby(ServerEvents.GameState, this.render());
	}

	public render() : IGameState {
		this.state.calcNewPosition();
		return ({
			ball: {
				x: this.state.ball.position.x,
				y: this.state.ball.position.y,
			},
			paddle1: {
				y: this.state.paddle1.position.y
			},
			paddle2: {
				y: this.state.paddle2.position.y
			}
		})
	}

	sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
}