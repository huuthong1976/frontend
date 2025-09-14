import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import HeaderBar from '../layout/Header';
import Sidebar from '../layout/Sidebar';
import 'antd/dist/reset.css';

const { Sider, Header, Content } = Layout;

export default function MainLayout() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={260}
        theme="dark"
        breakpoint="lg"
        collapsedWidth={0}
        style={{ position: 'sticky', top: 0, height: '100vh' }}
      >
        <Sidebar />
      </Sider>

      <Layout>
        <Header style={{ background: '#fff', padding: 0 }}>
          <HeaderBar />
        </Header>

        <Content style={{ margin: 16 }}>
          <div style={{ background: '#fff', minHeight: 'calc(100vh - 112px)', borderRadius: 8, padding: 16 }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
