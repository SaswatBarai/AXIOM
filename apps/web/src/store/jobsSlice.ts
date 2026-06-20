import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Job, JobMatch } from "@axiom/shared-types";

interface JobsState {
  jobs: Job[];
  matches: JobMatch[];
  savedJobIds: string[];
  searchQuery: string;
  filters: {
    jobType: string[];
    experienceLevel: string[];
    remote: boolean | null;
  };
  totalCount: number;
  page: number;
}

const initialState: JobsState = {
  jobs: [],
  matches: [],
  savedJobIds: [],
  searchQuery: "",
  filters: {
    jobType: [],
    experienceLevel: [],
    remote: null,
  },
  totalCount: 0,
  page: 1,
};

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    setJobs(state, action: PayloadAction<{ jobs: Job[]; total: number }>) {
      state.jobs = action.payload.jobs;
      state.totalCount = action.payload.total;
    },
    setMatches(state, action: PayloadAction<JobMatch[]>) {
      state.matches = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
      state.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    toggleSavedJob(state, action: PayloadAction<string>) {
      const id = action.payload;
      const idx = state.savedJobIds.indexOf(id);
      if (idx === -1) state.savedJobIds.push(id);
      else state.savedJobIds.splice(idx, 1);
    },
  },
});

export const { setJobs, setMatches, setSearchQuery, setPage, toggleSavedJob } = jobsSlice.actions;
export default jobsSlice.reducer;
