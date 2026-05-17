'use client';
import { useEffect, useState } from 'react';
import { authService } from '@/services';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import { Trash2, Shield, User } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    authService.getAllUsers().then(setUsers).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"?`)) return;
    await authService.deleteUser(id);
    fetchUsers();
  };

  const handleRoleChange = async (id: string, name: string, newRole: string) => {
    if (id === currentUser?._id) {
      alert('You cannot modify your own administrative role.');
      fetchUsers();
      return;
    }

    if (!confirm(`Are you sure you want to change the role of "${name}" to "${newRole}"?`)) {
      fetchUsers();
      return;
    }

    try {
      await authService.updateUserRole(id, newRole);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user role');
      fetchUsers();
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: '600' }}>Users Management</h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginTop: '4px' }}>{users.length} registered users</p>
      </div>

      {loading ? <LoadingSpinner /> : isMobile ? (
        /* ── Mobile Layout (Stacked Cards) ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {users.map((u: any) => (
            <div
              key={u._id}
              className="glass"
              style={{
                borderRadius: '16px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                border: '1px solid var(--color-border)',
                background: 'rgba(255,255,255,0.01)',
              }}
            >
              {/* Header Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg,#c9a84c,#e8c97a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.95rem', color: '#0d0d0d', flexShrink: 0 }}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--color-text)' }}>{u.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: '2px', wordBreak: 'break-all' }}>{u.email}</p>
                  </div>
                </div>
                
                {u._id !== currentUser?._id && u.role !== 'admin' && (
                  <button
                    onClick={() => handleDelete(u._id, u.name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      color: '#f87171',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              {/* Meta details & Role selectors */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem' }}>
                <div>
                  <span style={{ color: 'var(--color-muted)' }}>Joined: </span>
                  <span style={{ fontWeight: '500', color: 'var(--color-text)' }}>{new Date(u.createdAt).toLocaleDateString()}</span>
                </div>

                <div>
                  {u._id === currentUser?._id ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '600', background: 'rgba(201,168,76,0.1)', color: 'var(--color-accent)', border: '1px solid rgba(201,168,76,0.3)' }}>
                      <Shield size={10} /> {u.role} (You)
                    </span>
                  ) : (
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, u.name, e.target.value)}
                      style={{
                        background: u.role === 'admin' ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${u.role === 'admin' ? 'rgba(201,168,76,0.3)' : 'var(--color-border)'}`,
                        color: u.role === 'admin' ? 'var(--color-accent)' : 'var(--color-muted)',
                        borderRadius: '20px',
                        padding: '6px 14px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <option value="user" style={{ background: '#121212', color: 'var(--color-text)' }}>user</option>
                      <option value="admin" style={{ background: '#121212', color: 'var(--color-accent)' }}>admin</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── Desktop Layout (Full Table) ── */
        <div className="glass" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Name', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', color: 'var(--color-muted)', fontWeight: '500', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#c9a84c,#e8c97a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.8rem', color: '#0d0d0d', flexShrink: 0 }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: '500' }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--color-muted)' }}>{u.email}</td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      {u._id === currentUser?._id ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', background: 'rgba(201,168,76,0.1)', color: 'var(--color-accent)', border: '1px solid rgba(201,168,76,0.3)' }}>
                          <Shield size={10} /> {u.role} (You)
                        </span>
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, u.name, e.target.value)}
                          style={{
                            background: u.role === 'admin' ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${u.role === 'admin' ? 'rgba(201,168,76,0.3)' : 'var(--color-border)'}`,
                            color: u.role === 'admin' ? 'var(--color-accent)' : 'var(--color-muted)',
                            borderRadius: '20px',
                            padding: '4px 12px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            outline: 'none',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <option value="user" style={{ background: '#121212', color: 'var(--color-text)' }}>user</option>
                          <option value="admin" style={{ background: '#121212', color: 'var(--color-accent)' }}>admin</option>
                        </select>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--color-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      {u._id !== currentUser?._id && u.role !== 'admin' && (
                        <button onClick={() => handleDelete(u._id, u.name)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '4px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}>
                          <Trash2 size={12} /> Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
