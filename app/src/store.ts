import { applyMiddleware, combineReducers, createStore } from 'redux';
import stories, { StoryState } from './reducers/stories';
import { newGrpcMiddleware } from './middleware/grpc';

interface StoreEnhancerState {
}

export interface RootState extends StoreEnhancerState {
  stories: StoryState;
}


const reducers = combineReducers<RootState>({
  stories,
});

const store = createStore(
  reducers,
  applyMiddleware(
    newGrpcMiddleware(),
    )
    );

export type AppDispatch = typeof store.dispatch;

export default store
