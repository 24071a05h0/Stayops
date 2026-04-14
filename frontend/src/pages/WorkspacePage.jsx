import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, ProgressBar } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { 
  Trash2, ThumbsUp, ThumbsDown, CheckCircle2, XCircle, 
  Notebook, CheckSquare, ArrowLeft, Sparkles, Filter, MoreVertical,
  Circle, CheckCircle, Clock, ChevronDown, Check
} from 'lucide-react';
import api from '../services/api';

const WorkspacePage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [todos, setTodos] = useState([]);
  const [noteContent, setNoteContent] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Todo form states
  const [taskInput, setTaskInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [priorityInput, setPriorityInput] = useState('Medium');
  const [costInput, setCostInput] = useState('');

  useEffect(() => {
    fetchWorkspaceData();
  }, []);

  const fetchWorkspaceData = async () => {
    try {
      const todoRes = await api.get('/api/workspace/todos');
      setTodos(todoRes.data);

      const noteRes = await api.get('/api/workspace/note');
      if (noteRes.data) {
        setNoteContent(noteRes.data.content);
      }
      setTimeout(() => setIsInitialLoad(false), 500);
    } catch (error) {
      console.error('Error fetching workspace data', error);
      setIsInitialLoad(false);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    try {
      const res = await api.post('/api/workspace/todos', {
        task: taskInput,
        description: descInput,
        priority: priorityInput,
        repairCost: costInput || 0
      });
      setTodos([res.data, ...todos]);
      setTaskInput('');
      setDescInput('');
      setPriorityInput('Medium');
      setCostInput('');
    } catch (error) {
      console.error('Error adding todo', error);
    }
  };

  const handleUpdateTodoStatus = async (id, status) => {
    try {
      const res = await api.put(`/api/workspace/todos/${id}`, { status });
      setTodos(todos.map(t => t._id === id ? res.data : t));
    } catch (error) {
      console.error('Error updating todo status', error);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await api.delete(`/api/workspace/todos/${id}`);
      setTodos(todos.filter(t => t._id !== id));
    } catch (error) {
      console.error('Error deleting todo', error);
    }
  };

  // Debounced note saving
  useEffect(() => {
    if (isInitialLoad) return;
    const delayDebounceFn = setTimeout(async () => {
      setIsSavingNote(true);
      try {
        await api.put('/api/workspace/note', { content: noteContent });
      } catch (error) {
        console.error('Error saving note', error);
      } finally {
        setTimeout(() => setIsSavingNote(false), 500);
      }
    }, 1000);
    return () => clearTimeout(delayDebounceFn);
  }, [noteContent]);

  // Calculations for Stats
  const totalTasks = todos.length;
  const activeTasks = todos.filter(t => t.status !== 'Complete').length;
  const doneTasks = todos.filter(t => t.status === 'Complete').length;
  const percentDone = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Filtered & Sorted Todos
  const filteredTodos = todos
    .filter(t => {
      if (activeFilter === 'All') return true;
      if (activeFilter === 'Active') return t.status !== 'Complete';
      if (activeFilter === 'Completed') return t.status === 'Complete';
      return true;
    })
    .sort((a, b) => {
      const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
      const weightA = priorityOrder[a.priority] || 4;
      const weightB = priorityOrder[b.priority] || 4;
      
      // Sort by priority first
      if (weightA !== weightB) return weightA - weightB;
      // Then by creation date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <Container fluid style={{ background: '#f8f9fe', minHeight: '100vh', padding: '2rem' }}>
      
      {/* Navigation Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 42, height: 42, borderRadius: 12,
            background: '#ffffff', border: '1px solid rgba(67,24,255,0.15)',
            color: '#4318FF', cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: '0 4px 12px rgba(67,24,255,0.05)'
          }}
        >
          <ArrowLeft size={22} strokeWidth={2.5} />
        </button>
        <div style={{ width: 2, height: 32, background: 'rgba(67,24,255,0.1)', borderRadius: 2 }} />
        <CheckSquare size={32} color="#4318FF" strokeWidth={2.5} />
        <h2 style={{ fontWeight: 800, color: '#1B2559', margin: 0, fontSize: '2rem' }}>Personal Workspace</h2>
      </div>

      <Row className="g-4">
        {/* TO-DO SECTION (Image 1 Style) */}
        <Col lg={8}>
          {/* Main Task Card */}
          <div style={{
            background: 'linear-gradient(135deg, #4318FF, #7B5FFF)',
            borderRadius: 32,
            padding: '3rem 2.5rem',
            boxShadow: '0 20px 40px rgba(67, 24, 255, 0.25)',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '2rem'
          }}>
            {/* Decorative background shapes */}
            <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ position: 'absolute', bottom: -100, left: -50, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '0.5rem' }}>
                <Sparkles color="#fff" size={28} />
                <h1 style={{ color: '#fff', fontSize: '3rem', fontWeight: 900, letterSpacing: '-1px', margin: 0 }}>My Tasks</h1>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '2.5rem' }}>Stay organized, stay productive.</p>

              {/* Input Form Card */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: 24,
                padding: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <Form onSubmit={handleAddTodo}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                    <Form.Control 
                      type="text" 
                      placeholder="Add a new task..." 
                      value={taskInput}
                      onChange={(e) => setTaskInput(e.target.value)}
                      style={{ 
                        flex: 1, height: 48, borderRadius: 12, padding: '12px 18px', border: 'none', 
                        background: 'rgba(255,255,255,0.95)', fontWeight: 600, color: '#1B2559' 
                      }}
                    />
                    <div style={{ position: 'relative', width: 160 }}>
                      <Form.Select 
                        value={priorityInput}
                        onChange={(e) => setPriorityInput(e.target.value)}
                        style={{ 
                          width: '100%', height: 48, borderRadius: 12, border: 'none', 
                          background: 'rgba(255,255,255,0.95)', 
                          fontWeight: 700, color: '#1B2559',
                          padding: '0 35px 0 15px',
                          cursor: 'pointer',
                          appearance: 'none'
                        }}
                      >
                        <option value="Low">🔵 Low</option>
                        <option value="Medium">🟡 Medium</option>
                        <option value="High">🔴 High</option>
                      </Form.Select>
                      <ChevronDown 
                        size={18} 
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#1B2559' }} 
                      />
                    </div>
                  </div>
                  <Form.Control 
                    type="text" 
                    placeholder="Optional description..." 
                    value={descInput}
                    onChange={(e) => setDescInput(e.target.value)}
                    style={{ 
                      borderRadius: 12, padding: '12px 18px', border: 'none', 
                      background: 'rgba(255,255,255,0.9)', fontWeight: 500, color: '#1B2559',
                      marginBottom: 12 
                    }}
                  />
                  {user?.role === 'Warden' && (
                    <Form.Control 
                      type="number" 
                      placeholder="Repair Cost (₹) (Optional)" 
                      value={costInput}
                      onChange={(e) => setCostInput(e.target.value)}
                      style={{ 
                        borderRadius: 12, padding: '12px 18px', border: 'none', 
                        background: 'rgba(255,255,255,0.9)', fontWeight: 500, color: '#1B2559',
                        marginBottom: 12 
                      }}
                    />
                  )}
                  <button 
                    type="submit" 
                    style={{
                      width: '100%', 
                      background: '#FFFFFF', 
                      color: '#4318FF', 
                      border: 'none',
                      borderRadius: 12, 
                      padding: '14px', 
                      fontWeight: 800, 
                      fontSize: '1.1rem',
                      boxShadow: '0 8px 25px rgba(255, 255, 255, 0.2)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: 10,
                      marginTop: '8px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                      e.currentTarget.style.boxShadow = '0 12px 30px rgba(255, 255, 255, 0.3)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.background = '#FFFFFF';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 255, 255, 0.2)';
                    }}
                  >
                    <Sparkles size={20} color="#4318FF" /> 
                    <span style={{ color: '#4318FF', display: 'inline-block' }}>ADD NEW TASK</span>
                  </button>
                </Form>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <Row className="g-3 mb-4">
            {[
              { label: 'TOTAL', value: totalTasks },
              { label: 'ACTIVE', value: activeTasks },
              { label: 'DONE', value: doneTasks },
              { label: '% DONE', value: `${percentDone}%` },
            ].map((stat, i) => (
              <Col key={i}>
                <div style={{
                  background: '#fff', borderRadius: 20, padding: '1.5rem',
                  textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
                  border: '1px solid rgba(0,0,0,0.03)'
                }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1B2559' }}>{stat.value}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#A3AED0', letterSpacing: '1px' }}>{stat.label}</div>
                </div>
              </Col>
            ))}
          </Row>

          {/* Filter Tabs */}
          <div style={{
            background: '#fff', borderRadius: 20, padding: '0.6rem',
            display: 'flex', gap: 8, marginBottom: '1.5rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.03)'
          }}>
            {['All', 'Active', 'Completed'].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                style={{
                  flex: 1, padding: '10px', borderRadius: 14, border: 'none',
                  fontWeight: 800, fontSize: '0.9rem',
                  background: activeFilter === filter ? '#4318FF' : 'transparent',
                  color: activeFilter === filter ? '#fff' : '#718EBF',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}
              >
                {filter === 'All' && <Filter size={16} />}
                {filter} <span style={{ 
                  background: activeFilter === filter ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
                  padding: '2px 8px', borderRadius: 8, fontSize: '0.75rem'
                }}>
                  {filter === 'All' ? totalTasks : filter === 'Active' ? activeTasks : doneTasks}
                </span>
              </button>
            ))}
          </div>

          {/* Task List Header */}
          <h5 style={{ fontWeight: 800, color: '#1B2559', marginBottom: '1rem' }}>
            {activeFilter.toUpperCase()} TASKS ({filteredTodos.length})
          </h5>

          {/* Task Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredTodos.map(todo => {
              const isComplete = todo.status === 'Complete';
              return (
                <div key={todo._id} style={{
                  background: '#fff', borderRadius: 24, padding: '1.2rem 1.5rem',
                  display: 'flex', alignItems: 'center', gap: 16,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.01)', border: '1px solid rgba(0,0,0,0.03)',
                  transition: 'all 0.3s'
                }}>
                  <div 
                    onClick={() => handleUpdateTodoStatus(todo._id, isComplete ? 'Pending' : 'Complete')}
                    style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                  >
                    {isComplete ? <CheckCircle size={28} color="#10b981" weight="fill" /> : <Circle size={28} color="#A3AED0" />}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ 
                        fontWeight: 700, fontSize: '1.1rem', color: isComplete ? '#A3AED0' : '#1B2559',
                        textDecoration: isComplete ? 'line-through' : 'none'
                      }}>
                        {todo.task}
                      </span>
                      {todo.priority && (
                        <span style={{
                          fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: 6,
                          background: todo.priority === 'High' ? '#fee2e2' : todo.priority === 'Medium' ? '#fef3c7' : '#dcfce7',
                          color: todo.priority === 'High' ? '#ef4444' : todo.priority === 'Medium' ? '#f59e0b' : '#10b981'
                        }}>
                          {todo.priority.toUpperCase()}
                        </span>
                      )}
                    </div>
                    {todo.description && (
                      <div style={{ fontSize: '0.9rem', color: '#718EBF', marginTop: 2 }}>{todo.description}</div>
                    )}
                    {todo.repairCost > 0 && (
                      <div style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 700, marginTop: 4 }}>
                        Cost: ₹{todo.repairCost}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    {!isComplete && (
                      <button 
                        onClick={() => handleUpdateTodoStatus(todo._id, 'Complete')}
                        title="Mark Done"
                        style={{ 
                          border: 'none', 
                          background: '#10b981', 
                          color: '#fff', 
                          padding: '6px 14px', 
                          borderRadius: 10, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          gap: 6,
                          fontWeight: 700,
                          fontSize: '0.85rem'
                        }}
                      >
                        <Check size={16} strokeWidth={3} /> Done
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteTodo(todo._id)}
                      title="Delete"
                      style={{ border: 'none', background: 'rgba(0,0,0,0.03)', color: '#718EBF', width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
            
            {filteredTodos.length === 0 && (
              <div style={{ 
                textAlign: 'center', padding: '5rem 0', background: '#fff', borderRadius: 24,
                border: '2px dashed #E2E8F0'
              }}>
                <div style={{ marginBottom: '1.5rem' }}>
                   <img src="https://cdn-icons-png.flaticon.com/512/5089/5089748.png" alt="Empty" style={{ width: 120, opacity: 0.5 }} />
                </div>
                <h4 style={{ fontWeight: 800, color: '#1B2559' }}>No tasks found</h4>
                <p style={{ color: '#718EBF', fontWeight: 600 }}>Enjoy your free time!</p>
              </div>
            )}
          </div>
        </Col>

        {/* SCRATCHPAD NOTES SECTION (StayOps style) */}
        <Col lg={4}>
          <div style={{
            background: '#fff', borderRadius: 32, padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.03)',
            height: '100%', minHeight: '80vh', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(67,24,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Notebook size={24} color="#4318FF" />
                </div>
                <h4 style={{ fontWeight: 800, color: '#1B2559', margin: 0 }}>Scratchpad</h4>
              </div>
              {isSavingNote && <div className="spinner-border spinner-border-sm text-primary" role="status"><span className="visually-hidden">Loading...</span></div>}
            </div>

            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Start typing your notes here..."
              style={{
                flex: 1, width: '100%', border: 'none', resize: 'none', outline: 'none',
                fontSize: '1.1rem', color: '#1B2559', lineHeight: 1.6, padding: '1.5rem',
                background: 'rgba(67,24,255,0.01)', borderRadius: 20, fontFamily: 'inherit',
                fontWeight: 500
              }}
            />
            
            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: 8, color: '#A3AED0', fontSize: '0.85rem', fontWeight: 700 }}>
              <Clock size={16} /> 
              {isSavingNote ? 'Syncing with StayOps...' : 'All notes are auto-saved'}
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default WorkspacePage;
