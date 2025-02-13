import HabitContainer from './HabitContainer';
import { HabitProvider } from './contexts/HabitContext';

function App() {
  return (
    <HabitProvider>
      <div className="App">
        <HabitContainer />
      </div>
    </HabitProvider>
  );
}

export default App;
