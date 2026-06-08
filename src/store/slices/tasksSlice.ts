import { createSlice, createAsyncThunk, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { taskService } from '../../services/taskService';
import type { Task, CreateTaskDto, UpdateTaskDto, TaskStats, TaskStatus, TaskPriority } from '../../types/task.types';
import type { RootState } from '../index';

interface TasksState {
  items: Task[];
  selectedTask: Task | null;
  stats: TaskStats | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  searchQuery: string;
  filterStatus: 'all' | TaskStatus;
  filterPriority: 'all' | TaskPriority;
}

const initialState: TasksState = {
  items: [],
  selectedTask: null,
  stats: null,
  isLoading: false,
  isRefreshing: false,
  error: null,
  searchQuery: '',
  filterStatus: 'all',
  filterPriority: 'all',
};

export const fetchTasks = createAsyncThunk('tasks/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await taskService.getAll();
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch tasks');
  }
});

export const fetchTaskById = createAsyncThunk('tasks/fetchOne', async (id: number, { rejectWithValue }) => {
  try {
    return await taskService.getById(id);
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch task');
  }
});

export const createTask = createAsyncThunk('tasks/create', async (dto: CreateTaskDto, { rejectWithValue }) => {
  try {
    return await taskService.create(dto);
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to create task');
  }
});

export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, dto }: { id: number; dto: UpdateTaskDto }, { rejectWithValue }) => {
    try {
      return await taskService.update(id, dto);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to update task');
    }
  }
);

export const deleteTask = createAsyncThunk('tasks/delete', async (id: number, { rejectWithValue }) => {
  try {
    await taskService.delete(id);
    return id;
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to delete task');
  }
});

export const fetchTaskStats = createAsyncThunk('tasks/stats', async (_, { rejectWithValue }) => {
  try {
    return await taskService.getStats();
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch stats');
  }
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilterStatus: (state, action: PayloadAction<'all' | TaskStatus>) => {
      state.filterStatus = action.payload;
    },
    setFilterPriority: (state, action: PayloadAction<'all' | TaskPriority>) => {
      state.filterPriority = action.payload;
    },
    clearSelectedTask: (state) => {
      state.selectedTask = null;
    },
    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.isRefreshing = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = !state.items.length;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isRefreshing = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.isRefreshing = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.selectedTask = action.payload;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.selectedTask?.id === action.payload.id) {
          state.selectedTask = action.payload;
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
      })
      .addCase(fetchTaskStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { setSearchQuery, setFilterStatus, setFilterPriority, clearSelectedTask, setRefreshing } =
  tasksSlice.actions;

// Memoized selector for filtered tasks
export const selectFilteredTasks = createSelector(
  [
    (state: RootState) => state.tasks.items,
    (state: RootState) => state.tasks.searchQuery,
    (state: RootState) => state.tasks.filterStatus,
    (state: RootState) => state.tasks.filterPriority,
  ],
  (items, query, status, priority) =>
    items.filter((t) => {
      const matchesSearch =
        !query ||
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.description?.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === 'all' || t.status === status;
      const matchesPriority = priority === 'all' || t.priority === priority;
      return matchesSearch && matchesStatus && matchesPriority;
    })
);

export default tasksSlice.reducer;
