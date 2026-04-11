import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  getTodos, createTodo, updateTodoStatus, deleteTodo, 
  getNote, updateNote 
} from '../controllers/workspaceController.js';

const router = express.Router();

router.use(protect);

// Todos
router.route('/todos')
  .get(getTodos)
  .post(createTodo);

router.route('/todos/:id')
  .put(updateTodoStatus)
  .delete(deleteTodo);

// Notes
router.route('/note')
  .get(getNote)
  .put(updateNote);

export default router;
