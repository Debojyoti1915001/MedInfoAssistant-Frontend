'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const router = useRouter();

  const handleLogout = () => {
    console.log('Logout clicked');
    router.push('/');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'reports', label: 'Reports', icon: '📄' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{
        width: isSidebarOpen ? '250px' : '0',
        backgroundColor: '#2c3e50',
        color: 'white',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        position: 'fixed',
        height: '100vh',
        zIndex: 1000
      }}>
        <div style={{ padding: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', marginBottom: '2rem' }}>
            Healthcare Menu
          </h2>
          
          <nav>
            {menuItems.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setActiveMenu(item.id);
                  console.log(`${item.label} clicked`);
                }}
                style={{
                  padding: '0.75rem 1rem',
                  marginBottom: '0.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: activeMenu === item.id ? '#3498db' : 'transparent',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
                onMouseOver={(e) => {
                  if (activeMenu !== item.id) {
                    e.currentTarget.style.backgroundColor = '#34495e';
                  }
                }}
                onMouseOut={(e) => {
                  if (activeMenu !== item.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: isSidebarOpen ? '250px' : '0',
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Header */}
        <header style={{
          backgroundColor: '#ffffff',
          padding: '1rem 2rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                fontSize: '1.5rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                color: '#333'
              }}
            >
              ☰
            </button>
            <h1 style={{
              margin: 0,
              fontSize: '1.5rem',
              color: '#333'
            }}>
              HealthCare Platform
            </h1>
          </div>
          
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1.5rem',
              fontSize: '1rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
          >
            Logout
          </button>
        </header>

        {/* Main Content Area */}
        <main style={{
          padding: '2rem',
          backgroundColor: '#f5f5f5',
          minHeight: 'calc(100vh - 73px)'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#333', marginTop: 0 }}>Welcome to Dashboard!</h2>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              You have successfully logged in. Use the sidebar menu to navigate through different sections.
            </p>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              Click the hamburger menu (☰) to toggle the sidebar.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
