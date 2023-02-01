import { GameState } from "./GameState";
import { Lobby } from "./lobby/lobby";
import { ServerEvents } from "./events";
import { PrismaService } from '../prisma/prisma.service';
import constants from './constants.json';

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

	public state: GameState = new GameState(this, this.difficulty, this.round);
	constructor(
		private readonly lobby: Lobby,
		public readonly difficulty: number
	) {}

	public start() : void {
		while (!this.finished && this.player1_points < this.max_points && this.player2_points < this.max_points) {
			this.play(constants.fps);
		}
		if (this.winner === 0) {
			if (this.player1_points > this.player2_points) {
				this.winner = 1;
			} else {
				this.winner = 2;
			}
		}
	}

	public play(fps: number) : void {
		this.scored = false;
		this.lobby.dispatchToLobby(ServerEvents.GameState, this.render(0))
		this.sleep(3000);
		let waiting_time: number = 1000 / fps;
		while (!this.scored) {
			this.sleep(waiting_time)
			this.render(waiting_time);
		}
	}

	public render(milliseconds: number) : IGameState {
		this.state.calcNewPosition(milliseconds);
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

	private sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
}