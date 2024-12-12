import React from 'react';
import './kitchenview.css';


export default function KitchenView() {
    const ordersLeft = 6; // Replace with dynamic data if needed


    return (
        <div className="kitchenContainer">
            <h2 className="kitchenHeader">Kitchen</h2>
            <div className="cardGrid">
                {[...Array(6)].map((_, index) => (
                    <div className="card" key={index}>
                        <div className="card-header">
                            <h3>Order ID: #{index + 1}</h3>
                            <p>Time: {new Date().toLocaleTimeString()}</p>
                        </div>
                        <div className="card-content">
                            <p>If </p>
                            <p>a </p>
                            <p>dog </p>
                            <p>chews </p>
                            <p>shoes, </p>
                            <p>whose </p>
                            <p>shoes</p>
                            <p>does</p>
                            <p>he</p>
                            <p>choose?</p>
                            <p>What</p>
                            <p>is</p>
                            <p>your</p>
                            <p>guess?</p>
                        </div>
                        <div className="card-actions">
                            <button className="btn btn-secondary">In Progress</button>
                            <button className="btn btn-primary">Complete</button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="queueBox">
                Orders in Queue: {ordersLeft}
            </div>
        </div>
    );
}

