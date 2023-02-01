import React, { useRef, useEffect } from 'react';
import { IGameState } from '../Interfaces';
import constants from '../constants.json';

export function Canvas({gameState} : {gameState: IGameState}) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const draw = (ctx: CanvasRenderingContext2D) => {
		//Canvas
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.fillStyle = '#FFFFFF';
		//Ball
		ctx.beginPath();
		ctx.arc(gameState.ball.x, gameState.ball.y, constants.ball.radius, 0, 2*Math.PI);
		ctx.closePath();
		ctx.fill();
		//Paddle1
		ctx.beginPath();
		ctx.rect(constants.paddle.buffer, gameState.paddle1.y, constants.paddle.width, constants.paddle.height);
		ctx.closePath();
		ctx.fill();
		//Paddle2
		ctx.beginPath();
		ctx.rect(constants.game_canvas.width - constants.paddle.buffer - constants.paddle.width, gameState.paddle2.y, constants.paddle.width, constants.paddle.height);
		ctx.closePath();
		ctx.fill();
	}

	useEffect(() => {
		const canvas: HTMLCanvasElement | null = canvasRef.current;
		if (canvas === null) return;
		const context = canvas.getContext('2d');
		let animationFrameId: any;

		const render = () => {
			if (context) {
				draw(context);
			}
			animationFrameId = window.requestAnimationFrame(render);
		}
		render()
		
		return () => {
			window.cancelAnimationFrame(animationFrameId)
		}
	}, [draw])

	const canvas_height = "75%";
	const canvas_width = "auto";
	return (
		<canvas style={{
			height: canvas_height,
			width: canvas_width,
			border: "5px solid white"
		}} width={constants.game_canvas.width} height={constants.game_canvas.height} ref={canvasRef} />
	)
}