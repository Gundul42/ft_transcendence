import React from 'react';

function Paddle({ y, side }) {
    const screenHeight = 1080;
    const paddleHeight = screenHeight * 0.01;
    const paddleWidth = paddleHeight * 0.1;
    const halfPaddleHeight = paddleHeight / 2;
    return (
        <div
            style={{
                position: 'absolute',
                left: `${paddleWidth}px`,
                top: `${y - halfPaddleHeight}px`,
                width: `${paddleWidth}px`,
                height: `${paddleHeight}px`,
                backgroundColor: 'black',
            }}
        />
    )
}
export default Paddle;