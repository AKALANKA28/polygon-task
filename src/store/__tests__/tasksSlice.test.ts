import tasksReducer, {
  setSearchQuery,
  setFilterStatus,
  setFilterPriority,
  clearSelectedTask,
  setRefreshing,
  selectFilteredTasks,
} from '../slices/tasksSlice';
import type { Task } from '../../types/task.types';

describe('tasksSlice', () => {
  const initialState = {
    items: [],
    selectedTask: null,
    stats: null,
    isLoading: false,
    isRefreshing: false,
    error: null,
    searchQuery: '',
    filterStatus: 'all' as const,
    filterPriority: 'all' as const,
    offlineQueue: [],
  };

  describe('reducers', () => {
    it('should return the initial state', () => {
      expect(tasksReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle setSearchQuery', () => {
      const nextState = tasksReducer(initialState, setSearchQuery('test query'));
      expect(nextState.searchQuery).toBe('test query');
    });

    it('should handle setFilterStatus', () => {
      const nextState = tasksReducer(initialState, setFilterStatus('completed'));
      expect(nextState.filterStatus).toBe('completed');
    });

    it('should handle setFilterPriority', () => {
      const nextState = tasksReducer(initialState, setFilterPriority('high'));
      expect(nextState.filterPriority).toBe('high');
    });

    it('should handle clearSelectedTask', () => {
      const stateWithSelection = {
        ...initialState,
        selectedTask: { id: 1, title: 'Test Task' } as Task,
      };
      const nextState = tasksReducer(stateWithSelection, clearSelectedTask());
      expect(nextState.selectedTask).toBeNull();
    });

    it('should handle setRefreshing', () => {
      const nextState = tasksReducer(initialState, setRefreshing(true));
      expect(nextState.isRefreshing).toBe(true);
    });
  });

  describe('selectFilteredTasks selector', () => {
    const dummyTasks: Task[] = [
      {
        id: 1,
        title: 'Design Logo',
        description: 'Create branding assets',
        status: 'pending',
        priority: 'high',
        assigned_to: [],
        created_at: '',
        updated_at: '',
        due_date: '',
        comments: [],
      } as any,
      {
        id: 2,
        title: 'Develop Homepage',
        description: 'Code the React layout',
        status: 'in_progress',
        priority: 'medium',
        assigned_to: [],
        created_at: '',
        updated_at: '',
        due_date: '',
        comments: [],
      } as any,
      {
        id: 3,
        title: 'Write Docs',
        description: 'Create technical specifications',
        status: 'completed',
        priority: 'low',
        assigned_to: [],
        created_at: '',
        updated_at: '',
        due_date: '',
        comments: [],
      } as any,
    ];

    const mockRootState = (searchQuery = '', filterStatus: 'all' | 'pending' | 'in_progress' | 'completed' = 'all', filterPriority: 'all' | 'low' | 'medium' | 'high' = 'all') => ({
      tasks: {
        items: dummyTasks,
        selectedTask: null,
        stats: null,
        isLoading: false,
        isRefreshing: false,
        error: null,
        searchQuery,
        filterStatus,
        filterPriority,
        offlineQueue: [],
      },
      auth: {
        user: null,
        token: null,
        isLoading: false,
        error: null,
        isInitialized: false,
      },
      employees: {
        items: [],
        selectedEmployee: null,
        isLoading: false,
        error: null,
      },
    });

    it('returns all tasks when filters are default', () => {
      const state = mockRootState();
      const filtered = selectFilteredTasks(state);
      expect(filtered).toHaveLength(3);
    });

    it('filters tasks by search query matching title or description', () => {
      const state = mockRootState('React');
      const filtered = selectFilteredTasks(state);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe(2);

      const stateNoMatch = mockRootState('Nonexistent');
      expect(selectFilteredTasks(stateNoMatch)).toHaveLength(0);
    });

    it('filters tasks by status', () => {
      const state = mockRootState('', 'completed');
      const filtered = selectFilteredTasks(state);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe(3);
    });

    it('filters tasks by priority', () => {
      const state = mockRootState('', 'all', 'high');
      const filtered = selectFilteredTasks(state);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe(1);
    });

    it('combines multiple filters correctly', () => {
      const state = mockRootState('Logo', 'pending', 'high');
      const filtered = selectFilteredTasks(state);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe(1);

      const stateNoMatch = mockRootState('Logo', 'completed', 'high');
      expect(selectFilteredTasks(stateNoMatch)).toHaveLength(0);
    });
  });
});
