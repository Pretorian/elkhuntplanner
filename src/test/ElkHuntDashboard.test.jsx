import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ElkHuntDashboard from '../ElkHuntDashboard';

describe('ElkHuntDashboard', () => {
  beforeEach(() => {
    // Clear storage before each test. Importing the real storage module
    // (src/storage.js) overwrites the jsdom mock with the singleton instance,
    // which exposes clear() (not a .data Map), so call clear() directly.
    window.storage?.clear?.();
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

  it('should offer only GMU 79 as a selectable unit', async () => {
    const { container } = render(<ElkHuntDashboard />);

    await waitFor(() => {
      // The sidebar unit selector should list exactly one unit: GMU 79.
      const unitButtons = container.querySelectorAll('.unit-btn');
      expect(unitButtons.length).toBe(1);
      expect(unitButtons[0].textContent).toMatch(/GMU 79/i);
    });
  });

  it('should display the unit nickname', async () => {
    render(<ElkHuntDashboard />);

    await waitFor(() => {
      const sanLuis = screen.getAllByText(/San Luis/i);
      expect(sanLuis.length).toBeGreaterThan(0);
    });
  });

  it('should have navigation tabs', async () => {
    render(<ElkHuntDashboard />);

    await waitFor(() => {
      // Tab labels render in both the desktop and mobile navs, so match all.
      expect(screen.getAllByText(/overview/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/waypoints/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/map/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/integrations/i).length).toBeGreaterThan(0);
    });
  });
});
