import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Helper functions for waypoint management
 * These mirror the logic used in the ElkHuntDashboard component
 */

const createWaypoint = (id, name, lat, lng, category, notes = '') => ({
  id,
  name,
  lat,
  lng,
  category,
  notes,
});

const addWaypoint = (waypoints, newWaypoint) => {
  return [...waypoints, newWaypoint];
};

const deleteWaypoint = (waypoints, waypointId) => {
  return waypoints.filter(wp => wp.id !== waypointId);
};

const updateWaypoint = (waypoints, waypointId, updates) => {
  return waypoints.map(wp =>
    wp.id === waypointId ? { ...wp, ...updates } : wp
  );
};

describe('Waypoint Management', () => {
  let testWaypoints;

  beforeEach(() => {
    testWaypoints = [
      createWaypoint(1, 'Base Camp', 40.123, -107.456, 'camp', 'Main camp'),
      createWaypoint(2, 'Water Source', 40.234, -107.567, 'water', ''),
      createWaypoint(
        3,
        'Glassing Point',
        40.345,
        -107.678,
        'vantage',
        'Good view'
      ),
    ];
  });

  describe('createWaypoint', () => {
    it('should create a waypoint with all fields', () => {
      const waypoint = createWaypoint(
        4,
        'Test Point',
        40.5,
        -107.8,
        'elk',
        'Test notes'
      );

      expect(waypoint).toEqual({
        id: 4,
        name: 'Test Point',
        lat: 40.5,
        lng: -107.8,
        category: 'elk',
        notes: 'Test notes',
      });
    });

    it('should create a waypoint with empty notes by default', () => {
      const waypoint = createWaypoint(5, 'Minimal', 40.1, -107.2, 'parking');

      expect(waypoint.notes).toBe('');
    });
  });

  describe('addWaypoint', () => {
    it('should add a new waypoint to the list', () => {
      const newWaypoint = createWaypoint(4, 'New Point', 40.9, -107.1, 'elk');
      const result = addWaypoint(testWaypoints, newWaypoint);

      expect(result).toHaveLength(4);
      expect(result[3]).toEqual(newWaypoint);
    });

    it('should not mutate the original array', () => {
      const originalLength = testWaypoints.length;
      const newWaypoint = createWaypoint(4, 'New Point', 40.9, -107.1, 'elk');

      addWaypoint(testWaypoints, newWaypoint);

      expect(testWaypoints).toHaveLength(originalLength);
    });
  });

  describe('deleteWaypoint', () => {
    it('should remove a waypoint by id', () => {
      const result = deleteWaypoint(testWaypoints, 2);

      expect(result).toHaveLength(2);
      expect(result.find(wp => wp.id === 2)).toBeUndefined();
    });

    it('should preserve other waypoints', () => {
      const result = deleteWaypoint(testWaypoints, 2);

      expect(result.find(wp => wp.id === 1)).toBeDefined();
      expect(result.find(wp => wp.id === 3)).toBeDefined();
    });

    it('should not mutate the original array', () => {
      const originalLength = testWaypoints.length;

      deleteWaypoint(testWaypoints, 2);

      expect(testWaypoints).toHaveLength(originalLength);
    });

    it('should return the same array if id not found', () => {
      const result = deleteWaypoint(testWaypoints, 999);

      expect(result).toHaveLength(testWaypoints.length);
    });
  });

  describe('updateWaypoint', () => {
    it('should update waypoint name', () => {
      const result = updateWaypoint(testWaypoints, 1, { name: 'Updated Camp' });

      expect(result.find(wp => wp.id === 1).name).toBe('Updated Camp');
    });

    it('should update multiple fields', () => {
      const updates = {
        name: 'New Name',
        notes: 'New notes',
        category: 'trail',
      };
      const result = updateWaypoint(testWaypoints, 2, updates);
      const updated = result.find(wp => wp.id === 2);

      expect(updated.name).toBe('New Name');
      expect(updated.notes).toBe('New notes');
      expect(updated.category).toBe('trail');
    });

    it('should preserve unchanged fields', () => {
      const result = updateWaypoint(testWaypoints, 1, { name: 'New Name' });
      const updated = result.find(wp => wp.id === 1);

      expect(updated.lat).toBe(40.123);
      expect(updated.lng).toBe(-107.456);
      expect(updated.category).toBe('camp');
    });

    it('should not mutate the original array', () => {
      const originalName = testWaypoints[0].name;

      updateWaypoint(testWaypoints, 1, { name: 'Changed' });

      expect(testWaypoints[0].name).toBe(originalName);
    });

    it('should not update if id not found', () => {
      const result = updateWaypoint(testWaypoints, 999, { name: 'Ghost' });

      expect(result).toEqual(testWaypoints);
    });
  });

  describe('Waypoint Categories', () => {
    const validCategories = [
      'camp',
      'water',
      'parking',
      'elk',
      'trail',
      'vantage',
      'danger',
      'other',
    ];

    it('should support all valid categories', () => {
      validCategories.forEach((category, index) => {
        const waypoint = createWaypoint(
          index,
          `Test ${category}`,
          40.0,
          -107.0,
          category
        );
        expect(waypoint.category).toBe(category);
      });
    });
  });

  describe('Waypoint Coordinates', () => {
    it('should handle valid coordinates', () => {
      const waypoint = createWaypoint(1, 'Test', 40.123456, -107.654321, 'elk');

      expect(waypoint.lat).toBe(40.123456);
      expect(waypoint.lng).toBe(-107.654321);
    });

    it('should handle integer coordinates', () => {
      const waypoint = createWaypoint(1, 'Test', 40, -107, 'elk');

      expect(waypoint.lat).toBe(40);
      expect(waypoint.lng).toBe(-107);
    });
  });
});
