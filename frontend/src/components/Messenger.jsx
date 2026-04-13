import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Messenger = ({ onClose, recipientId = null, recipientUsername = null }) => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [selectedFileIsImage, setSelectedFileIsImage] = useState(false);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchConversations();
        if (recipientId) {
            selectConversation(recipientId, recipientUsername);
        }
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation);
            // Обновляем сообщения каждые 3 секунды
            const interval = setInterval(() => {
                fetchMessages(selectedConversation);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [selectedConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/messages/conversations/', {
                withCredentials: true
            });
            setConversations(response.data);

            // Если диалог открыли из шапки (без конкретного recipientId),
            // выбираем последний диалог автоматически.
            if (!recipientId && response.data?.length > 0) {
                const sorted = [...response.data]
                    .filter((c) => c?.last_message?.created_at)
                    .sort((a, b) => new Date(b.last_message.created_at) - new Date(a.last_message.created_at));
                const first = sorted[0] || response.data[0];
                setSelectedConversation(first.user_id);
            }
        } catch (error) {
            console.error('Ошибка загрузки диалогов:', error);
        }
    };

    const fetchMessages = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:8000/api/messages/with_user/?user_id=${userId}`, {
                withCredentials: true
            });
            setMessages(response.data);
        } catch (error) {
            console.error('Ошибка загрузки сообщений:', error);
        }
    };

    const selectConversation = (userId, username) => {
        setSelectedConversation(userId);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const isImage = file.type?.startsWith('image/');
            setSelectedFileIsImage(isImage);

            if (isImage) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFilePreview(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                setFilePreview(null);
            }
        }
    };

    const handleSendMessage = async () => {
        if ((!newMessage.trim() && !selectedFile) || !selectedConversation) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('recipient', selectedConversation);
            // Контент может быть пустым, если отправляем только вложение.
            formData.append('content', newMessage.trim());

            if (selectedFile) {
                if (selectedFileIsImage) {
                    formData.append('image', selectedFile);
                } else {
                    formData.append('attachment', selectedFile);
                }
            }

            await axios.post('http://localhost:8000/api/messages/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true
            });

            setNewMessage('');
            setSelectedFile(null);
            setSelectedFileIsImage(false);
            setFilePreview(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            fetchMessages(selectedConversation);
            fetchConversations();
        } catch (error) {
            console.error('Ошибка отправки сообщения:', error);
            alert('Ошибка отправки сообщения');
        } finally {
            setLoading(false);
        }
    };

    const getConversationUsername = (conversation) => {
        return conversation.username || 'Пользователь';
    };

    const getAttachmentNameFromUrl = (url) => {
        try {
            return url.split('/').filter(Boolean).pop() || 'Вложение';
        } catch {
            return 'Вложение';
        }
    };

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
            padding: '20px'
        },
        modal: {
            background: 'white',
            borderRadius: '15px',
            width: '90%',
            maxWidth: '900px',
            height: '80vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            overflow: 'hidden'
        },
        header: {
            padding: '20px',
            borderBottom: '2px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#8c6a4f',
            color: 'white'
        },
        closeButton: {
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            width: '35px',
            height: '35px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        content: {
            display: 'flex',
            flex: 1,
            overflow: 'hidden'
        },
        sidebar: {
            width: '300px',
            borderRight: '2px solid #e0e0e0',
            overflowY: 'auto',
            background: '#f8f9fa'
        },
        conversationItem: {
            padding: '15px',
            borderBottom: '1px solid #e0e0e0',
            cursor: 'pointer',
            transition: 'background 0.2s',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        conversationInfo: {
            flex: 1
        },
        conversationName: {
            fontWeight: '600',
            fontSize: '14px',
            color: '#333',
            marginBottom: '4px'
        },
        lastMessage: {
            fontSize: '12px',
            color: '#666',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
        },
        unreadBadge: {
            background: '#a67c52',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: '600'
        },
        chatArea: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
        },
        messagesList: {
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            background: '#f5f5f5'
        },
        message: {
            marginBottom: '15px',
            display: 'flex',
            flexDirection: 'column'
        },
        messageOwn: {
            alignItems: 'flex-end'
        },
        messageOther: {
            alignItems: 'flex-start'
        },
        messageBubble: {
            maxWidth: '70%',
            padding: '12px 16px',
            borderRadius: '18px',
            wordWrap: 'break-word'
        },
        messageOwnBubble: {
            background: '#a67c52',
            color: 'white'
        },
        messageOtherBubble: {
            background: 'white',
            color: '#333',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        },
        messageImage: {
            maxWidth: '100%',
            maxHeight: '300px',
            borderRadius: '12px',
            marginTop: '8px'
        },
        messageTime: {
            fontSize: '11px',
            color: '#999',
            marginTop: '4px',
            padding: '0 8px'
        },
        inputArea: {
            padding: '15px',
            borderTop: '2px solid #e0e0e0',
            background: 'white',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        },
        imagePreview: {
            maxWidth: '200px',
            maxHeight: '200px',
            borderRadius: '8px',
            marginBottom: '10px'
        },
        attachmentLink: {
            display: 'inline-block',
            marginTop: '8px',
            wordBreak: 'break-word',
            color: '#8a6442',
            textDecoration: 'underline'
        },
        inputRow: {
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
        },
        textInput: {
            flex: 1,
            padding: '12px',
            border: '2px solid #e0e0e0',
            borderRadius: '25px',
            fontSize: '14px',
            outline: 'none'
        },
        sendButton: {
            background: '#a67c52',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '25px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px'
        },
        imageButton: {
            background: '#f0f0f0',
            border: 'none',
            padding: '12px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '18px'
        },
        emptyState: {
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            fontSize: '16px'
        }
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <h2 style={{ margin: 0 }}>Сообщения</h2>
                    <button style={styles.closeButton} onClick={onClose}>×</button>
                </div>
                <div style={styles.content}>
                    <div style={styles.sidebar}>
                        {conversations.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                                Нет диалогов
                            </div>
                        ) : (
                            conversations.map((conv) => (
                                <div
                                    key={conv.user_id}
                                    style={{
                                        ...styles.conversationItem,
                                        background: selectedConversation === conv.user_id ? '#efe2d4' : 'transparent'
                                    }}
                                    onClick={() => selectConversation(conv.user_id, conv.username)}
                                >
                                    <div style={styles.conversationInfo}>
                                        <div style={styles.conversationName}>{conv.username}</div>
                                        {conv.last_message && (
                                            <div style={styles.lastMessage}>
                                                {conv.last_message.content || (conv.last_message.attachment ? '📎 Файл' : '📷 Фото')}
                                            </div>
                                        )}
                                    </div>
                                    {conv.unread_count > 0 && (
                                        <div style={styles.unreadBadge}>{conv.unread_count}</div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                    <div style={styles.chatArea}>
                        {selectedConversation ? (
                            <>
                                <div style={styles.messagesList}>
                                    {messages.map((msg) => {
                                        const isOwn = msg.sender === user.id;
                                        return (
                                            <div
                                                key={msg.id}
                                                style={{
                                                    ...styles.message,
                                                    ...(isOwn ? styles.messageOwn : styles.messageOther)
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        ...styles.messageBubble,
                                                        ...(isOwn ? styles.messageOwnBubble : styles.messageOtherBubble)
                                                    }}
                                                >
                                                    {msg.content}
                                                    {msg.image && (
                                                        <img
                                                            src={msg.image}
                                                            alt="Сообщение"
                                                            style={styles.messageImage}
                                                        />
                                                    )}
                                                    {msg.attachment && (
                                                        <a
                                                            href={msg.attachment}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            style={styles.attachmentLink}
                                                        >
                                                            {getAttachmentNameFromUrl(msg.attachment)}
                                                        </a>
                                                    )}
                                                </div>
                                                <div style={styles.messageTime}>
                                                    {new Date(msg.created_at).toLocaleTimeString('ru-RU', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>
                                <div style={styles.inputArea}>
                                    {(filePreview || selectedFile) && (
                                        <div>
                                            {selectedFileIsImage && filePreview && (
                                                <img src={filePreview} alt="Превью" style={styles.imagePreview} />
                                            )}
                                            {!selectedFileIsImage && selectedFile && (
                                                <div style={{ fontSize: '13px', color: '#666' }}>
                                                    {selectedFile.name}
                                                </div>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setSelectedFile(null);
                                                    setSelectedFileIsImage(false);
                                                    setFilePreview(null);
                                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                                }}
                                                style={{ marginLeft: '10px', cursor: 'pointer' }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                    <div style={styles.inputRow}>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            accept="*/*"
                                            onChange={handleFileSelect}
                                            style={{ display: 'none' }}
                                        />
                                        <button
                                            style={styles.imageButton}
                                            onClick={() => fileInputRef.current?.click()}
                                            title="Прикрепить файл или фото"
                                        >
                                            📎
                                        </button>
                                        <input
                                            type="text"
                                            style={styles.textInput}
                                            placeholder="Введите сообщение..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                        />
                                        <button
                                            style={styles.sendButton}
                                            onClick={handleSendMessage}
                                            disabled={loading || (!newMessage.trim() && !selectedFile)}
                                        >
                                            Отправить
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div style={styles.emptyState}>
                                Выберите диалог для начала общения
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Messenger;

