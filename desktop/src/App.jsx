import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './App.css';

// Layouts
import MainLayout from './layouts/MainLayout';
import SessionGate from './components/SessionGate';

// Screens
import Dashboard from './screens/Dashboard';
import POSScreen from './screens/POSScreen';
import ProductsManager from './screens/ProductsManager';
import CategoriesManager from './screens/CategoriesManager';
import CustomersManager from './screens/CustomersManager';
import SuppliersManager from './screens/SuppliersManager';
import OrdersManager from './screens/OrdersManager';
import InventoryManager from './screens/InventoryManager';
import Reports from './screens/Reports';
import Settings from './screens/Settings';
import ReceiptViewer from './screens/ReceiptViewer';

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

    const receiptToken = window.location.hash.startsWith('#receipt/') ? window.location.hash.slice(9) : '';
    if (receiptToken) return <ReceiptViewer token={receiptToken} />;

    const preview = screen => <><p role="status" className="bg-amber-50 text-amber-900 p-3">Sample preview: this screen does not yet show your business data.</p>{screen}</>;

    const renderScreen = (session) => {
        switch (currentScreen) {
            case 'dashboard':
                return preview(<Dashboard />);

            case 'pos':
                return <POSScreen key={session.store._id} store={session.store} user={session.user} onBusyChange={session.setTransactionBusy} />;

            case 'products':
                return <ProductsManager user={session.user} />;
            case 'categories':
                return <CategoriesManager user={session.user} />;

            case 'customers':
                return <CustomersManager user={session.user} />;

            case 'suppliers':
                return <SuppliersManager user={session.user} />;

            case 'orders':
                return preview(<OrdersManager />);

            case 'inventory':
                return preview(<InventoryManager />);

            case 'reports':
                return preview(<Reports />);

            case 'settings':
                return preview(<Settings />);

            default:
                return preview(<Dashboard />);
        }
    };

    return (
        <SessionGate>{session => <MainLayout key={session.store._id}
            currentScreen={currentScreen}
            onScreenChange={screen => { if (!session.transactionBusy) setCurrentScreen(screen); }}
        >
            {renderScreen(session)}
        </MainLayout>}</SessionGate>
    );
}

export default App;