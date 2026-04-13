import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { Trash2, ThumbsUp, ThumbsDown, CheckCircle2, XCircle, Notebook, CheckSquare } from 'lucide-react';
import api from '../services/api';

const WorkspacePage = () => {
  const { user } = useContext(AuthContext);
  
  const [todos, setTodos] = useState([]);
  const [noteContent, setNoteContent] = useState('');
  
  // Todo form
  const [taskInput, setTaskInput] = useState('');
  const [costInput, setCostInput] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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
      setTimeout(() => setIsInitialLoad(false), 500); // Allow time for state flush
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
        repairCost: costInput || 0
      });
      setTodos([res.data, ...todos]);
      setTaskInput('');
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
        setTimeout(() => setIsSavingNote(false), 500); // UI feedback
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [noteContent]);

  return (
    <Container fluid className="dashboard-container-mobile" style={{ maxWidth: 1400, marginTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2rem' }}>
        <CheckSquare size={32} color="#4318FF" strokeWidth={2.5} />
        <h2 style={{ fontWeight: 800, color: '#1B2559', margin: 0, fontSize: '2rem' }}>Personal Workspace</h2>
      </div>

      <Row className="g-4">
        {/* TO-DO LIST (Like Reference Image) */}
        <Col lg={7}>
          <div style={{
            background: '#ffffff',
            borderRadius: 24,
            padding: '2rem',
            border: '1px solid rgba(67,24,255,0.08)',
            boxShadow: '0 8px 30px rgba(67,24,255,0.05)',
            minHeight: '80vh'
          }}>
            <h4 style={{ fontWeight: 800, color: '#1B2559', marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.6rem' }}>
              To-Do-List
            </h4>

            {/* Input Form matching reference structure (Input + Add Button) */}
            <Form className="mobile-flex-col" onSubmit={handleAddTodo} style={{ display: 'flex', gap: '0.8rem', marginBottom: '2rem', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Form.Control
                  type="text"
                  placeholder="Enter a task..."
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  style={{
                    padding: '12px 18px', borderRadius: 12, border: '2px solid rgba(226,232,248,0.8)',
                    fontSize: '1rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                  }}
                />
                
                {user?.role === 'Warden' && (
                  <Form.Control
                    type="number"
                    placeholder="Repair Cost (₹) (Optional)"
                    value={costInput}
                    onChange={(e) => setCostInput(e.target.value)}
                    style={{
                      padding: '10px 18px', borderRadius: 12, border: '2px solid rgba(245,158,11,0.3)',
                      fontSize: '0.9rem', width: '220px', backgroundColor: 'rgba(245,158,11,0.02)'
                    }}
                  />
                )}
              </div>
              
              <Button type="submit" style={{
                background: '#22c55e', border: 'none', borderRadius: 12,
                padding: '13px 28px', fontWeight: 700, fontSize: '1rem',
                boxShadow: '0 4px 14px rgba(34,197,94,0.3)'
              }}>
                Add
              </Button>
            </Form>

            {/* List Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {todos.map(todo => {
                const isComplete = todo.status === 'Complete';
                const isIncomplete = todo.status === 'Incomplete';
                
                return (
                  <div key={todo._id} className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3" style={{
                    padding: '1rem 1.5rem',
                    background: isComplete ? 'rgba(34,197,94,0.04)' : isIncomplete ? 'rgba(239,68,68,0.04)' : '#ffffff',
                    border: isComplete ? '2px solid rgba(34,197,94,0.3)' : isIncomplete ? '2px solid rgba(239,68,68,0.3)' : '2px solid #E2E8F0',
                    borderRadius: 16,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s',
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ 
                        fontWeight: 700, fontSize: '1.2rem', color: '#1B2559',
                        textDecoration: isComplete ? 'line-through' : 'none',
                        opacity: isComplete ? 0.6 : 1
                      }}>
                        {todo.task}
                      </span>
                      {todo.repairCost > 0 && (
                        <span style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 700, marginTop: 4 }}>
                          Cost logged: ₹{todo.repairCost}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons styled like reference but modernized */}
                    <div className="mobile-wrap w-100 mt-2 mt-md-0" style={{ display: 'flex', gap: 10, justifyContent: 'flex-start' }}>
                      <Button variant="danger" onClick={() => handleDeleteTodo(todo._id)} style={{
                        padding: '8px 16px', borderRadius: 10, fontWeight: 700, border: 'none',
                        display: 'flex', alignItems: 'center', gap: 6,
                        boxShadow: '0 4px 12px rgba(239,68,68,0.2)'
                      }}>
                        Delete
                      </Button>

                      <Button onClick={() => handleUpdateTodoStatus(todo._id, 'Complete')} style={{
                        padding: '8px 12px', borderRadius: 10, border: 'none',
                        background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(59,130,246,0.2)'
                      }}>
                        <ThumbsUp size={20} fill={isComplete ? "white" : "none"} />
                      </Button>

                      <Button onClick={() => handleUpdateTodoStatus(todo._id, 'Incomplete')} style={{
                        padding: '8px 12px', borderRadius: 10, border: 'none',
                        background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(59,130,246,0.2)'
                      }}>
                        <ThumbsDown size={20} fill={isIncomplete ? "white" : "none"} />
                      </Button>
                    </div>
                  </div>
                );
              })}
              
              {todos.length === 0 && (
                <div style={{ textAlign: 'center', color: '#A3BED9', padding: '3rem 0', fontWeight: 600 }}>
                  No tasks yet. Add one above!
                </div>
              )}
            </div>
          </div>
        </Col>

        {/* SCRATCHPAD NOTES */}
        <Col lg={5}>
          <div style={{
            background: '#ffffff',
            borderRadius: 24,
            padding: '2rem',
            border: '1px solid rgba(67,24,255,0.08)',
            boxShadow: '0 8px 30px rgba(67,24,255,0.05)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: '80vh'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h4 style={{ fontWeight: 800, color: '#1B2559', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Notebook size={24} color="#4318FF" /> Scratchpad Notes
              </h4>
              {isSavingNote && <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>Auto-saving...</span>}
            </div>

            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Type your personal notes, reminders, or shift reports here... Everything auto-saves instantly!"
              style={{
                flex: 1,
                width: '100%',
                border: 'none',
                resize: 'none',
                outline: 'none',
                fontSize: '1.05rem',
                color: '#2B3674',
                lineHeight: 1.7,
                padding: '1rem',
                background: 'rgba(67,24,255,0.015)',
                borderRadius: 16,
                fontFamily: 'inherit'
              }}
            />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default WorkspacePage;
