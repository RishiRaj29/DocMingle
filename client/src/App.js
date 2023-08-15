import './App.css';
import Editor from './components/Editor.jsx';
import { BrowserRouter as Router , Routes , Route , Navigate } from 'react-router-dom';
import { v4 as uuid } from 'uuid'; //This is popular package to generate random IDs

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>

          {/* when the homepage is triggered then it will navigate to a doc with a newly generated id */}
          <Route path='/' element={<Navigate replace to={`/docs/${uuid()}`} />} />

          {/* to open for a particular id */}
          <Route path='/docs/:id' element={<Editor/>} /> 

        </Routes>
      </Router>
    </div>
  );
}

export default App;
