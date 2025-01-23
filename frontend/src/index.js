import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Make App usage explicit for ESLint
const AppComponent = <App />;
const root = createRoot(document.getElementById('root'));
root.render(AppComponent);