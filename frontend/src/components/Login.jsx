import { useState } from 'react';
import { Card, Input, Button, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import './Login.css';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!username.trim()) {
      message.warning('请输入用户名');
      return;
    }

    if (username.trim().length < 2) {
      message.warning('用户名至少需要2个字符');
      return;
    }

    setLoading(true);
    // 模拟登录延迟
    setTimeout(() => {
      onLogin(username.trim());
      setLoading(false);
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card" bordered={false}>
        <div className="login-header">
          <h1>💬 欢迎来到聊天室</h1>
          <p>输入您的用户名开始聊天</p>
        </div>
        <div className="login-form">
          <Input
            size="large"
            placeholder="请输入用户名"
            prefix={<UserOutlined />}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            maxLength={20}
          />
          <Button
            type="primary"
            size="large"
            block
            loading={loading}
            onClick={handleSubmit}
          >
            进入聊天室
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default Login;
