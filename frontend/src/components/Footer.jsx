import React from 'react';

const Footer = () => {
    return (
        <footer style={styles.footer}>
            <div style={styles.footerContent}>
                <div style={styles.footerSection}>
                    <h4 style={styles.footerTitle}>🎯 Рентли</h4>
                    <p style={styles.footerText}>
                        Арендуй необычные вещи и получай незабываемые впечатления!
                    </p>
                </div>
                
                <div style={styles.footerSection}>
                    <h4 style={styles.footerTitle}>🔍 Навигация</h4>
                    <a href="#" style={styles.footerLink}>Главная</a>
                    <a href="#" style={styles.footerLink}>Категории</a>
                    <a href="#" style={styles.footerLink}>О проекте</a>
                    <a href="#" style={styles.footerLink}>Контакты</a>
                </div>
                
                <div style={styles.footerSection}>
                    <h4 style={styles.footerTitle}>💼 Для бизнеса</h4>
                    <a href="#" style={styles.footerLink}>Стать арендодателем</a>
                    <a href="#" style={styles.footerLink}>Реклама</a>
                    <a href="#" style={styles.footerLink}>Партнерство</a>
                </div>
                
                <div style={styles.footerSection}>
                    <h4 style={styles.footerTitle}>📞 Контакты</h4>
                    <p style={styles.footerText}>📧 support@oddrent.com</p>
                    <p style={styles.footerText}>📱 +7 (999) 123-45-67</p>
                    <div style={styles.socialLinks}>
                        <span style={styles.socialIcon}>📘</span>
                        <span style={styles.socialIcon}>🐦</span>
                        <span style={styles.socialIcon}>📷</span>
                    </div>
                </div>
            </div>
            
            <div style={styles.footerBottom}>
                <div style={styles.funnyMessages}>
                    <span>🚀 Сделано с любовью к шерингу</span>
                    <span>💡 Идея: арендуй всё, что хочешь!</span>
                    <span>🎯 Лучшие вещи для лучших моментов</span>
                </div>
                <div style={styles.copyright}>
                    © 2024 Рентли. Все права защищены. 
                    <span style={styles.legal}> | Политика конфиденциальности | Условия использования</span>
                </div>
            </div>
        </footer>
    );
};

const styles = {
    footer: {
        width: '100%',
        background: '#7a5a3d',
        color: 'white',
        marginTop: 'auto',
        padding: '40px 0 20px',
        boxSizing: 'border-box'
    },
    footerContent: {
        width: '100%',
        maxWidth: '100%',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '30px',
        padding: '0 20px'
    },
    footerSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    footerTitle: {
        fontSize: '18px',
        fontWeight: '700',
        marginBottom: '10px'
    },
    footerText: {
        fontSize: '14px',
        opacity: '0.8',
        lineHeight: '1.5'
    },
    footerLink: {
        color: 'white',
        textDecoration: 'none',
        fontSize: '14px',
        opacity: '0.8',
        transition: 'opacity 0.3s ease'
    },
    socialLinks: {
        display: 'flex',
        gap: '15px',
        marginTop: '10px'
    },
    socialIcon: {
        fontSize: '20px',
        cursor: 'pointer',
        transition: 'transform 0.3s ease'
    },
    footerBottom: {
        width: '100%',
        maxWidth: '100%',
        margin: '30px auto 0',
        padding: '20px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        textAlign: 'center'
    },
    funnyMessages: {
        display: 'flex',
        justifyContent: 'center',
        gap: '30px',
        marginBottom: '15px',
        flexWrap: 'wrap'
    },
    copyright: {
        fontSize: '12px',
        opacity: '0.6'
    },
    legal: {
        marginLeft: '10px'
    }
};

export default Footer;