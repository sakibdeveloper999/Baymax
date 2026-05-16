import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './App.css';

// Layouts
import MainLayout from './layouts/MainLayout';

// Screens
import Dashboard from './screens/Dashboard';
import POSScreen from './screens/POSScreen';
import ProductsManager from './screens/ProductsManager';
import CustomersManager from './screens/CustomersManager';
import SuppliersManager from './screens/SuppliersManager';
import OrdersManager from './screens/OrdersManager';
import InventoryManager from './screens/InventoryManager';
import Reports from './screens/Reports';
import Settings from './screens/Settings';

function App() {
    const { i18n } = useTranslation();
    const [currentScreen, setCurrentScreen] = useState('pos');

    useEffect(() => {
        // RTL support
        if (i18n.language === 'ar') {
            document.documentElement.dir = 'rtl';
            document.documentElement.lang = 'ar';
        } else {
            document.documentElement.dir = 'ltr';
            document.documentElement.lang = i18n.language;
        }
    }, [i18n.language]);

    const renderScreen = () => {
        switch (currentScreen) {
            case 'dashboard':
                return <Dashboard />;

            case 'pos':
                return <POSScreen />;

            case 'products':
            case 'categories':
                return <ProductsManager />;

            case 'customers':
                return <CustomersManager />;

            case 'suppliers':
                return <SuppliersManager />;

            case 'orders':
                return <OrdersManager />;

            case 'inventory':
                return <InventoryManager />;

            case 'reports':
                return <Reports />;

            case 'settings':
                return <Settings />;

            default:
                return <Dashboard />;
        }
    };

    return (
        <MainLayout
            currentScreen={currentScreen}
            onScreenChange={setCurrentScreen}
        >
            {renderScreen()}
        </MainLayout>
    );
}

export default App;