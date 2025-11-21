import { useState, useEffect, useRef } from 'react';
import { Card, Input, Button, List, Avatar, Badge, message } from 'antd';
import { SendOutlined, LogoutOutlined, UserOutlined, CloseOutlined } from '@ant-design/icons';
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
  
  // 私聊相关状态
  const [activeTab, setActiveTab] = useState('public'); // 'public' 或 userId
  const [privateChatTabs, setPrivateChatTabs] = useState([]); // [{ userId, username }]
  const [privateMessages, setPrivateMessages] = useState({}); // { userId: [messages] }
  const [unreadCounts, setUnreadCounts] = useState({}); // { userId: count } 未读消息计数

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

    newSocket.on('message:private', (msg) => {
      // 接收私聊消息
      const otherUserId = msg.fromUsername === username ? msg.toUserId : msg.fromUserId;
      const otherUsername = msg.fromUsername === username ? msg.toUsername : msg.fromUsername;
      
      setPrivateMessages((prev) => ({
        ...prev,
        [otherUserId]: [...(prev[otherUserId] || []), msg]
      }));
      
      // 如果该用户的标签页不存在，自动创建
      setPrivateChatTabs((prev) => {
        if (!prev.find(tab => tab.userId === otherUserId)) {
          return [...prev, { userId: otherUserId, username: otherUsername }];
        }
        return prev;
      });
      
      // 如果收到的消息不是当前活动标签页，增加未读计数
      setActiveTab((currentTab) => {
        if (currentTab !== otherUserId) {
          setUnreadCounts((prev) => ({
            ...prev,
            [otherUserId]: (prev[otherUserId] || 0) + 1
          }));
        }
        return currentTab;
      });
    });

    newSocket.on('message:private:history', ({ targetUserId, messages }) => {
      // 接收私聊历史记录
      setPrivateMessages((prev) => ({
        ...prev,
        [targetUserId]: messages
      }));
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

    if (activeTab === 'public') {
      // 发送公共消息
      socket.emit('message:send', inputMessage.trim());
    } else {
      // 发送私聊消息
      socket.emit('message:private', {
        targetUserId: activeTab,
        content: inputMessage.trim()
      });
    }
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

  // 开启私聊
  const handleStartPrivateChat = (user) => {
    if (user.username === username) {
      return; // 不能和自己聊天
    }

    // 检查是否已经有该用户的标签页
    const existingTab = privateChatTabs.find(tab => tab.userId === user.id);
    if (!existingTab) {
      setPrivateChatTabs([...privateChatTabs, { userId: user.id, username: user.username }]);
      // 请求私聊历史记录
      socket.emit('message:private:history', { targetUserId: user.id });
    }
    // 切换到该用户的标签页
    setActiveTab(user.id);
    // 清除未读计数
    setUnreadCounts((prev) => {
      const newCounts = { ...prev };
      delete newCounts[user.id];
      return newCounts;
    });
  };

  // 关闭私聊标签页
  const handleClosePrivateChat = (userId, e) => {
    e.stopPropagation(); // 防止触发标签页切换
    setPrivateChatTabs(privateChatTabs.filter(tab => tab.userId !== userId));
    if (activeTab === userId) {
      setActiveTab('public'); // 切换回公共聊天
    }
  };

  // 获取当前显示的消息
  const getCurrentMessages = () => {
    if (activeTab === 'public') {
      return messages;
    } else {
      return privateMessages[activeTab] || [];
    }
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
          {/* 标签页 */}
          <div className="chat-tabs">
            <div 
              className={`chat-tab ${activeTab === 'public' ? 'active' : ''}`}
              onClick={() => setActiveTab('public')}
            >
              💬 公共聊天室
            </div>
            {privateChatTabs.map(tab => (
              <div 
                key={tab.userId}
                className={`chat-tab ${activeTab === tab.userId ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab.userId);
                  // 清除未读计数
                  setUnreadCounts((prev) => {
                    const newCounts = { ...prev };
                    delete newCounts[tab.userId];
                    return newCounts;
                  });
                }}
              >
                <Badge count={unreadCounts[tab.userId] || 0} offset={[10, 0]}>
                  👤 {tab.username}
                </Badge>
                <CloseOutlined 
                  className="tab-close-btn"
                  onClick={(e) => handleClosePrivateChat(tab.userId, e)}
                />
              </div>
            ))}
          </div>

          {/* 消息区域 */}
          <div className="messages-container">
            {getCurrentMessages().map((msg) => {
              // 私聊消息的显示逻辑
              if (msg.type === 'private') {
                const isOwnMessage = msg.fromUsername === username;
                return (
                  <div 
                    key={msg.id} 
                    className={`message-item ${isOwnMessage ? 'own-message' : 'other-message'}`}
                  >
                    <div className="message-content">
                      <div className="message-header">
                        <span className="message-username">
                          {isOwnMessage ? '我' : msg.fromUsername}
                        </span>
                        <span className="message-time">{formatTime(msg.timestamp)}</span>
                      </div>
                      <div className="message-text">{msg.content}</div>
                    </div>
                  </div>
                );
              }
              
              // 公共消息的显示逻辑
              return (
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
              );
            })}
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
              <List.Item 
                className={`user-item ${user.username !== username ? 'clickable' : ''}`}
                onClick={() => handleStartPrivateChat(user)}
                style={{ cursor: user.username !== username ? 'pointer' : 'default' }}
              >
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
