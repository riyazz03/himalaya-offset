import React from 'react'

const Title = ({title} : {title: string}) => {
    const titleContainerStyle: React.CSSProperties = {
        display: 'flex',
        padding: '0.9375rem 2.1875rem',
        alignItems: 'center',
        gap: '0.625rem',
        borderRadius: '6.25rem',
        border: '1px solid #ccc',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    }

    const titleTextStyle: React.CSSProperties = {
        color: '#000',
        fontSize: '1rem',
        fontStyle: 'normal',
        fontWeight: '600',
        lineHeight: 'normal',
        transition: 'all 0.3s ease',
        margin: '0'
    }

    return (
        <div style={titleContainerStyle}>
            <p style={titleTextStyle}>{title}</p>
        </div>
    )
}

export default Title