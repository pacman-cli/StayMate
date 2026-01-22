package com.webapp.auth.config;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test") // Use test profile to avoid strict prod settings if needed, but we want to
                        // check config applied
// Actually SecurityConfig applies generally.
public class SecurityHeadersTest {

  @Autowired
  private MockMvc mockMvc;

  @Test
  public void testSecurityHeadersPresence() throws Exception {
    mockMvc.perform(get("/actuator/health"))
        .andExpect(status().isOk())
        .andExpect(header().exists("X-Content-Type-Options"))
        .andExpect(header().string("X-Content-Type-Options", "nosniff"))
        .andExpect(header().exists("X-Frame-Options"))
        .andExpect(header().string("X-Frame-Options", "SAMEORIGIN"))
        .andExpect(header().exists("X-XSS-Protection"))
        .andExpect(header().string("X-XSS-Protection", "0"));
  }

}
