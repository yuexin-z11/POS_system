import React from 'react';


const TopPanel = ({ onSelectType }) => {
    return (
        <div className="top-panel">
            <button onClick={() => onSelectType('Bowl')}>Bowl</button>
            <button onClick={() => onSelectType('Plate')}>Plate</button>
            <button onClick={() => onSelectType('Bigger Plate')}>Bigger Plate</button>
            <button onClick={() => onSelectType('Logout')}>Logout</button>
        </div>
    );
};


export default TopPanel;





