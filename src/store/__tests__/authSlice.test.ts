import authReducer, { clearError, updateUser } from '../slices/authSlice';

describe('authSlice', () => {
  const initialState = {
    user: null,
    token: null,
    isLoading: false,
    error: null,
    isInitialized: false,
  };

  it('should return initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should clear errors', () => {
    const errorState = {
      ...initialState,
      error: 'Invalid password',
    };
    const nextState = authReducer(errorState, clearError());
    expect(nextState.error).toBeNull();
  });

  it('should update user fields', () => {
    const activeState = {
      ...initialState,
      user: { id: 1, name: 'Old Name', email: 'user@polygon.com', role: 'employee' as const, avatar_url: null },
    };
    const nextState = authReducer(activeState, updateUser({ name: 'New Name' }));
    expect(nextState.user?.name).toBe('New Name');
    expect(nextState.user?.email).toBe('user@polygon.com');
  });
});
