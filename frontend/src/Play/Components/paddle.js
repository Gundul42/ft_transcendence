import React from 'react';
import { getBrowserSize } from "./helpers";

function Paddle({ y, side }) {
    const screenHeight = getBrowserSize().y;
    console.log(getBrowserSize().y);
    const paddleHeight = screenHeight * 0.1;
    const paddleWidth = paddleHeight * 0.15;
    const halfPaddleHeight = paddleHeight / 2;
    return (
        <div
            style={{
                position: 'absolute',
                left: `${paddleWidth}px`,
                top: `${y - halfPaddleHeight}px`,
                width: `${paddleWidth}px`,
                height: `${paddleHeight}px`,
                backgroundColor: 'yellow',
            }}
        />
    )
}
export default Paddle;