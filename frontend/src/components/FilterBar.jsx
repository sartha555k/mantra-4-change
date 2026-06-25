import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { DEFAULT_FILTERS } from '../utils/format';

export default function FilterBar({ filters, onChange }) {
  const [options, setOptions] = useState(null);
  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    api.getFilters().then(setOptions).catch(console.error);
  }, []);

  useEffect(() => {
    api
      .getBlocks(filters.district, filters.month)
      .then((res) => setBlocks(res.blocks))
      .catch(console.error);
  }, [filters.district, filters.month]);

  function update(key, value) {
    const next = { ...filters, [key]: value };
    if (key === 'district') next.block = '';
    onChange(next);
  }

  if (!options) return null;

  return (
    <div className="filters-bar">
      <div className="filter-group">
        <label>Reporting month</label>
        <select value={filters.month} onChange={(e) => update('month', e.target.value)}>
          {options.months.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <label>District</label>
        <select value={filters.district} onChange={(e) => update('district', e.target.value)}>
          <option value="">All districts</option>
          {options.districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <label>Block</label>
        <select value={filters.block} onChange={(e) => update('block', e.target.value)}>
          <option value="">All blocks</option>
          {blocks.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <label>Grade</label>
        <select value={filters.grade} onChange={(e) => update('grade', e.target.value)}>
          <option value="">All grades</option>
          {options.grades.map((g) => (
            <option key={g} value={g}>
              Class {g}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <label>Subject</label>
        <select value={filters.subject} onChange={(e) => update('subject', e.target.value)}>
          <option value="">All subjects</option>
          {options.subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-group" style={{ justifyContent: 'flex-end' }}>
        <label>&nbsp;</label>
        <button type="button" className="btn secondary" onClick={() => onChange({ ...DEFAULT_FILTERS, month: filters.month })}>
          Reset filters
        </button>
      </div>
    </div>
  );
}
