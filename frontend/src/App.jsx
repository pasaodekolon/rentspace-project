import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useSearchParams, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HeroBanner from './components/HeroBanner';
import ItemList from './components/ItemList';
import ItemDetail from './components/ItemDetail';
import Profile from './components/Profile';
import { useAuth } from './context/AuthContext';
import './App.css';

function MainContent({ refreshTrigger }) {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [filters, setFilters] = useState({});
    const searchQuery = searchParams.get('search') || '';
    const categoryParam = searchParams.get('category') || '';

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    // Обновляем фильтры при изменении параметров URL
    React.useEffect(() => {
        if (categoryParam) {
            setFilters(prev => ({ ...prev, category: categoryParam }));
        } else {
            // Если параметр категории убран из URL, очищаем фильтр категории
            setFilters(prev => {
                const { category, ...rest } = prev;
                return rest;
            });
        }
    }, [categoryParam]);

    return (
        <div style={styles.mainContent} className="app-main-content">
            <Sidebar onFilterChange={handleFilterChange} />
            <div style={styles.content} className="app-content">
                {!user && <HeroBanner />}
                <ItemList 
                    filters={filters} 
                    refreshTrigger={refreshTrigger}
                    searchQuery={searchQuery}
                />
            </div>
        </div>
    );
}

function App() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleItemAdded = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <AuthProvider>
            <Router>
                <div style={styles.app} className="app-root">
                    <Header onItemAdded={handleItemAdded} />
                    <Routes>
                        <Route path="/" element={<MainContent refreshTrigger={refreshTrigger} />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/item/:id" element={<ItemDetail />} />
                    </Routes>
                    <footer style={styles.footer} className="app-footer">
                        <div style={styles.footerInner} className="app-footer-inner">
                            <div style={styles.footerTop} className="app-footer-top">
                                <div style={styles.footerBrand} className="app-footer-brand">
                                    <div style={styles.footerTitle} className="app-footer-title">Рентли</div>
                                    <div style={styles.footerTagline} className="app-footer-tagline">Если аренда пошла не по плану, делаем вид что так и задумано.</div>
                                </div>
                                <div style={styles.footerNav} className="app-footer-nav">
                                    <a href="/" style={styles.footerNavLink} className="app-footer-link">Главная лента</a>
                                    <a href="/profile" style={styles.footerNavLink} className="app-footer-link">Личный лор</a>
                                    <a
                                        href="https://max.ru"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={styles.footerLink}
                                        className="app-footer-link app-footer-link-accent"
                                    >
                                        анти-кринж портал
                                    </a>
                                </div>
                            </div>
                            <div style={styles.footerBottom} className="app-footer-bottom">
                                <span>Сервис серьезный, подпись несерьезная.</span>
                                <span>© 2026 Рентли</span>
                            </div>
                        </div>
                    </footer>
                </div>
            </Router>
        </AuthProvider>
    );
}

const styles = {
    app: {
        minHeight: '100vh',
        background: '#f5efe6',
        display: 'flex',
        flexDirection: 'column'
    },
    mainContent: {
        width: '100%',
        padding: '30px 20px',
        display: 'flex',
        gap: '25px',
        boxSizing: 'border-box',
        flex: 1
    },
    content: {
        flex: 1
    },
    footer: {
        marginTop: 'auto',
        padding: '0',
        borderTop: '1px solid #6e4f37',
        background: '#2f241a',
        color: '#f0e5d8'
    },
    footerInner: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '22px 20px 14px'
    },
    footerTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '20px',
        flexWrap: 'wrap'
    },
    footerBrand: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
    },
    footerTitle: {
        fontSize: '18px',
        fontWeight: 700,
        letterSpacing: '0.4px'
    },
    footerTagline: {
        fontSize: '14px',
        color: '#d9c3ad',
        maxWidth: '580px'
    },
    footerNav: {
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        flexWrap: 'wrap'
    },
    footerNavLink: {
        color: '#f0e5d8',
        textDecoration: 'none',
        fontSize: '14px'
    },
    footerLink: {
        color: '#ffcf7d',
        fontWeight: 700,
        textDecoration: 'none',
        borderBottom: '1px dashed #ffcf7d'
    },
    footerBottom: {
        marginTop: '14px',
        paddingTop: '12px',
        borderTop: '1px solid #4d3928',
        display: 'flex',
        justifyContent: 'space-between',
        gap: '10px',
        flexWrap: 'wrap',
        fontSize: '13px',
        color: '#c5ac93'
    }
};

export default App;