"use client";


import React, { useState } from 'react';
import TopPanel from './top_panel';
import CenterPanel from './center_panel';
import RightPanel from './right_panel';
import BottomPanel from './bottom_panel';


function App() {
    const [selectedType, setSelectedType] = useState('');
    const [orderItems, setOrderItems] = useState([]);


    const handleSelectType = (type) => {
        setSelectedType(type);
    };


    const addItemToOrder = (item) => {
        setOrderItems((prevItems) => [...prevItems, item]);
    };


    return (
        <div className="App">
            {<TopPanel onSelectType={handleSelectType} />}
            <CenterPanel selectedType={"side"} addItemToOrder={addItemToOrder} />
            {/* <RightPanel orderItems={orderItems} addItemToOrder={addItemToOrder} />
            <BottomPanel /> */}
        </div>
    );
}


export default App;



