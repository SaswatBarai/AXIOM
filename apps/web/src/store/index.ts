import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import resumeReducer from "./resumeSlice";
import jobsReducer from "./jobsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    resume: resumeReducer,
    jobs: jobsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
