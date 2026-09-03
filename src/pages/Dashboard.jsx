import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';
import StatCard from '../components/StatCard.jsx';
import TrendChart from '../components/TrendChart.jsx';
import DeptChart from '../components/DeptChart.jsx';
import SelectionReveal from '../components/SelectionReveal.jsx';
import PendingSelections from '../components/PendingSelections.jsx';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [drawCount, setDrawCount] = useState(3);
  const [drawing, setDrawing] = useState(false);
  const [reveal, setReveal] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [totalActive, setTotalActive] = useState(0);
  const [cycle, setCycle] = useState(null);
  const [cycleTestedCount, setCycleTestedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [trend, setTrend] = useState([]);
  const [byDept, setByDept] = useState([]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');

    const [{ count: activeCount }, { data: openCycle }] = await Promise.all([
      supabase.from('employees').select('*', { count: 'exact', head: true }).eq('active', true),
      supabase.from('test_cycles').select('*').is('completed_at', null).limit(1).maybeSingle()
    ]);
    setTotalActive(activeCount ?? 0);
    setCycle(openCycle ?? null);

    if (openCycle) {
      const { count: testedInCycle } = await supabase
        .from('test_selections')
        .select('*', { count: 'exact', head: true })
        .eq('cycle_id', openCycle.id);
      setCycleTestedCount(testedInCycle ?? 0);
    } else {
      setCycleTestedCount(0);
    }

    const { count: pending } = await supabase
      .from('test_selections')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    setPendingCount(pending ?? 0);

    const since = new Date();
    since.setDate(since.getDate() - 13);
    const { data: history } = await supabase
      .from('v_test_history')
      .select('selected_at, department')
      .gte('selected_at', since.toISOString());

    const byDate = {};
    for (let i = 0; i < 14; i++) {
      const d = new Date(since);
      d.setDate(d.getDate() + i);
      byDate[d.toISOString().slice(0, 10)] = 0;
    }
    (history ?? []).forEach((row) => {
      const key = row.selected_at.slice(0, 10);
      if (key in byDate) byDate[key] += 1;
    });
    setTrend(Object.entries(byDate).map(([date, count]) => ({
      date: date.slice(5), count
    })));

    if (openCycle) {
      const { data: deptRows } = await supabase
        .from('v_test_history')
        .select('department')
        .eq('cycle_number', openCycle.cycle_number);
      const counts = {};
      (deptRows ?? []).forEach((r) => { counts[r.department] = (counts[r.department] ?? 0) + 1; });
      setByDept(Object.entries(counts).map(([department, count]) => ({ department, count })));
    } else {
      setByDept([]);
    }

    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function handleDraw() {
    setDrawing(true);
    setError('');
    const { data, error: err } = await supabase.rpc('run_selection', { p_count: drawCount });
    setDrawing(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (!data || data.length === 0) {
      setError('No active employees are available to select from yet.');
      return;
    }
    setReveal(data);
  }

  function handleRevealDone() {
    setReveal(null);
    loadAll();
    setRefreshKey((k) => k + 1);
  }

  const progressPct = totalActive > 0 ? Math.min(100, Math.round((cycleTestedCount / totalActive) * 100)) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-head font-extrabold text-2xl text-ink">Dashboard</h1>
          <p className="text-muted text-sm mt-1">Run the next random draw and track program status.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={drawCount}
            onChange={(e) => setDrawCount(Number(e.target.value))}
            className="bg-raised border border-line rounded-md px-3 py-2 text-sm text-ink outline-none focus:border-orange"
          >
            <option value={2}>Draw 2</option>
            <option value={3}>Draw 3</option>
          </select>
          <button
            onClick={handleDraw}
            disabled={drawing}
            className="bg-orange hover:bg-orange/90 disabled:opacity-60 text-inkOnOrange font-head font-bold rounded-md px-4 py-2 transition-colors"
          >
            {drawing ? 'Drawing…' : 'Run selection'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-alert/10 border border-alert/40 text-alert text-sm rounded-md px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active employees" value={loading ? '—' : totalActive} />
        <StatCard
          label="Current cycle"
          value={loading ? '—' : `#${cycle?.cycle_number ?? 1}`}
          sub={loading ? '' : `${cycleTestedCount} / ${totalActive} drawn`}
          tone="orange"
        />
        <StatCard label="Pending results" value={loading ? '—' : pendingCount} tone="pending" />
        <StatCard label="Cycle progress" value={loading ? '—' : `${progressPct}%`} tone="pass" />
      </div>

      <div className="bg-surface border border-line rounded-lg p-5">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted">Cycle #{cycle?.cycle_number ?? 1} coverage</span>
          <span className="text-ink font-medium">{cycleTestedCount} of {totalActive}</span>
        </div>
        <div className="h-2 bg-line rounded-full overflow-hidden">
          <div className="h-full bg-orange rounded-full transition-all" style={{ width: `${progressPct}%` }} />
        </div>
        <p className="text-muted text-xs mt-2">
          Once every active employee has been drawn, the cycle closes automatically and the next draw starts a fresh cycle.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <TrendChart data={trend} />
        <DeptChart data={byDept} />
      </div>

      <PendingSelections refreshKey={refreshKey} />

      {reveal && <SelectionReveal picks={reveal} onDone={handleRevealDone} />}
    </div>
  );
}
