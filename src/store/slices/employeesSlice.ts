import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { employeeService } from '../../services/employeeService';
import type { Employee, EmployeeWithTasks } from '../../types/employee.types';

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
      .addCase(fetchEmployees.pending, (state) => {
        state.isLoading = !state.items.length;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action) => {
        state.selectedEmployee = action.payload;
      });
  },
});

export const { clearSelectedEmployee } = employeesSlice.actions;
export default employeesSlice.reducer;
