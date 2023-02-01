import React from 'react';
import CSS from 'csstype';

const PongField = () => {
    const lineStyle = {
        position: "absolute",
        left: "5%",
        width: "90%",
        height: "2%",
        background: "yellow",
    };
    return (
        <div>
            <div style={({ ...lineStyle, top: "0" } as CSS.Properties)} />
            <div style={({ ...lineStyle, bottom: "0" } as CSS.Properties)} />
        </div>
    );
};

export default PongField;