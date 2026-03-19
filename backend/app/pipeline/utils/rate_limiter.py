from __future__ import annotations

import asyncio
import time
from typing import List


class RateLimiter:
    """Simple async rate limiter using a semaphore with time tracking."""

    def __init__(self, max_calls: int, period: float) -> None:
        """
        Args:
            max_calls: Maximum number of calls allowed in the time window.
            period: Length of the time window in seconds.
        """
        self._max_calls = max_calls
        self._period = period
        self._semaphore = asyncio.Semaphore(max_calls)
        self._timestamps: List[float] = []
        self._lock = asyncio.Lock()

    async def acquire(self) -> None:
        """Block until the rate limit allows another call."""
        while True:
            async with self._lock:
                now = time.monotonic()
                # Purge timestamps older than the window
                self._timestamps = [
                    ts for ts in self._timestamps if now - ts < self._period
                ]
                if len(self._timestamps) < self._max_calls:
                    self._timestamps.append(now)
                    return

                # Calculate how long to wait for the oldest call to expire
                wait_time = self._period - (now - self._timestamps[0])

            if wait_time > 0:
                await asyncio.sleep(wait_time)
