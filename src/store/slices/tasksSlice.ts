import { createSlice, createAsyncThunk, createSelector, PayloadAction } from '@reduxjs/toolkit';
import NetInfo from '@react-native-community/netinfo';
import { taskService } from '../../services/taskService';
import { storage } from '../../utils/storage';
import type { Task, CreateTaskDto, UpdateTaskDto, TaskStats, TaskStatus, TaskPriority } from '../../types/task.types';
import type { RootState } from '../index';

export interface OfflineQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  payload: any;
  taskId?: number;
  tempId?: number;
}

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
  offlineQueue: OfflineQueueItem[];
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
  offlineQueue: [],
};

// AsyncStorage persistent cache helper
const saveTasksCache = async (items: Task[], stats: TaskStats | null, offlineQueue: OfflineQueueItem[]) => {
  try {
    await storage.setItem('cached_tasks', JSON.stringify(items));
    if (stats) {
      await storage.setItem('cached_task_stats', JSON.stringify(stats));
    }
    await storage.setItem('cached_offline_queue', JSON.stringify(offlineQueue));
  } catch (e) {
    console.error('[saveTasksCache] Error saving tasks cache:', e);
  }
};

export const restoreTasksCache = createAsyncThunk('tasks/restoreCache', async () => {
  try {
    const tasksStr = await storage.getItem('cached_tasks');
    const statsStr = await storage.getItem('cached_task_stats');
    const queueStr = await storage.getItem('cached_offline_queue');
    return {
      items: tasksStr ? JSON.parse(tasksStr) : [],
      stats: statsStr ? JSON.parse(statsStr) : null,
      offlineQueue: queueStr ? JSON.parse(queueStr) : [],
    };
  } catch (e) {
    console.error('[restoreTasksCache] Error restoring tasks cache:', e);
    return { items: [], stats: null, offlineQueue: [] };
  }
});

export const fetchTasks = createAsyncThunk('tasks/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const data = await taskService.getAll();
    return data;
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

export const createTask = createAsyncThunk(
  'tasks/create',
  async (dto: CreateTaskDto, { rejectWithValue }) => {
    try {
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected === false) {
        // Generate optimistic offline task
        const tempId = -Math.floor(Math.random() * 1000000) - 1;
        const offlineTask: Task = {
          id: tempId,
          title: dto.title,
          description: dto.description || '',
          status: 'pending',
          priority: dto.priority,
          assigned_to: Array.isArray(dto.assigned_to) ? (dto.assigned_to[0] as any)?.id || dto.assigned_to[0] : dto.assigned_to as any,
          created_by: 0, // Fallback
          due_date: dto.due_date || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          isOfflinePending: true,
        };
        return { isOffline: true, task: offlineTask, dto };
      }
      const task = await taskService.create(dto);
      return { isOffline: false, task };
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, dto }: { id: number; dto: UpdateTaskDto }, { rejectWithValue }) => {
    try {
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected === false) {
        return { isOffline: true, id, dto };
      }
      const task = await taskService.update(id, dto);
      return { isOffline: false, task };
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to update task');
    }
  }
);

export const deleteTask = createAsyncThunk('tasks/delete', async (id: number, { rejectWithValue }) => {
  try {
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected === false) {
      return { isOffline: true, id };
    }
    await taskService.delete(id);
    return { isOffline: false, id };
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

export const processOfflineSync = createAsyncThunk(
  'tasks/processSync',
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    const queue = state.tasks.offlineQueue;
    if (!queue.length) return;

    console.log('[Offline Sync] Starting sync. Queue length =', queue.length);
    const tempIdMap: Record<number, number> = {};

    for (const item of queue) {
      try {
        if (item.type === 'create') {
          const dto = { ...item.payload };
          const task = await taskService.create(dto);
          if (item.tempId) {
            tempIdMap[item.tempId] = task.id;
          }
        } else if (item.type === 'update') {
          const taskId = item.taskId!;
          const realId = tempIdMap[taskId] || taskId;
          await taskService.update(realId, item.payload);
        } else if (item.type === 'delete') {
          const taskId = item.taskId!;
          const realId = tempIdMap[taskId] || taskId;
          await taskService.delete(realId);
        }
      } catch (error) {
        console.error('[Offline Sync] Error syncing item:', item, error);
      }
    }

    // Refresh after syncing
    await Promise.all([
      dispatch(fetchTasks()),
      dispatch(fetchTaskStats())
    ]);
  }
);

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
      .addCase(restoreTasksCache.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.stats = action.payload.stats;
        state.offlineQueue = action.payload.offlineQueue;
      })
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = !state.items.length;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isRefreshing = false;
        state.items = action.payload;
        state.error = null;
        saveTasksCache(state.items, state.stats, state.offlineQueue);
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
        const { isOffline, task, dto } = action.payload;
        state.items.unshift(task);
        if (isOffline) {
          state.offlineQueue.push({
            id: `create_${Date.now()}`,
            type: 'create',
            payload: dto,
            tempId: task.id,
          });
        }
        saveTasksCache(state.items, state.stats, state.offlineQueue);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const { isOffline, id, dto, task } = action.payload as any;
        if (isOffline) {
          const idx = state.items.findIndex((t) => t.id === id);
          if (idx !== -1) {
            state.items[idx] = { ...state.items[idx], ...dto, isOfflinePending: true };
            if (state.selectedTask?.id === id) {
              state.selectedTask = { ...state.selectedTask, ...dto, isOfflinePending: true };
            }
          }
          // Update queue
          const createItemIdx = state.offlineQueue.findIndex(item => item.type === 'create' && item.tempId === id);
          if (createItemIdx !== -1) {
            state.offlineQueue[createItemIdx].payload = {
              ...state.offlineQueue[createItemIdx].payload,
              ...dto,
            };
          } else {
            state.offlineQueue.push({
              id: `update_${id}_${Date.now()}`,
              type: 'update',
              taskId: id,
              payload: dto,
            });
          }
        } else {
          const idx = state.items.findIndex((t) => t.id === task.id);
          if (idx !== -1) state.items[idx] = task;
          if (state.selectedTask?.id === task.id) {
            state.selectedTask = task;
          }
        }
        saveTasksCache(state.items, state.stats, state.offlineQueue);
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        const { id, isOffline } = action.payload;
        state.items = state.items.filter((t) => t.id !== id);
        if (state.selectedTask?.id === id) {
          state.selectedTask = null;
        }
        if (isOffline) {
          const createItemIdx = state.offlineQueue.findIndex(item => item.type === 'create' && item.tempId === id);
          if (createItemIdx !== -1) {
            state.offlineQueue.splice(createItemIdx, 1);
          } else {
            state.offlineQueue.push({
              id: `delete_${id}_${Date.now()}`,
              type: 'delete',
              taskId: id,
              payload: null,
            });
          }
        }
        saveTasksCache(state.items, state.stats, state.offlineQueue);
      })
      .addCase(fetchTaskStats.fulfilled, (state, action) => {
        state.stats = action.payload;
        saveTasksCache(state.items, state.stats, state.offlineQueue);
      })
      .addCase(processOfflineSync.fulfilled, (state) => {
        state.offlineQueue = [];
        saveTasksCache(state.items, state.stats, state.offlineQueue);
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
