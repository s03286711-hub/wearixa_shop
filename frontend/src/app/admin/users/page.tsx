'use client';
import '@/app/admin/animations.css';
import { useEffect, useState } from 'react';
import { authService } from '@/services';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import {
  Trash2, Shield, Users, UserCheck, UserX, Crown,
  Search, RefreshCw, ArrowUpRight, Mail, Calendar, Activity
} from 'lucide-react';

const getCardColorClass = (color: string) => {
  if (color === '#4ade80') return 'kpi-card-green';
  if (color === '#06b6d4') return 'kpi-card-cyan';
  if (color === '#a78bfa') return 'kpi-card-purple';
  return 'kpi-card'; // default gold
};

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'admin' | 'user'>('all');
  const { user: currentUser } = useAuth();

  const fetchUsers = () => {
    setLoading(true);
    authService.getAllUsers().then(setUsers).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove customer "${name}" from the CRM ledger?`)) return;
    await authService.deleteUser(id);
    fetchUsers();
  };

  const handleRoleChange = async (id: string, name: string, newRole: string) => {
    if (id === currentUser?._id) { alert('You cannot modify your own role.'); return; }
    if (!confirm(`Set role of "${name}" to "${newRole}"?`)) { fetchUsers(); return; }
    try { await authService.updateUserRole(id, newRole); fetchUsers(); }
    catch (err: any) { alert(err.response?.data?.message || 'Failed to update role'); fetchUsers(); }
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || u.role === filter;
    return matchSearch && matchFilter;
  });

  const admins = users.filter(u => u.role === 'admin').length;
  const regular = users.filter(u => u.role !== 'admin').length;

  const statCards = [
    { label: 'CRM_ACC_TOTAL', value: users.length, desc: 'Registered Accounts', Icon: Users, color: '#c9a84c', bg: 'rgba(201,168,76,0.08)', border: 'rgba(201,168,76,0.2)' },
    { label: 'ADMIN_NODES', value: admins, desc: 'Administrator Clearance', Icon: Crown, color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)' },
    { label: 'USER_ACCOUNTS', value: regular, desc: 'Standard Access Level', Icon: UserCheck, color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)' },
    { label: 'CRM_GROWTH', value: '+12%', desc: 'Month-over-Month', Icon: Activity, color: '#06b6d4', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.2)' },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      {/* ─ Header ─ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <Users size={20} style={{ color: 'var(--color-accent)', filter: 'drop-shadow(0 0 6px rgba(201,168,76,0.5))' }} />
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Customers CRM
            </h1>
          </div>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.72rem', fontFamily: 'monospace' }}>
            CRM_MODULE // ACCOUNT_DIRECTORY_ACTIVE
          </p>
        </div>
        <button onClick={fetchUsers}
          className="hover-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(201,168,76,0.2)', background: 'rgba(201,168,76,0.06)', color: 'var(--color-accent)', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'monospace', transition: 'all 0.2s' }}
        >
          <RefreshCw size={13} /> SYNC_CRM
        </button>
      </div>

      {/* ─ CRM Stat Cards ─ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {statCards.map(({ label, value, desc, Icon, color, bg, border }, i) => {
          return (
            <div 
              key={label} 
              className={`glass animate-fade-in-stagger ${getCardColorClass(color)}`}
              style={{
                animationDelay: `${i * 0.08}s`,
                borderRadius: '12px', padding: '1.25rem',
                background: 'rgba(13,13,13,0.5)',
                border: `1px solid ${border}`,
                position: 'relative', overflow: 'hidden',
                cursor: 'pointer'
              }}
            >
              <div style={{ position: 'absolute', top: 0, right: 0, width: '55px', height: '55px', background: bg, borderRadius: '0 0 0 55px', opacity: 0.6 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <p style={{ fontSize: '0.58rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em' }}>{label}</p>
              <div 
                className="kpi-icon-container"
                style={{ 
                  width: '30px', 
                  height: '30px', 
                  borderRadius: '8px', 
                  background: bg, 
                  border: `1px solid ${border}`, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Icon size={14} style={{ color }} />
              </div>
            </div>
            <p style={{ fontSize: '1.7rem', fontWeight: '800', color, fontFamily: 'monospace', lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: '0.67rem', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>{desc}</p>
          </div>
        )})}
      </div>

      {/* ─ Search & Filter Bar ─ */}
      <div className="glass" style={{ borderRadius: '12px', padding: '1rem 1.25rem', background: 'rgba(13,13,13,0.5)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.6rem 0.75rem 0.6rem 2.25rem', color: '#fff', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
            onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.35)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
          />
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['all', 'admin', 'user'] as const).map(f => (
            <button key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px', borderRadius: '6px', fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: '600', cursor: 'pointer', border: '1px solid', transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '0.06em',
                background: filter === f ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.03)',
                color: filter === f ? 'var(--color-accent)' : 'var(--color-muted)',
                borderColor: filter === f ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.06)',
              }}
            >
              {f === 'all' ? 'ALL' : f === 'admin' ? 'ADMINS' : 'USERS'}
            </button>
          ))}
        </div>
        <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)' }}>
          {filtered.length} RECORDS
        </span>
      </div>

      {/* ─ Customer Ledger ─ */}
      <div className="glass" style={{ borderRadius: '14px', overflow: 'hidden', background: 'rgba(13,13,13,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Desktop Table */}
        <div className="crm-table-wrap" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
                {['Customer', 'Contact', 'Access Level', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '0.85rem 1.25rem', textAlign: 'left', color: 'rgba(255,255,255,0.3)', fontWeight: '600', fontSize: '0.62rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.09em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u: any) => (
                <tr key={u._id}
                  className="ledger-row"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                >
                  {/* Customer Identity */}
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                        background: u.role === 'admin' ? 'linear-gradient(135deg,#c9a84c,#e8c97a)' : 'linear-gradient(135deg,#3b3b3b,#5a5a5a)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '700', fontSize: '0.85rem', color: u.role === 'admin' ? '#0d0d0d' : '#fff',
                        boxShadow: u.role === 'admin' ? '0 0 10px rgba(201,168,76,0.3)' : 'none'
                      }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight: '600', color: '#fff', fontSize: '0.85rem' }}>{u.name}</p>
                        {u._id === currentUser?._id && (
                          <span style={{ fontSize: '0.58rem', fontFamily: 'monospace', color: 'var(--color-accent)' }}>YOU</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>
                      <Mail size={12} style={{ flexShrink: 0 }} />
                      {u.email}
                    </div>
                  </td>

                  {/* Role */}
                  <td style={{ padding: '1rem 1.25rem' }}>
                    {u._id === currentUser?._id ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '20px', fontSize: '0.68rem', fontWeight: '700', fontFamily: 'monospace', background: 'rgba(201,168,76,0.1)', color: 'var(--color-accent)', border: '1px solid rgba(201,168,76,0.3)' }}>
                        <Shield size={10} /> ADMIN (YOU)
                      </span>
                    ) : (
                      <select value={u.role} onChange={e => handleRoleChange(u._id, u.name, e.target.value)}
                        style={{
                          background: u.role === 'admin' ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${u.role === 'admin' ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.1)'}`,
                          color: u.role === 'admin' ? 'var(--color-accent)' : 'rgba(255,255,255,0.6)',
                          borderRadius: '20px', padding: '4px 12px', fontSize: '0.72rem',
                          fontWeight: '700', fontFamily: 'monospace', cursor: 'pointer', outline: 'none', transition: 'all 0.2s'
                        }}>
                        <option value="user" style={{ background: '#121212' }}>USER</option>
                        <option value="admin" style={{ background: '#121212', color: '#c9a84c' }}>ADMIN</option>
                      </select>
                    )}
                  </td>

                  {/* Joined */}
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                      <Calendar size={11} />
                      {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {u._id !== currentUser?._id && u.role !== 'admin' && (
                        <button onClick={() => handleDelete(u._id, u.name)}
                          className="hover-btn-danger"
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '6px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', cursor: 'pointer', fontSize: '0.68rem', fontFamily: 'monospace', fontWeight: '700' }}
                        >
                          <Trash2 size={11} /> REMOVE
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <UserX size={32} style={{ color: 'var(--color-muted)', margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--color-muted)', fontFamily: 'monospace', fontSize: '0.8rem' }}>CRM_QUERY_EMPTY: No matching records found.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .crm-table-wrap table thead { display: none; }
          .crm-table-wrap table, .crm-table-wrap tbody, .crm-table-wrap tr, .crm-table-wrap td {
            display: block; width: 100%;
          }
          .crm-table-wrap tr {
            border: 1px solid rgba(255,255,255,0.06) !important;
            border-radius: 10px; margin-bottom: 0.75rem;
            background: rgba(255,255,255,0.01) !important;
          }
          .crm-table-wrap td { padding: 0.6rem 1rem !important; border: none !important; }
        }
      `}</style>
    </div>
  );
}
