import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { employeeService } from '../../services/employeeService';
import { storage } from '../../utils/storage';
import type { Employee, EmployeeWithTasks, CreateEmployeeDto, UpdateEmployeeDto } from '../../types/employee.types';

interface EmployeesState {
  items: Employee[];
  selectedEmployee: EmployeeWithTasks | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: EmployeesState = {
  items: [],
  selectedEmployee: null,
  isLoading: false,
  error: null,
};

// Caching helper
const saveEmployeesCache = async (items: Employee[]) => {
  try {
    await storage.setItem('cached_employees', JSON.stringify(items));
  } catch (e) {
    console.error('[saveEmployeesCache] Error saving employees:', e);
  }
};

export const restoreEmployeesCache = createAsyncThunk('employees/restoreCache', async () => {
  try {
    const cached = await storage.getItem('cached_employees');
    return cached ? JSON.parse(cached) : [];
  } catch (e) {
    console.error('[restoreEmployeesCache] Error restoring employees cache:', e);
    return [];
  }
});

export const fetchEmployees = createAsyncThunk('employees/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await employeeService.getAll();
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch employees');
  }
});

export const fetchEmployeeById = createAsyncThunk(
  'employees/fetchOne',
  async (id: number, { rejectWithValue }) => {
    try {
      return await employeeService.getById(id);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch employee');
    }
  }
);

export const createEmployee = createAsyncThunk(
  'employees/create',
  async (data: CreateEmployeeDto, { rejectWithValue }) => {
    try {
      return await employeeService.create(data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to create employee');
    }
  }
);

export const updateEmployee = createAsyncThunk(
  'employees/update',
  async ({ id, data }: { id: number; data: UpdateEmployeeDto }, { rejectWithValue }) => {
    try {
      return await employeeService.update(id, data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to update employee');
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  'employees/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await employeeService.delete(id);
      return id;
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to delete employee');
    }
  }
);

const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    clearSelectedEmployee: (state) => {
      state.selectedEmployee = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreEmployeesCache.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(fetchEmployees.pending, (state) => {
        state.isLoading = !state.items.length;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.error = null;
        saveEmployeesCache(state.items);
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action) => {
        state.selectedEmployee = action.payload;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.items.sort((a, b) => a.name.localeCompare(b.name));
        saveEmployeesCache(state.items);
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const index = state.items.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload };
        }
        saveEmployeesCache(state.items);
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.items = state.items.filter((e) => e.id !== action.payload);
        saveEmployeesCache(state.items);
      });
  },
});

export const { clearSelectedEmployee } = employeesSlice.actions;
export default employeesSlice.reducer;
