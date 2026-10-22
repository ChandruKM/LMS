package com.lms.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/db/query")
public class DatabaseQueryController {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseQueryController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getTableData(@RequestParam(defaultValue = "employees") String table) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Get all user tables in lms_db
            List<String> tables = jdbcTemplate.queryForList(
                    "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE()",
                    String.class
            );

            if (!tables.contains(table)) {
                response.put("success", false);
                response.put("error", "Table not found: " + table);
                response.put("tables", tables);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            // Safe query because table name is validated against information_schema tables
            List<Map<String, Object>> rows = jdbcTemplate.queryForList("SELECT * FROM " + table + " LIMIT 100");
            Integer totalRows = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + table, Integer.class);

            response.put("success", true);
            response.put("table", table);
            response.put("tables", tables);
            response.put("totalRows", totalRows != null ? totalRows : rows.size());
            response.put("data", rows);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> executeSql(@RequestBody Map<String, String> body) {
        Map<String, Object> response = new HashMap<>();
        String sql = body != null ? body.get("sql") : null;

        if (sql == null || sql.trim().isEmpty()) {
            response.put("success", false);
            response.put("error", "SQL statement is required");
            return ResponseEntity.badRequest().body(response);
        }

        String trimmed = sql.trim().toUpperCase();
        try {
            if (trimmed.startsWith("SELECT") || trimmed.startsWith("SHOW") || trimmed.startsWith("DESC") || trimmed.startsWith("EXPLAIN")) {
                List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);
                response.put("success", true);
                response.put("isSelect", true);
                response.put("rowCount", rows.size());
                response.put("data", rows);
                return ResponseEntity.ok(response);
            } else {
                int affected = jdbcTemplate.update(sql);
                response.put("success", true);
                response.put("isSelect", false);
                response.put("changes", affected);
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
