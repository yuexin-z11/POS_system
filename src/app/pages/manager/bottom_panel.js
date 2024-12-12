"use client";


import React, { useState, useEffect } from 'react';
import axios from 'axios';


function BottomPanel({ isManager = true }) {
    const handleManagerAction = (action) => {
        console.log(`${action} button clicked`);
    };


    return (
        <div className="bottom-panel">
            {isManager && (
                <>
                    <button onClick={() => handleManagerAction("Employee Information")}>
                        Employee Information
                    </button>
                    <button onClick={() => handleManagerAction("Inventory Report")}>
                        Inventory Report
                    </button>
                    <button onClick={() => handleManagerAction("Sales Report")}>
                        Sales Report
                    </button>
                    <button onClick={() => handleManagerAction("X Report")}>X Report</button>
                    <button onClick={() => handleManagerAction("Z Report")}>Z Report</button>
                    <button onClick={() => handleManagerAction("Add Menu Item")}>Add Menu Item</button>
                    <button onClick={() => handleManagerAction("Delete Menu Item")}>Delete Menu Item</button>
                </>
            )}
        </div>
    );
}


export default BottomPanel;



