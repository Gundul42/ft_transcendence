import React from 'react';

const PongField = () => {
    const lineStyle = {
        position: "absolute",
        left: "5%",
        width: "90%",
        height: "2%",
        background: "yellow",
    };
    return (
        <>
            <div style={{ ...lineStyle, top: "0" }} />
            <div style={{ ...lineStyle, bottom: "0" }} />
        </>
    );
};

export default PongField;