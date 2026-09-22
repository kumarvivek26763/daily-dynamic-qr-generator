import { QRConfig } from '../types';

export function generateJavaSourceCode(config: QRConfig, localFolderPath: string = './qr_codes'): string {
  const prefix = config.prefix || '602062';
  const suffix = config.suffix || 'student';
  const separator = config.separator || '/';
  const folder = localFolderPath.replace(/\\/g, '/');

  return `package com.example.qr;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Daily Automated QR Code Generator in Java
 * Dynamically updates text string by date: \${PREFIX}/\${DATE}/\${SUFFIX}
 * e.g. "${prefix}/2026-09-22/${suffix}" -> "${prefix}/2026-09-23/${suffix}"
 * Automatically writes PNG images to a designated local folder.
 */
public class DailyQRGenerator {

    // Configuration parameters
    private static final String PREFIX = "${prefix}";
    private static final String SUFFIX = "${suffix}";
    private static final String SEPARATOR = "${separator}";
    private static final String OUTPUT_DIR = "${folder}";
    private static final int QR_SIZE = ${config.size || 350}; // width and height in pixels

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public static void main(String[] args) {
        System.out.println("=== Daily Dynamic QR Code Generator ===");
        System.out.println("Prefix: " + PREFIX);
        System.out.println("Suffix: " + SUFFIX);
        System.out.println("Output Folder: " + OUTPUT_DIR);

        // 1. Ensure target directory exists
        createDirectoryIfNotExists(OUTPUT_DIR);

        // 2. Generate Today's QR immediately on start
        generateTodayQR();

        // 3. Optional: Run batch date loop for the upcoming 7 days
        System.out.println("\\n--- Running Batch Date Loop (Next 7 Days) ---");
        generateBatchLoop(LocalDate.now(), 7);

        // 4. Start the Daily Automatic Scheduler (updates dynamically each morning at 00:00:00)
        System.out.println("\\n--- Starting Daily Automatic Background Scheduler ---");
        startMorningScheduler();
    }

    /**
     * Generates a single QR Code for the current day
     */
    public static void generateTodayQR() {
        LocalDate today = LocalDate.now();
        generateForDate(today);
    }

    /**
     * Generates a QR Code for a specific date and saves to local folder
     */
    public static void generateForDate(LocalDate date) {
        String dateStr = date.format(DATE_FORMATTER);
        String dynamicContent = PREFIX + SEPARATOR + dateStr + SEPARATOR + SUFFIX;
        String fileName = "qr_" + PREFIX + "_" + dateStr + ".png";
        Path targetPath = Paths.get(OUTPUT_DIR, fileName);

        try {
            generateQRCodeImage(dynamicContent, QR_SIZE, QR_SIZE, targetPath);
            System.out.println("[SUCCESS] Generated QR: " + dynamicContent + " -> " + targetPath.toAbsolutePath());
        } catch (WriterException | IOException e) {
            System.err.println("[ERROR] Failed to generate QR for " + dateStr + ": " + e.getMessage());
        }
    }

    /**
     * Loops through a date range and exports QR images for each day into the local folder
     *
     * @param startDate Starting date
     * @param daysCount Number of consecutive days
     */
    public static void generateBatchLoop(LocalDate startDate, int daysCount) {
        for (int i = 0; i < daysCount; i++) {
            LocalDate targetDate = startDate.plusDays(i);
            generateForDate(targetDate);
        }
        System.out.println("[DONE] Batch loop completed for " + daysCount + " days.");
    }

    /**
     * Schedules a task to run automatically every midnight (or morning),
     * dynamically generating the new QR code for that day.
     */
    public static void startMorningScheduler() {
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

        // Compute delay until the next midnight (00:00:00)
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime nextMidnight = now.toLocalDate().plusDays(1).atStartOfDay();
        long initialDelaySeconds = Duration.between(now, nextMidnight).getSeconds();
        long periodSeconds = TimeUnit.DAYS.toSeconds(1); // 24 hours

        System.out.println("Scheduler armed! Next run in: " + (initialDelaySeconds / 3600) + "h " 
                + ((initialDelaySeconds % 3600) / 60) + "m (" + nextMidnight + ")");

        scheduler.scheduleAtFixedRate(() -> {
            System.out.println("\\n[SCHEDULED TRIGGER] Morning arrived at " + LocalDateTime.now());
            generateTodayQR();
        }, initialDelaySeconds, periodSeconds, TimeUnit.SECONDS);
    }

    /**
     * Core ZXing QR Code image generation and file writing
     */
    public static void generateQRCodeImage(String text, int width, int height, Path filePath)
            throws WriterException, IOException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();

        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
        hints.put(EncodeHintType.MARGIN, 2);
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");

        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height, hints);
        MatrixToImageWriter.writeToPath(bitMatrix, "PNG", filePath);
    }

    private static void createDirectoryIfNotExists(String dirPath) {
        try {
            Files.createDirectories(Paths.get(dirPath));
        } catch (IOException e) {
            System.err.println("Could not create directory " + dirPath + ": " + e.getMessage());
        }
    }
}
`;
}

export function generatePomXml(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>daily-qr-generator</artifactId>
    <version>1.0.0</version>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <zxing.version>3.5.3</zxing.version>
    </properties>

    <dependencies>
        <!-- ZXing Core Library for QR Code Encoding -->
        <dependency>
            <groupId>com.google.zxing</groupId>
            <artifactId>core</artifactId>
            <version>\${zxing.version}</version>
        </dependency>

        <!-- ZXing JavaSE integration to save BitMatrix to PNG image files -->
        <dependency>
            <groupId>com.google.zxing</groupId>
            <artifactId>javase</artifactId>
            <version>\${zxing.version}</version>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.codehaus.mojo</groupId>
                <artifactId>exec-maven-plugin</artifactId>
                <version>3.1.0</version>
                <configuration>
                    <mainClass>com.example.qr.DailyQRGenerator</mainClass>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
`;
}
