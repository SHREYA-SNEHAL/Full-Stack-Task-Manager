import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client.js';

export const fetchTasks = createAsyncThunk('tasks/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/tasks');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load tasks');
  }
});

export const fetchTaskById = createAsyncThunk('tasks/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/tasks/${id}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load task');
  }
});

export const createTask = createAsyncThunk('tasks/create', async (payload, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    for (const [key, value] of Object.entries(payload)) {
      if (key === 'documents' && Array.isArray(value)) {
        value.forEach((file) => formData.append('documents', file));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    }
    const { data } = await api.post('/tasks', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create task');
  }
});

export const updateTask = createAsyncThunk('tasks/update', async ({ id, updates }, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    for (const [key, value] of Object.entries(updates)) {
      if (key === 'documents' && Array.isArray(value)) {
        value.forEach((file) => formData.append('documents', file));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    }
    const { data } = await api.put(`/tasks/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update task');
  }
});

export const deleteTask = createAsyncThunk('tasks/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/tasks/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete task');
  }
});

const initialState = {
  items: [],
  selected: null,
  loading: false,
  error: null,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTaskError(state) {
      state.error = null;
    },
    clearSelectedTask(state) {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTaskById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTask.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.items.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.selected?.id === action.payload.id) state.selected = action.payload;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
        if (state.selected?.id === action.payload) state.selected = null;
      });
  },
});

export const { clearTaskError, clearSelectedTask } = tasksSlice.actions;
export default tasksSlice.reducer;
