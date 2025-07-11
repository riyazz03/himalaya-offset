import React from "react";
import "../styles/ImageGrid.css";

type ImageItem = {
    src: string;
    colSpan?: number;
    rowSpan?: number;
};

const images: ImageItem[] = [
    {
        src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        colSpan: 2,
        rowSpan: 2,
    },
    {
        src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
    },
    {
        src: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=80",
        colSpan: 2,
    },
    {
        src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
        rowSpan: 2,
    },
    {
        src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
    },
    {
        src: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800&q=80",
    },
    {
        src: "https://images.unsplash.com/photo-1468071174046-657d9d351a40?auto=format&fit=crop&w=800&q=80",
    },
    {
        src: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=800&q=80",

    },
    {
        src: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80",
    },
    {
        src: "https://images.unsplash.com/photo-1507149833265-60c372daea22?auto=format&fit=crop&w=800&q=80",
    },

];

const ImageGrid = () => {
    return (
        <div className="image-grid-wrapper">
            {images.map(({ src, colSpan = 1, rowSpan = 1 }, index) => (
                <div
                    key={index}
                    className="image-grid-item"
                    style={{
                        gridColumn: `span ${colSpan}`,
                        gridRow: `span ${rowSpan}`,
                    }}
                >
                    <img src={src} alt={`Grid image ${index + 1}`} />
                </div>
            ))}
        </div>
    );
};

export default ImageGrid;
