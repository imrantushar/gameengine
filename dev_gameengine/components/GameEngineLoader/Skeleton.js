import React from 'react';
import "./styles/Skeleton.scss";

const Skeleton = ({
    width = "100%",
    height = "2rem",
    className = "",
    style = {}
}) => {
    return (
        <div
            className={`relative overflow-hidden rounded bg-[var(--gameengine-secondary-color)] ${className}`}
            style={{ width, height, ...style }}
        >
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </div>
    );
};

export default Skeleton;
