import React from 'react';
import './App.css';
import ScanInput from './components/ScanInput';

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <h1>🛒 Baymax OmniPOS</h1>
                <p>Grocery POS System - MERN Stack</p>
            </header>
            <main>
                <ScanInput />
            </main>
        </div>
    );
}

export default App;
