import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Loading = () => {
    const [visibleWords, setVisibleWords] = useState([]);
    const words = ["Wait", "a", "second"];

    useEffect(() => {
        words.forEach((word, index) => {
            setTimeout(() => {
                setVisibleWords((prev) => [...prev, word]);
            }, index * 700); // waktu jeda antar kata (700ms)
        });
    }, []);

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light fades">
            <div style={{ fontSize: '2em', fontWeight: '300', color: '#04419c', display: 'flex', gap: '0.3em' }}>
                {words.map((word, index) => (
                    <span
                        key={index}
                        className={`fade-in ${visibleWords.includes(word) ? 'visible' : 'hidden'}`}
                        style={{ opacity: 0, transition: 'opacity 0.7s' }}
                    >
                        {word}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default Loading;
