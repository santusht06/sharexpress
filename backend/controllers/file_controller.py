# CIRCUIT BREAKER
# RETRY LOGIC
# RATE LIMITER
# QUOTA MANAGER
# SEMAPHORE
# VALIDATION LAYER
# VERIFICATION STEP
# METRICS

import functools
import asyncio
import time


class CircuitBreaker:
    def __init__(self, failure_threshold=5, recovery_timeout=60):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout

        self.failure_count = 0
        self.last_failure_time = None
        self.state = "CLOSED"

        self._lock = asyncio.Lock()

    async def call(self, func, *args, **kwargs):
        async with self._lock:
            # If OPEN → check if we can move to HALF_OPEN
            if self.state == "OPEN":
                if time.time() - self.last_failure_time > self.recovery_timeout:
                    self.state = "HALF_OPEN"
                else:
                    raise Exception("Circuit is OPEN")

        try:
            result = await func(*args, **kwargs)

            async with self._lock:
                # If HALF_OPEN success → reset
                if self.state == "HALF_OPEN":
                    self.state = "CLOSED"
                    self.failure_count = 0

            return result

        except Exception as e:
            async with self._lock:
                self.failure_count += 1
                self.last_failure_time = time.time()

                if self.failure_count >= self.failure_threshold:
                    self.state = "OPEN"

            raise e


def async_retry(
    max_attempts=3,
    delay=1,
    backoff=2,
    allowed_exceptions=(Exception,),
):
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            attempt = 0
            current_delay = delay

            while attempt < max_attempts:
                try:
                    return await func(*args, **kwargs)

                except allowed_exceptions as e:
                    attempt += 1

                    if attempt >= max_attempts:
                        raise e

                    await asyncio.sleep(current_delay)
                    current_delay *= backoff

        return wrapper

    return decorator
