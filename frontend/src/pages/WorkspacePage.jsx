import React, { useState, useEffect, useContext, useRef } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { Trash2, ThumbsUp, ThumbsDown, CheckCircle2, XCircle, Notebook, CheckSquare, Sparkles, Plus, ClipboardList, CheckSquare as CheckSquareIcon } from 'lucide-react';
import api from '../services/api';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const WorkspacePage = () => {
  const { user } = useContext(AuthContext);
  
  const [todos, setTodos] = useState([]);
  const [noteContent, setNoteContent] = useState('');
  
  // Todo form
  const [taskInput, setTaskInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [priorityInput, setPriorityInput] = useState('Medium');
  const [categoryInput, setCategoryInput] = useState('Personal');
  const [filterMode, setFilterMode] = useState('All'); // All, Active, Completed

  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Stats
  const totalTasks = todos.length;
  const doneTasks = todos.filter(t => t.status === 'Complete').length;
  const activeTasks = totalTasks - doneTasks;
  const percentDone = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  const filteredTodos = todos.filter(t => {
    if (filterMode === 'Active') return t.status !== 'Complete';
    if (filterMode === 'Completed') return t.status === 'Complete';
    return true;
  });

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
        description: descriptionInput,
        priority: priorityInput,
        category: categoryInput,
        repairCost: 0
      });
      setTodos([res.data, ...todos]);
      setTaskInput('');
      setDescriptionInput('');
      setPriorityInput('Medium');
      setCategoryInput('Personal');
    } catch (error) {
      console.error('Error adding todo', error);
    }
  };

  const handleToggleTodo = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Complete' ? 'Pending' : 'Complete';
    try {
      const res = await api.put(`/api/workspace/todos/${id}`, { status: newStatus });
      setTodos(todos.map(t => t._id === id ? res.data : t));
    } catch (error) {
      console.error('Error toggling todo status', error);
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

  // Quill Toolbar Modules
  const quillModules = {
    toolbar: [
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'header': 1 }, { 'header': 2 }, 'blockquote', 'code-block'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  const renderPriorityDot = (priority) => {
    const color = priority === 'High' ? '#ef4444' : priority === 'Medium' ? '#3b82f6' : '#10b981';
    return <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: color, marginRight: 6 }}></span>;
  };

  return (
    <Container fluid style={{ maxWidth: 1400, marginTop: '2rem', paddingBottom: '4rem' }}>
      <Row className="g-4">
        {/* TO-DO LIST COLUMN */}
        <Col lg={6} xl={5}>
          <div style={{
            background: 'linear-gradient(145deg, #6366f1, #4f46e5)',
            borderRadius: 24,
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(79, 70, 229, 0.25)',
            color: '#fff',
            minHeight: '82vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.5rem' }}>
              <Sparkles size={24} color="#fff" />
              <h2 style={{ fontWeight: 800, margin: 0, fontSize: '2rem', letterSpacing: '-0.5px' }}>My Tasks</h2>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', marginBottom: '2rem' }}>Stay organized, stay productive.</p>

            {/* Add Task Form */}
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 16,
              padding: '1.2rem',
              marginBottom: '1.5rem',
              backdropFilter: 'blur(10px)'
            }}>
              <Form onSubmit={handleAddTodo}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <Form.Control
                    type="text"
                    placeholder="Add a new task..."
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    style={{
                      flex: 1, padding: '12px 16px', borderRadius: 10, border: 'none',
                      background: '#f4f6f8', fontSize: '0.95rem', color: '#1B2559',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  />
                  <select
                    value={priorityInput}
                    onChange={(e) => setPriorityInput(e.target.value)}
                    style={{
                      padding: '0 16px', borderRadius: 10, border: 'none',
                      background: '#f4f6f8', fontSize: '0.9rem', color: '#1B2559',
                      fontWeight: 600, outline: 'none', cursor: 'pointer'
                    }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                  <select
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    style={{
                      padding: '0 12px', borderRadius: 10, border: 'none',
                      background: '#f4f6f8', fontSize: '0.85rem', color: '#4318FF',
                      fontWeight: 700, outline: 'none', cursor: 'pointer'
                    }}
                  >
                    <option value="Personal">🏠 Personal</option>
                    <option value="Work">💼 Work</option>
                    <option value="Shopping">🛒 Shopping</option>
                    <option value="Health">💪 Health</option>
                    <option value="Urgent">⚠️ Urgent</option>
                  </select>
                </div>
                
                <Form.Control
                  type="text"
                  placeholder="Optional description..."
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 10, border: 'none',
                    background: '#f4f6f8', fontSize: '0.9rem', color: '#1B2559',
                    marginBottom: 14, boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                  }}
                />
                
                <button 
                  type="submit" 
                  disabled={!taskInput.trim()} 
                  style={{
                    width: '100%', 
                    background: taskInput.trim() ? '#fff' : 'rgba(255,255,255,0.2)', 
                    color: taskInput.trim() ? '#4f46e5' : 'rgba(255,255,255,0.6)', 
                    border: 'none',
                    borderRadius: 10, 
                    padding: '12px', 
                    fontWeight: 800, 
                    fontSize: '1rem',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: 8,
                    boxShadow: taskInput.trim() ? '0 4px 12px rgba(0,0,0,0.1)' : 'none', 
                    transition: 'all 0.2s',
                    cursor: taskInput.trim() ? 'pointer' : 'not-allowed'
                  }}
                  onMouseOver={(e) => { if(taskInput.trim()) e.currentTarget.style.transform = 'scale(1.02)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <Plus size={18} strokeWidth={3} /> Add Task
                </button>
              </Form>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: '1.5rem' }}>
              {[
                { label: 'TOTAL', val: totalTasks },
                { label: 'ACTIVE', val: activeTasks },
                { label: 'DONE', val: doneTasks },
                { label: '% DONE', val: `${percentDone}%`, color: '#4318FF' }
              ].map((stat, i) => (
                <div key={i} style={{
                  background: '#fff', borderRadius: 12, padding: '12px 8px',
                  textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ fontWeight: 900, fontSize: '1.4rem', color: stat.color || '#4318FF', lineHeight: 1.2 }}>
                    {stat.val}
                  </div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#718EBF', letterSpacing: '0.5px' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', background: 'rgba(255,255,255,0.1)', padding: 6, borderRadius: 12 }}>
              {['All', 'Active', 'Completed'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  style={{
                    flex: 1, padding: '8px 0', border: 'none', borderRadius: 8,
                    background: filterMode === mode ? '#4318FF' : 'transparent',
                    color: filterMode === mode ? '#fff' : 'rgba(255,255,255,0.8)',
                    fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                  }}
                >
                  {mode === 'All' && <ClipboardList size={16} />}
                  {mode === 'Active' && <CheckSquareIcon size={16} />}
                  {mode === 'Completed' && <CheckCircle2 size={16} />}
                  {mode} {mode === 'All' ? totalTasks : mode === 'Active' ? activeTasks : doneTasks}
                </button>
              ))}
            </div>

            <div style={{ fontWeight: 800, fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1rem', color: 'rgba(255,255,255,0.9)' }}>
              {filterMode} Tasks ({filteredTodos.length})
            </div>

            {/* Task List */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredTodos.map(todo => (
                <div key={todo._id} style={{
                  background: todo.status === 'Complete' ? 'rgba(255,255,255,0.85)' : '#fff',
                  borderRadius: 14, padding: '14px 16px',
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  opacity: todo.status === 'Complete' ? 0.75 : 1,
                  transition: 'all 0.2s'
                }}>
                  {/* Custom Checkbox */}
                  <div
                    onClick={() => handleToggleTodo(todo._id, todo.status)}
                    style={{
                      width: 22, height: 22, borderRadius: 6,
                      border: todo.status === 'Complete' ? 'none' : '2px solid #E2E8F0',
                      background: todo.status === 'Complete' ? '#10b981' : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', flexShrink: 0, marginTop: 2,
                      transition: 'all 0.2s'
                    }}
                  >
                    {todo.status === 'Complete' && <CheckCircle2 size={16} color="#fff" />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: 700, color: '#1B2559', fontSize: '1.05rem',
                      textDecoration: todo.status === 'Complete' ? 'line-through' : 'none',
                      lineHeight: 1.3, marginBottom: 4
                    }}>
                      {todo.task}
                    </div>
                    {todo.description && (
                      <div style={{ color: '#718EBF', fontSize: '0.85rem', lineHeight: 1.4, marginBottom: 8 }}>
                        {todo.description}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.7rem', fontWeight: 600, color: '#A3BED9' }}>
                        {renderPriorityDot(todo.priority)} {todo.priority} Priority
                      </div>
                      <div style={{ 
                        fontSize: '0.65rem', fontWeight: 800, color: '#4318FF', 
                        background: 'rgba(67,24,255,0.06)', padding: '2px 8px', borderRadius: 6,
                        textTransform: 'uppercase', letterSpacing: '0.5px'
                      }}>
                        {todo.category || 'Personal'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteTodo(todo._id)}
                    style={{
                      background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 8,
                      width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.children[0].style.color = '#fff'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.children[0].style.color = '#ef4444'; }}
                  >
                    <Trash2 size={16} color="#ef4444" style={{ transition: 'color 0.2s' }} />
                  </button>
                </div>
              ))}

              {filteredTodos.length === 0 && (
                <div style={{
                  background: 'rgba(255,255,255,0.1)', borderRadius: 16, border: '2px dashed rgba(255,255,255,0.2)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '3rem 2rem', textAlign: 'center', minHeight: 200
                }}>
                  <ClipboardList size={48} color="rgba(255,255,255,0.4)" style={{ marginBottom: 16 }} />
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 6 }}>All caught up!</div>
                  <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>There are no {filterMode.toLowerCase()} tasks here.</div>
                </div>
              )}
            </div>
          </div>
        </Col>

        {/* SCRATCHPAD RICH TEXT EDITOR */}
        <Col lg={6} xl={7}>
          <div style={{
            background: '#ffffff',
            borderRadius: 24,
            padding: '2rem',
            border: '1px solid rgba(67,24,255,0.08)',
            boxShadow: '0 8px 30px rgba(67,24,255,0.05)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: '82vh'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h4 style={{ fontWeight: 800, color: '#1B2559', margin: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.6rem' }}>
                <Notebook size={24} color="#4318FF" /> Scratchpad
              </h4>
              {isSavingNote && <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={14}/> Autosaved</span>}
            </div>

            <div className="rich-text-container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <ReactQuill
                theme="snow"
                value={noteContent}
                onChange={setNoteContent}
                modules={quillModules}
                placeholder="Type your notes, reminders, or formatted documents here... Auto-saves instantly!"
                style={{ height: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}
              />
            </div>
          </div>
        </Col>
      </Row>

      <style>{`
        /* Quill Custom Overrides to match StayOps design */
        .rich-text-container .quill {
          display: flex;
          flex-direction: column;
          border-radius: 16px;
          overflow: hidden;
          background: rgba(67,24,255,0.015);
          border: 1px solid rgba(226,232,248,0.8);
        }
        .rich-text-container .ql-toolbar {
          background: #fff;
          border: none !important;
          border-bottom: 1px solid rgba(226,232,248,0.8) !important;
          padding: 12px 16px !important;
        }
        .rich-text-container .ql-container {
          border: none !important;
          font-family: 'Inter', sans-serif !important;
          font-size: 1.05rem;
          color: #2B3674;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .rich-text-container .ql-editor {
          flex: 1;
          padding: 1.5rem;
        }
        .rich-text-container .ql-editor p {
          line-height: 1.7;
          margin-bottom: 0.8rem;
        }
        .rich-text-container .ql-editor.ql-blank::before {
          color: #A3BED9;
          font-style: normal;
        }
      `}</style>
    </Container>
  );
};

export default WorkspacePage;
