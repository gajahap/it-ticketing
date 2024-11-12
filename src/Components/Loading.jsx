import React, { useState, useEffect } from 'react';
import { Image } from 'react-bootstrap';
import Logo from '../assets/images/gap.png';

const Loading = () => {
    const words = ["We", "are", "preparing", "the", "page", "for", "you"];
    const [visibleIndex, setVisibleIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setVisibleIndex((prevIndex) => (prevIndex + 1) % (words.length + 1));
        }, 1000);

        return () => clearInterval(intervalId);
    }, [words.length]);

    return (
        <div className="loading-container">
            <div style={{ position: 'relative' }}>
                <Image src={Logo} style={{ width: '3em', height: 'auto', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -55%)' }} />
                <div className="loading-spinner"></div>
                </div>
            <div className="loading-text">
                
                {words.map((word, index) => (
                    <span
                        key={index}
                        style={{ opacity: visibleIndex === words.length || visibleIndex === index ? 1 : 0.5 }}
                        className={visibleIndex === words.length || visibleIndex === index ? "" : ""}
                    >
                        {word}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default Loading;
