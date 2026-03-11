import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { ObjectivesView } from './views/ObjectivesView';
import { PlanBoardView } from './views/PlanBoardView';
import { RoadmapView } from './views/RoadmapView';
import { SprintView } from './views/SprintView';

const links = [
  ['plan-board', 'Plan Board'],
  ['objectives', 'Objectives'],
  ['roadmap', 'Roadmap'],
  ['sprint', 'Sprint']
] as const;

export function App() {
  return (
    <div className="app-shell">
      <header>
        <h1>Super Brain</h1>
        <p>Planning workspace skeleton</p>
      </header>

      <nav>
        {links.map(([path, label]) => (
          <NavLink key={path} to={`/${path}`}>
            {label}
          </NavLink>
        ))}
      </nav>

      <main>
        <Routes>
          <Route path="/plan-board" element={<PlanBoardView />} />
          <Route path="/objectives" element={<ObjectivesView />} />
          <Route path="/roadmap" element={<RoadmapView />} />
          <Route path="/sprint" element={<SprintView />} />
          <Route path="*" element={<Navigate to="/plan-board" replace />} />
        </Routes>
      </main>
    </div>
  );
}
