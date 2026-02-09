
import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.io.OutputStream;
import java.io.InputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.io.BufferedReader;
import java.io.InputStreamReader;

public class SimpleServer {

    // Simple in-memory user storage
    private static List<User> users = new ArrayList<>();

    public static void main(String[] args) throws IOException {
        int port = 8080;
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        
        server.createContext("/signup", new SignupHandler());
        server.createContext("/login", new LoginHandler());
        
        server.setExecutor(null); // creates a default executor
        System.out.println("Server started on port " + port);
        server.start();
    }

    static class User {
        String name;
        String email;
        String password;
        String role;

        User(String name, String email, String password, String role) {
            this.name = name;
            this.email = email;
            this.password = password;
            this.role = role;
        }
    }

    // Helper to read JSON body simply (assuming flat JSON)
    private static String getBody(HttpExchange exchange) throws IOException {
        InputStream is = exchange.getRequestBody();
        BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
        StringBuilder body = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            body.append(line);
        }
        return body.toString();
    }
    
    // Helper to send response with CORS headers
    private static void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }
    
    // Handle OPTIONS requests for CORS
    private static void handleOptions(HttpExchange exchange) throws IOException {
        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
            exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
            exchange.sendResponseHeaders(204, -1);
            return;
        }
    }

    static class SignupHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            handleOptions(exchange);
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) return;

            String body = getBody(exchange);
            // Manual JSON parsing (very basic)
            String name = extractJsonValue(body, "name");
            String email = extractJsonValue(body, "email");
            String password = extractJsonValue(body, "password");
            String role = extractJsonValue(body, "role");

            if (name == null || email == null || password == null || role == null) {
                sendResponse(exchange, 400, "{\"message\": \"Missing fields\"}");
                return;
            }

            // Check if user exists
            for (User u : users) {
                if (u.email.equals(email)) {
                    sendResponse(exchange, 400, "{\"message\": \"User already exists\"}");
                    return;
                }
            }

            users.add(new User(name, email, password, role));
            System.out.println("New user registered: " + email + " as " + role);
            sendResponse(exchange, 201, "{\"message\": \"User registered successfully\"}");
        }
    }

    static class LoginHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            handleOptions(exchange);
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) return;

            String body = getBody(exchange);
            String email = extractJsonValue(body, "email");
            String password = extractJsonValue(body, "password");

            for (User u : users) {
                if (u.email.equals(email) && u.password.equals(password)) {
                    sendResponse(exchange, 200, "{\"message\": \"Login successful\", \"name\": \"" + u.name + "\", \"role\": \"" + u.role + "\"}");
                    return;
                }
            }

            sendResponse(exchange, 401, "{\"message\": \"Invalid credentials\"}");
        }
    }
    
    // Very naive JSON parser for "key": "value" strings
    private static String extractJsonValue(String json, String key) {
        String search = "\"" + key + "\":";
        int start = json.indexOf(search);
        if (start == -1) return null;
        
        start += search.length();
        while (start < json.length() && (json.charAt(start) == ' ' || json.charAt(start) == '"')) {
            start++;
        }
        
        int end = json.indexOf("\"", start);
        if (end == -1) return null;
        
        return json.substring(start, end);
    }
}
