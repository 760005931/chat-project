import { useState, useEffect, useRef } from 'react';
import { Card, Input, Button, List, Avatar, Badge, message } from 'antd';
import { SendOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import io from 'socket.io-client';
import './ChatRoom.css';

const { TextArea } = Input;

function ChatRoom({ username, onLogout }) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  // 自动滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 初始化 Socket.IO 连接
  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      message.success('已连接到服务器');
      // 发送登录信息
      newSocket.emit('user:login', username);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      message.error('与服务器断开连接');
    });

    newSocket.on('message:history', (history) => {
      setMessages(history);
    });

    newSocket.on('message:new', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    newSocket.on('users:update', (users) => {
      setOnlineUsers(users);
    });

    newSocket.on('error', (error) => {
      message.error(error);
    });

    return () => {
      newSocket.close();
    };
  }, [username]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) {
      return;
    }

    if (!isConnected) {
      message.error('未连接到服务器');
      return;
    }

    socket.emit('message:send', inputMessage.trim());
    setInputMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLogout = () => {
    if (socket) {
      socket.close();
    }
    onLogout();
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="chatroom-container">
      <div className="chatroom-main">
        <Card 
          className="chat-card"
          title={
            <div className="chat-header">
              <span>💬 聊天室</span>
              <div className="header-actions">
                <Badge 
                  status={isConnected ? 'success' : 'error'} 
                  text={isConnected ? '在线' : '离线'} 
                />
                <Button 
                  type="text" 
                  icon={<LogoutOutlined />} 
                  onClick={handleLogout}
                >
                  退出
                </Button>
              </div>
            </div>
          }
          bordered={false}
        >
          <div className="messages-container">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`message-item ${
                  msg.type === 'system' 
                    ? 'system-message' 
                    : msg.username === username 
                    ? 'own-message' 
                    : 'other-message'
                }`}
              >
                {msg.type === 'system' ? (
                  <div className="system-text">{msg.content}</div>
                ) : (
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-username">{msg.username}</span>
                      <span className="message-time">{formatTime(msg.timestamp)}</span>
                    </div>
                    <div className="message-text">{msg.content}</div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="input-container">
            <TextArea
              placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              autoSize={{ minRows: 1, maxRows: 4 }}
              maxLength={500}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              disabled={!isConnected}
            >
              发送
            </Button>
          </div>
        </Card>
      </div>
      
      <div className="users-sidebar">
        <Card 
          className="users-card"
          title={`在线用户 (${onlineUsers.length})`}
          bordered={false}
        >
          <List
            dataSource={onlineUsers}
            renderItem={(user) => (
              <List.Item className="user-item">
                <List.Item.Meta
                  avatar={
                    <Badge dot status="success">
                      <Avatar icon={<UserOutlined />} />
                    </Badge>
                  }
                  title={
                    <span className={user.username === username ? 'current-user' : ''}>
                      {user.username}
                      {user.username === username && ' (你)'}
                    </span>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </div>
    </div>
  );
}

export default ChatRoom;
