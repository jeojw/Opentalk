package com.example.opentalk.Component;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;

@Slf4j
@Component
public class FCMInitializer {
    @Value("${fcm.service-account-file}")
    private String googleApplicationCredentials;

    @PostConstruct
    public void initialize() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                ClassPathResource resource = new ClassPathResource(googleApplicationCredentials);
                try (InputStream is = resource.getInputStream()) {
                    FirebaseOptions options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.fromStream(is))
                            .build();

                    FirebaseApp.initializeApp(options);
                    log.info("FirebaseApp initialization complete");
                }
            } else {
                log.info("FirebaseApp is already initialized");
            }
        } catch (IOException e) {
            log.error("Error initializing FirebaseApp: {}", e.getMessage());
        }
    }
}
