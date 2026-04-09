import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ElkHuntDashboard from '../ElkHuntDashboard';

describe('ElkHuntDashboard', () => {
  beforeEach(() => {
    // Clear storage before each test
    window.storage.data.clear();
  });

  it('should render without crashing', () => {
    const { container } = render(<ElkHuntDashboard />);
    expect(container).toBeTruthy();
  });

  it('should display the title', async () => {
    render(<ElkHuntDashboard />);

    await waitFor(() => {
      const title = screen.getByText(/elk hunt planner/i);
      expect(title).toBeInTheDocument();
    });
  });

  it('should display the season year', async () => {
    render(<ElkHuntDashboard />);

    await waitFor(() => {
      const seasons = screen.getAllByText(/2026/i);
      expect(seasons.length).toBeGreaterThan(0);
    });
  });

  it('should render all three GMU units', async () => {
    render(<ElkHuntDashboard />);

    await waitFor(() => {
      // Look for GMU numbers
      const gmu12 = screen.getAllByText(/GMU 12/i);
      const gmu62 = screen.getAllByText(/GMU 62/i);
      const gmu79 = screen.getAllByText(/GMU 79/i);

      expect(gmu12.length).toBeGreaterThan(0);
      expect(gmu62.length).toBeGreaterThan(0);
      expect(gmu79.length).toBeGreaterThan(0);
    });
  });

  it('should display unit nicknames', async () => {
    render(<ElkHuntDashboard />);

    await waitFor(() => {
      const flatTops = screen.getAllByText(/Flat Tops/i);
      const uncompahgre = screen.getAllByText(/Uncompahgre/i);
      const sanLuis = screen.getAllByText(/San Luis/i);

      expect(flatTops.length).toBeGreaterThan(0);
      expect(uncompahgre.length).toBeGreaterThan(0);
      expect(sanLuis.length).toBeGreaterThan(0);
    });
  });

  it('should have navigation tabs', async () => {
    render(<ElkHuntDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/overview/i)).toBeInTheDocument();
      expect(screen.getByText(/waypoints/i)).toBeInTheDocument();
      expect(screen.getByText(/map/i)).toBeInTheDocument();
      expect(screen.getByText(/integrations/i)).toBeInTheDocument();
    });
  });
});
