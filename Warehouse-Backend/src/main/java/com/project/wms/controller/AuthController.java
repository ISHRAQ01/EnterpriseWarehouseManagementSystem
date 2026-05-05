package com.project.wms.controller;

import com.project.wms.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    // GET login (for browser testing)
    @GetMapping("/login")
    public ResponseEntity<Map<String, String>> loginGet(
            @RequestParam String username,
            @RequestParam String password) {
        return authenticate(username, password);
    }

    // POST login (for React frontend)
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> loginPost(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");
        return authenticate(username, password);
    }

    private ResponseEntity<Map<String, String>> authenticate(String username, String password) {
        Map<String, String> response = new HashMap<>();

        if ("admin".equals(username) && "admin123".equals(password)) {
            String token = jwtUtil.generateToken(username, "ROLE_ADMIN");
            response.put("token", token);
            response.put("role", "ADMIN");
            return ResponseEntity.ok(response);
        }
        else if ("manager".equals(username) && "manager123".equals(password)) {
            String token = jwtUtil.generateToken(username, "ROLE_ADMIN");
            response.put("token", token);
            response.put("role", "MANAGER");
            return ResponseEntity.ok(response);
        }
        else if ("operator".equals(username) && "operator123".equals(password)) {
            String token = jwtUtil.generateToken(username, "ROLE_OPERATOR");
            response.put("token", token);
            response.put("role", "OPERATOR");
            return ResponseEntity.ok(response);
        }

        response.put("error", "Invalid credentials");
        return ResponseEntity.status(401).body(response);
    }
}