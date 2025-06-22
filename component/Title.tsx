import React from 'react'
import "../styles/title.css"

const Title = ({title} : {title: string}) => {
    return (
        <div className="categoerie-sub-title">
            <p className='categoerie-sub-title-text'>{title}</p>
        </div>
    )
}

export default Title
