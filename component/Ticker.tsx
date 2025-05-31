import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import "../styles/ticker.css";

interface TickerProps {
    text: string;
    speedSeconds?: number;
}

const Ticker: React.FC<TickerProps> = ({ text, speedSeconds = 20 }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<GSAPAnimation | null>(null);

    const [repeatCount, setRepeatCount] = useState(2);

    useEffect(() => {
        const updateRepeatCount = () => {
            if (!containerRef.current) return;

            const containerWidth = containerRef.current.offsetWidth;

            let count = 1;
            const tempSpan = document.createElement("span");
            tempSpan.style.visibility = "hidden";
            tempSpan.style.position = "absolute";
            tempSpan.style.whiteSpace = "nowrap";
            tempSpan.textContent = text;
            document.body.appendChild(tempSpan);
            const singleTextWidth = tempSpan.offsetWidth;
            document.body.removeChild(tempSpan);

            count = Math.ceil((2 * containerWidth) / singleTextWidth);

            setRepeatCount(count);
        };

        updateRepeatCount();
        window.addEventListener("resize", updateRepeatCount);
        return () => window.removeEventListener("resize", updateRepeatCount);
    }, [text]);

    useEffect(() => {
        if (!contentRef.current) return;

        const contentWidth = contentRef.current.scrollWidth / 2;

        if (animationRef.current) {
            animationRef.current.kill();
        }

        animationRef.current = gsap.to(contentRef.current, {
            x: -contentWidth,
            duration: speedSeconds,
            ease: "linear",
            repeat: -1,
        });

        return () => {
            animationRef.current?.kill();
        };
    }, [repeatCount, speedSeconds, text]);

    const repeatedTexts = [];
    for (let i = 0; i < repeatCount; i++) {
        repeatedTexts.push(
            <span className="ticker-text" key={`ticker-text-${i}`}>
                {text}
            </span>
        );
    }

    const fullContent = [...repeatedTexts, ...repeatedTexts];

    return (
        <div className="ticker-container" ref={containerRef}>
            <div className="ticker-content" ref={contentRef}>
                {fullContent}
            </div>
        </div>
    );
};

export default Ticker;
