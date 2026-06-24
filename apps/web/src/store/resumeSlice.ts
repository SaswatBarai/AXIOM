import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Resume } from "@axiom/shared-types";

export interface ResumeState {
  resumes: Resume[];
  activeResumeId: string | null;
  isUploading: boolean;
  isAnalyzing: boolean;
}

const initialState: ResumeState = {
  resumes: [],
  activeResumeId: null,
  isUploading: false,
  isAnalyzing: false,
};

const resumeSlice = createSlice({
  name: "resume",
  initialState,
  reducers: {
    setResumes(state, action: PayloadAction<Resume[]>) {
      state.resumes = action.payload;
    },
    setActiveResumeId(state, action: PayloadAction<string | null>) {
      state.activeResumeId = action.payload;
    },
    setUploading(state, action: PayloadAction<boolean>) {
      state.isUploading = action.payload;
    },
    setAnalyzing(state, action: PayloadAction<boolean>) {
      state.isAnalyzing = action.payload;
    },
  },
});

export const { setResumes, setActiveResumeId, setUploading, setAnalyzing } = resumeSlice.actions;
export default resumeSlice.reducer;
