import { createStore, combineReducers, applyMiddleware } from 'redux';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createEpicMiddleware, combineEpics } from 'redux-observable';
import firebase from 'firebase/app';
import 'firebase/auth';
import { reactReduxFirebase, firebaseReducer, getFirebase } from 'react-redux-firebase';
import { reduxFirestore, firestoreReducer } from 'redux-firestore';
import 'firebase/firestore';
import * as epics from './epics';
import * as reducers from './reducers';
import { createBrowserHistory } from 'history'

firebase.initializeApp({

});

const history = createBrowserHistory();

const firestore = firebase.firestore();
firestore.settings({ timestampsInSnapshots: true });

const rrfConfig = {
  resetBeforeLogin: false,
  userProfile: 'users',
  useFirestoreForProfile: true,
};

const rootReducer = combineReducers({
  ...reducers,
  router: connectRouter(history),
  firebase: firebaseReducer,
  firestore: firestoreReducer,
});

const rootEpic = combineEpics(...Object.values(epics));

export default function configureStore(history) {
  const epicMiddleware = createEpicMiddleware({
    dependencies: {
      getFirebase,
    },
  });

  const store = createStore(
    rootReducer,
    composeWithDevTools(
      reactReduxFirebase(firebase, rrfConfig),
      reduxFirestore(firebase),
      applyMiddleware(routerMiddleware(history), epicMiddleware),
    ),
  );

  epicMiddleware.run(rootEpic);

  return store;
}
