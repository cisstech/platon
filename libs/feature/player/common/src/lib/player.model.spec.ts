import { getClosingTime, isTimeouted } from './player.model';

describe('isTimeouted', () => {
  it('should return true when startedAt + duration has passed', () => {
    const player = {
      startedAt: new Date(Date.now() - 10000),
      closeAt: undefined,
      settings: {
        duration: 5000,
      },
    };

    const result = isTimeouted(player);
    expect(result).toBe(true);
  });

  it('should return false when startedAt + duration has not passed', () => {
    const player = {
      startedAt: new Date(Date.now() - 2000),
      closeAt: undefined,
      settings: {
        duration: 5000,
      },
    };

    const result = isTimeouted(player);
    expect(result).toBe(false);
  });

  it('should return true when closeAt has passed and startedAt or duration is not available', () => {
    const player = {
      startedAt: undefined,
      closeAt: new Date(Date.now() - 1000),
      settings: {
        duration: undefined,
      },
    };

    const result = isTimeouted(player);
    expect(result).toBe(true);
  });

  it('should return false when closeAt has not passed and startedAt or duration is not available', () => {
    const player = {
      startedAt: undefined,
      closeAt: new Date(Date.now() + 1000),
      settings: {
        duration: undefined,
      },
    };

    const result = isTimeouted(player);
    expect(result).toBe(false);
  });
});

describe('getClosingTime', () => {
  it('should return startedAt + duration when both are available', () => {
    const player = {
      startedAt: new Date(100000),
      closeAt: undefined,
      settings: {
        duration: 5000,
      },
    };

    const result = getClosingTime(player);
    expect(result).toBe(105000);
  });

  it('should return closeAt when startedAt or duration is not available', () => {
    const player = {
      startedAt: undefined,
      closeAt: new Date(50000),
      settings: {
        duration: undefined,
      },
    };

    const result = getClosingTime(player);
    expect(result).toBe(50000);
  });

  it('should return undefined when startedAt, duration, and closeAt are not available', () => {
    const player = {
      startedAt: undefined,
      closeAt: undefined,
      settings: {
        duration: undefined,
      },
    };

    const result = getClosingTime(player);
    expect(result).toBeNull();
  });
});
