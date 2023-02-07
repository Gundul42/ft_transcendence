import * as constants from './constants.json'
import { GameInstance } from './GameInstance';

export class Coordinate {
	constructor(
		public x: number,
		public y: number
	) {}
}

export class Paddle {
	public direction: number = 0;
	constructor(
		public position: Coordinate,
		public height: number
	) {}
}

export class Ball {
	public position: Coordinate = new Coordinate(constants.game_canvas.width / 2, constants.game_canvas.height / 2);
	public radius: number = constants.ball.radius;
	public velocity: number;
	constructor(
		public direction: Coordinate,
		public readonly start_velocity: number
	) {
		this.velocity = start_velocity;
	}
}

export class GameState {
	public paddle1: Paddle;
	public paddle2: Paddle;
	public ball: Ball;
	constructor(
		private instance: GameInstance,
		round: number
	) {
		let paddle_height: number = constants.paddle.height;
		this.paddle1 = new Paddle(new Coordinate(constants.paddle.buffer, constants.game_canvas.height / 2), paddle_height);
		this.paddle2 = new Paddle(new Coordinate(constants.game_canvas.width - constants.paddle.buffer - constants.paddle.width, constants.game_canvas.height / 2), paddle_height);
		this.ball = new Ball(this.calcRandomDirection(round), constants.ball.velocity);
	}

	public calcRandomDirection(round: number) : Coordinate {
		let x: number = (round % 2 === 1) ? 1 : -1;
		let y: number = (Math.random() * 2) - 1;
		//let magnitude: number = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
		return new Coordinate(x, y);
	}

	public calcNewPosition() : void {
		this.calcBallPosition();
		this.calcPaddlePosition(this.paddle1);
		this.calcPaddlePosition(this.paddle2);
	}

	public calcBallPosition() : void {
		let ball_new_x: number = this.ball.position.x + Math.round(this.ball.velocity * this.ball.direction.x);
		let ball_new_y: number = this.ball.position.y + Math.round(this.ball.velocity * this.ball.direction.y);

		if (ball_new_y - this.ball.radius <= 0) {
			ball_new_y = this.ball.radius;
			this.ball.direction.y *= -1;
		} else if (ball_new_y + this.ball.radius >= constants.game_canvas.height) {
			ball_new_y = constants.game_canvas.height - this.ball.radius;
			this.ball.direction.y *= -1;
		}
		if ((ball_new_x - this.ball.radius) <= (constants.paddle.buffer + constants.paddle.width)) {
			if (((ball_new_y - this.ball.radius) > (this.paddle1.position.y + this.paddle1.height)) || ((ball_new_y + this.ball.radius) < this.paddle1.position.y)) {
				this.instance.player2_points++;
				this.instance.scored = true;
			} else {
				ball_new_x = this.paddle1.position.x + constants.paddle.width + this.ball.radius;
				this.ball.direction.y = (ball_new_y - (this.paddle1.position.y + (this.paddle1.height / 2))) / (constants.paddle.height / 4);
				this.ball.direction.x *= -1;
			}
		} else if (ball_new_x + this.ball.radius >= (constants.game_canvas.width - constants.paddle.buffer - constants.paddle.width)) {
			if (((ball_new_y - this.ball.radius) > (this.paddle2.position.y + this.paddle1.height)) || ((ball_new_y + this.ball.radius) < this.paddle2.position.y)) {
				this.instance.player1_points++;
				this.instance.scored = true;
			} else {
				ball_new_x = this.paddle2.position.x - this.ball.radius;
				this.ball.direction.y = (ball_new_y - (this.paddle2.position.y + (this.paddle2.height / 2))) / (constants.paddle.height / 4);
				this.ball.direction.x *= -1;
			}
		}
		this.ball.position.x = ball_new_x;
		this.ball.position.y = ball_new_y;
	}

	public calcPaddlePosition(paddle: Paddle) : void {
		if (paddle.position.y + (paddle.direction * constants.paddle.velocity) <= 0) {
			paddle.position.y = 0;
		} else if ((paddle.position.y + paddle.height + (paddle.direction * constants.paddle.velocity)) >= constants.game_canvas.height) {
			paddle.position.y = constants.game_canvas.height - paddle.height;
		} else {
			paddle.position.y += paddle.direction * constants.paddle.velocity;
		}
	}

	public setPaddleDirection(id: number, direction: number) : void {
		let paddle: Paddle;
		if (id === 1) {
			paddle = this.paddle1;
		} else {
			paddle = this.paddle2;
		}
		paddle.direction = direction;
	}

	public resetGameState() : void {
		this.ball.position.x = constants.game_canvas.width / 2;
		this.ball.position.y = constants.game_canvas.height / 2;
		this.ball.direction = this.calcRandomDirection(this.instance.round);
		this.ball.velocity = constants.ball.velocity + (this.instance.mode_factor * this.instance.round);

		this.paddle1.position.y = (constants.game_canvas.height - this.paddle1.height) / 2;
		this.paddle2.position.y = (constants.game_canvas.height - this.paddle2.height) / 2;
	}
}