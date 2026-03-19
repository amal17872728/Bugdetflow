import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    currentUser: null,
    page: 'home',
  },
  reducers: {
    setUser: (state, action) => { state.currentUser = action.payload; },
    setPage: (state, action) => { state.page = action.payload; },
    updateName: (state, action) => {
      if (state.currentUser) state.currentUser.name = action.payload;
    },
    logout: (state) => {
      state.currentUser = null;
      state.page = 'home';
    },
  },
});

export const { setUser, setPage, updateName, logout } = userSlice.actions;
export default userSlice.reducer;
