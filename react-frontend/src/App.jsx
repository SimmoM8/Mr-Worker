import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SidebarLayout from './layouts/DashboardLayout';

import Resumes from './pages/Resumes';
import Skills from './pages/Skills';
import WorkExperience from './pages/WorkExperience';
import Education from './pages/Education';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SidebarLayout />}>
          <Route index element={<Resumes />} />
          <Route path="skills" element={<Skills />} />
          <Route path="work" element={<WorkExperience />} />
          <Route path="education" element={<Education />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;