
import React, { useState } from 'react';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import StudentView from './components/StudentView';
import TeacherView from './components/TeacherView';

const App: React.FC = () => {
  const [view, setView] = useState<'student' | 'teacher' | 'landing'>('landing');

  return (
    <Layout activeView={view} onViewChange={setView}>
      {view === 'landing' && <LandingPage onStart={setView} />}
      {view === 'student' && <StudentView />}
      {view === 'teacher' && <TeacherView />}
    </Layout>
  );
};

export default App;
