package com.buscyl.api.Auth;

import java.io.IOException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class AuthRateLimitFilter extends OncePerRequestFilter {

    private final int maxRequests;
    private final Duration window;
    private final Clock clock;
    private final Map<String, Deque<Instant>> requestsByIp = new ConcurrentHashMap<>();
    private final AtomicLong nextCleanupAtMillis = new AtomicLong();

    @Autowired
    public AuthRateLimitFilter(
            @Value("${buscyl.auth.rate-limit.max-requests:3}") int maxRequests,
            @Value("${buscyl.auth.rate-limit.window:PT15M}") Duration window) {
        this(maxRequests, window, Clock.systemUTC());
    }

    AuthRateLimitFilter(int maxRequests, Duration window, Clock clock) {
        if (maxRequests < 1) {
            throw new IllegalArgumentException("El límite de peticiones debe ser mayor que cero");
        }

        if (window.isZero() || window.isNegative()) {
            throw new IllegalArgumentException("La ventana de tiempo debe ser mayor que cero");
        }

        this.maxRequests = maxRequests;
        this.window = window;
        this.clock = clock;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return !(path.equals("/auth") || path.startsWith("/auth/"))
                || "OPTIONS".equalsIgnoreCase(request.getMethod());
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        Instant now = clock.instant();
        removeExpiredEntries(now);

        String clientIp = request.getRemoteAddr();
        Deque<Instant> requestTimes = requestsByIp.computeIfAbsent(clientIp, ignored -> new ArrayDeque<>());

        synchronized (requestTimes) {
            removeExpiredRequestTimes(requestTimes, now);

            if (requestTimes.size() >= maxRequests) {
                long retryAfterSeconds = Math.max(1, Duration.between(now, requestTimes.peekFirst().plus(window)).toSeconds());
                writeRateLimitResponse(response, retryAfterSeconds);
                return;
            }

            requestTimes.addLast(now);
        }

        filterChain.doFilter(request, response);
    }

    private void removeExpiredEntries(Instant now) {
        long nowMillis = now.toEpochMilli();
        long nextCleanup = nextCleanupAtMillis.get();

        if (nowMillis < nextCleanup || !nextCleanupAtMillis.compareAndSet(nextCleanup, nowMillis + window.toMillis())) {
            return;
        }

        requestsByIp.forEach((clientIp, requestTimes) -> {
            synchronized (requestTimes) {
                removeExpiredRequestTimes(requestTimes, now);
                if (requestTimes.isEmpty()) {
                    requestsByIp.remove(clientIp, requestTimes);
                }
            }
        });
    }

    private void removeExpiredRequestTimes(Deque<Instant> requestTimes, Instant now) {
        Instant oldestAllowedRequest = now.minus(window);

        while (!requestTimes.isEmpty() && !requestTimes.peekFirst().isAfter(oldestAllowedRequest)) {
            requestTimes.removeFirst();
        }
    }

    private void writeRateLimitResponse(HttpServletResponse response, long retryAfterSeconds) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.setHeader(HttpHeaders.RETRY_AFTER, Long.toString(retryAfterSeconds));
        response.getWriter().write("{\"message\":\"Demasiadas solicitudes. Inténtalo de nuevo más tarde.\"}");
    }
}
