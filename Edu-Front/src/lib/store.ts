import { configureStore, createAction, combineReducers } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { authApi } from "../features/auth/authApi";
import { profileApi } from "../features/profileApi/profileApi";
import { proposalFeedbackApi } from "../features/proposalFeedbackApi/proposalFeedbackApi";
import { proposalSubmitApi } from "@/features/proposalSubmitApi/proposalSubmitApi";
import { usersApi } from "@/features/usersApi/usersApi";
import { proposalsApi } from "@/features/proposalsApi/proposalsApi";
import { projectFeedbackApi } from "@/features/projectFeedbackApi/ProjectFeedbackApi";
import { projectSubmitApi } from "@/features/projectSubmitApi/projectSubmitApi";
import { getProjectsApi } from "@/features/getProjectsApi/getProjectsApi";
import { commentsApi } from "@/features/commentsApi/commentsApi";
import { groupApi } from "@/features/groupApi/groupApi";
import { docApi } from "@/features/docApi/docApi";

// Action to clear all cached data on logout
export const resetStore = createAction("store/reset");

const combinedReducer = combineReducers({
  [authApi.reducerPath]: authApi.reducer,
  [profileApi.reducerPath]: profileApi.reducer,
  [proposalFeedbackApi.reducerPath]: proposalFeedbackApi.reducer,
  [proposalSubmitApi.reducerPath]: proposalSubmitApi.reducer,
  [usersApi.reducerPath]: usersApi.reducer,
  [proposalsApi.reducerPath]: proposalsApi.reducer,
  [projectFeedbackApi.reducerPath]: projectFeedbackApi.reducer,
  [projectSubmitApi.reducerPath]: projectSubmitApi.reducer,
  [getProjectsApi.reducerPath]: getProjectsApi.reducer,
  [commentsApi.reducerPath]: commentsApi.reducer,
  [groupApi.reducerPath]: groupApi.reducer,
  [docApi.reducerPath]: docApi.reducer,
});

// Root reducer that resets all state when store/reset is dispatched
const rootReducer: typeof combinedReducer = (state, action) => {
  if (action.type === resetStore.type) {
    // Returning undefined causes each slice to reset to its initial state
    return combinedReducer(undefined, action);
  }
  return combinedReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(profileApi.middleware)
      .concat(proposalFeedbackApi.middleware)
      .concat(proposalSubmitApi.middleware)
      .concat(usersApi.middleware)
      .concat(proposalsApi.middleware)
      .concat(projectFeedbackApi.middleware)
      .concat(projectSubmitApi.middleware)
      .concat(getProjectsApi.middleware)
      .concat(commentsApi.middleware)
      .concat(groupApi.middleware)
      .concat(docApi.middleware)
});

export type RootState = ReturnType<typeof combinedReducer>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
