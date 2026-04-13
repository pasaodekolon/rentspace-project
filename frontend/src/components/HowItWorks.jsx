import React from 'react';

const HowItWorks = ({ onClose }) => {
    const steps = [
        {
            icon: '🔍',
            title: 'Найдите нужный товар',
            description: 'Просматривайте каталог, используйте фильтры и поиск, чтобы найти именно то, что вам нужно для вашего проекта или мероприятия.'
        },
        {
            icon: '📅',
            title: 'Выберите даты аренды',
            description: 'Укажите период, на который вам нужен товар. Система автоматически рассчитает стоимость аренды.'
        },
        {
            icon: '💬',
            title: 'Свяжитесь с владельцем',
            description: 'Используйте встроенный мессенджер для общения с арендодателем, обсуждения деталей и условий аренды.'
        },
        {
            icon: '✅',
            title: 'Подтвердите аренду',
            description: 'После согласования всех деталей, подтвердите заявку. Владелец получит уведомление и сможет подтвердить аренду.'
        },
        {
            icon: '📦',
            title: 'Получите товар',
            description: 'Встретьтесь с владельцем в удобное время, получите товар и наслаждайтесь его использованием!'
        },
        {
            icon: '⭐',
            title: 'Оставьте отзыв',
            description: 'После возврата товара оставьте отзыв и оценку. Это поможет другим пользователям сделать правильный выбор.'
        }
    ];

    const styles = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
            padding: '20px',
            overflowY: 'auto'
        },
        modal: {
            background: 'white',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
        },
        closeButton: {
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            fontSize: '30px',
            cursor: 'pointer',
            color: '#666',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.3s ease'
        },
        title: {
            fontSize: '36px',
            fontWeight: 'bold',
            marginBottom: '10px',
            color: '#6f4e37',
            textAlign: 'center'
        },
        subtitle: {
            fontSize: '18px',
            color: '#666',
            textAlign: 'center',
            marginBottom: '40px'
        },
        stepsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '25px',
            marginTop: '30px'
        },
        stepCard: {
            background: '#f7efe5',
            padding: '25px',
            borderRadius: '15px',
            border: '2px solid #e0e0e0',
            transition: 'all 0.3s ease',
            textAlign: 'center'
        },
        stepIcon: {
            fontSize: '50px',
            marginBottom: '15px'
        },
        stepTitle: {
            fontSize: '20px',
            fontWeight: '700',
            color: '#2d3748',
            marginBottom: '10px'
        },
        stepDescription: {
            fontSize: '14px',
            color: '#666',
            lineHeight: '1.6'
        },
        benefits: {
            marginTop: '40px',
            padding: '30px',
            background: '#8c6a4f',
            borderRadius: '15px',
            color: 'white'
        },
        benefitsTitle: {
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '20px',
            textAlign: 'center'
        },
        benefitsList: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            listStyle: 'none',
            padding: 0
        },
        benefitItem: {
            fontSize: '16px',
            padding: '10px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            backdropFilter: 'blur(10px)'
        }
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button 
                    style={styles.closeButton}
                    onClick={onClose}
                    onMouseEnter={(e) => {
                        e.target.style.background = '#f0f0f0';
                        e.target.style.color = '#333';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'none';
                        e.target.style.color = '#666';
                    }}
                >
                    ×
                </button>
                
                <h1 style={styles.title}>Как это работает</h1>
                <p style={styles.subtitle}>
                    Простой и удобный процесс аренды необычных вещей
                </p>

                <div style={styles.stepsGrid}>
                    {steps.map((step, index) => (
                        <div 
                            key={index}
                            style={styles.stepCard}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 10px 30px rgba(120, 94, 70, 0.2)';
                                e.currentTarget.style.borderColor = '#a67c52';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.borderColor = '#e0e0e0';
                            }}
                        >
                            <div style={styles.stepIcon}>{step.icon}</div>
                            <h3 style={styles.stepTitle}>{step.title}</h3>
                            <p style={styles.stepDescription}>{step.description}</p>
                        </div>
                    ))}
                </div>

                <div style={styles.benefits}>
                    <h2 style={styles.benefitsTitle}>Преимущества Рентли</h2>
                    <ul style={styles.benefitsList}>
                        <li style={styles.benefitItem}>✅ Безопасные сделки</li>
                        <li style={styles.benefitItem}>✅ Система рейтингов</li>
                        <li style={styles.benefitItem}>✅ Защита залога</li>
                        <li style={styles.benefitItem}>✅ Поддержка 24/7</li>
                        <li style={styles.benefitItem}>✅ Быстрая аренда</li>
                        <li style={styles.benefitItem}>✅ Тысячи товаров</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default HowItWorks;

