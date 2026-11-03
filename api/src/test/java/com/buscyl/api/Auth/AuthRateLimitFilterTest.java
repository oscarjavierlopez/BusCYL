package com.buscyl.api.Auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.util.concurrent.atomic.AtomicBoolean;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class AuthRateLimitFilterTest {

    @Test
    void blocksTheFourthAuthRequestFromTheSameIp() throws Exception {
        MutableClock clock = new MutableClock(Instant.parse("2026-11-03T10:00:00Z"));
        AuthRateLimitFilter filter = new AuthRateLimitFilter(3, Duration.ofMinutes(15), clock);

        for (int requestNumber = 0; requestNumber < 3; requestNumber++) {
            MockHttpServletResponse response = execute(filter, "/auth/login", "192.0.2.1");
            assertEquals(200, response.getStatus());
        }

        MockHttpServletResponse blockedResponse = execute(filter, "/auth/register", "192.0.2.1");

        assertEquals(429, blockedResponse.getStatus());
        assertEquals("900", blockedResponse.getHeader("Retry-After"));
        assertTrue(blockedResponse.getContentAsString().contains("Demasiadas solicitudes"));
    }

    @Test
    void allowsRequestsAgainAfterTheWindowExpires() throws Exception {
        MutableClock clock = new MutableClock(Instant.parse("2026-11-03T10:00:00Z"));
        AuthRateLimitFilter filter = new AuthRateLimitFilter(3, Duration.ofMinutes(15), clock);

        for (int requestNumber = 0; requestNumber < 3; requestNumber++) {
            execute(filter, "/auth/login", "192.0.2.1");
        }

        clock.advance(Duration.ofMinutes(15));
        MockHttpServletResponse response = execute(filter, "/auth/login", "192.0.2.1");

        assertEquals(200, response.getStatus());
    }

    @Test
    void doesNotLimitCorsPreflightOrRequestsOutsideAuth() throws Exception {
        AuthRateLimitFilter filter = new AuthRateLimitFilter(3, Duration.ofMinutes(15), Clock.systemUTC());

        MockHttpServletResponse optionsResponse = execute(filter, "/auth/login", "192.0.2.1", "OPTIONS");
        MockHttpServletResponse otherRouteResponse = execute(filter, "/roles", "192.0.2.1");

        assertEquals(200, optionsResponse.getStatus());
        assertEquals(200, otherRouteResponse.getStatus());
    }

    private MockHttpServletResponse execute(AuthRateLimitFilter filter, String path, String clientIp) throws Exception {
        return execute(filter, path, clientIp, "POST");
    }

    private MockHttpServletResponse execute(AuthRateLimitFilter filter, String path, String clientIp, String method)
            throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest(method, path);
        request.setRemoteAddr(clientIp);
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean filterChainInvoked = new AtomicBoolean();

        filter.doFilter(request, response, (servletRequest, servletResponse) -> filterChainInvoked.set(true));

        if (response.getStatus() != 429) {
            assertTrue(filterChainInvoked.get());
        }

        return response;
    }

    private static class MutableClock extends Clock {

        private Instant instant;

        private MutableClock(Instant instant) {
            this.instant = instant;
        }

        @Override
        public ZoneId getZone() {
            return ZoneId.of("UTC");
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return instant;
        }

        private void advance(Duration duration) {
            instant = instant.plus(duration);
        }
    }
}
